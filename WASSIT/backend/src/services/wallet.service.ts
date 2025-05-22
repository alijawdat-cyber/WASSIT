/**
 * خدمة المحفظة - Wallet Service
 */

import { PrismaClient } from '@prisma/client';
import { WalletDTO, TransactionDTO, TransactionCreateDTO, TransactionType, TransactionStatus, TransactionFilterParams } from '../types';
import { ApiError } from '../utils/apiResponse';

const prisma = new PrismaClient();

/**
 * الحصول على محفظة المستخدم أو إنشاء محفظة جديدة إذا لم تكن موجودة
 * @param userId معرف المستخدم
 */
export async function getOrCreateWallet(userId: number): Promise<WalletDTO> {
  // البحث عن محفظة المستخدم
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { user: true }
  });

  // إنشاء محفظة جديدة إذا لم تكن موجودة
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        availableBalance: 0,
        currency: 'IQD', // الدينار العراقي
        isActive: true
      },
      include: { user: true }
    });
  }

  return wallet;
}

/**
 * تحديث رصيد المحفظة
 * @param walletId معرف المحفظة
 * @param amount المبلغ المراد إضافته (موجب) أو خصمه (سالب)
 * @param updateAvailableBalance تحديث الرصيد المتاح أيضًا
 */
export async function updateWalletBalance(
  walletId: number,
  amount: number,
  updateAvailableBalance: boolean = true
): Promise<WalletDTO> {
  // الحصول على المحفظة
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId }
  });

  if (!wallet) {
    throw new Error('المحفظة غير موجودة');
  }

  // حساب الرصيد الجديد
  const newBalance = Number(wallet.balance) + amount;
  
  // التحقق من عدم وجود رصيد سالب
  if (newBalance < 0) {
    throw new Error('رصيد غير كافٍ');
  }

  // حساب الرصيد المتاح الجديد إذا كان التحديث مطلوبًا
  const newAvailableBalance = updateAvailableBalance 
    ? Number(wallet.availableBalance) + amount 
    : Number(wallet.availableBalance);

  // تحديث المحفظة
  const updatedWallet = await prisma.wallet.update({
    where: { id: walletId },
    data: {
      balance: newBalance,
      availableBalance: newAvailableBalance,
    },
    include: { user: true }
  });

  return updatedWallet;
}

/**
 * إنشاء معاملة جديدة
 * @param transactionData بيانات المعاملة
 */
export async function createTransaction(
  transactionData: TransactionCreateDTO
): Promise<TransactionDTO> {
  // التحقق من وجود المحفظة
  const wallet = await prisma.wallet.findUnique({
    where: { id: transactionData.walletId }
  });

  if (!wallet) {
    throw new Error('المحفظة غير موجودة');
  }

  // إنشاء المعاملة
  const transaction = await prisma.transaction.create({
    data: {
      userId: transactionData.userId,
      walletId: transactionData.walletId,
      type: transactionData.type,
      amount: transactionData.amount,
      status: transactionData.status || TransactionStatus.COMPLETED,
      reference: transactionData.reference,
      requestId: transactionData.requestId,
      offerId: transactionData.offerId,
      disputeId: transactionData.disputeId,
      description: transactionData.description,
      metadata: transactionData.metadata ? JSON.stringify(transactionData.metadata) : null,
    },
    include: {
      user: true,
      wallet: true,
      request: true,
      offer: true,
      dispute: true,
    }
  });

  // تحديث رصيد المحفظة حسب نوع المعاملة
  if (transaction.status === TransactionStatus.COMPLETED) {
    let updateAmount = 0;
    let updateAvailableBalance = true;

    switch (transaction.type) {
      case TransactionType.DEPOSIT:
        updateAmount = Number(transaction.amount);
        break;
      case TransactionType.WITHDRAWAL:
        updateAmount = -Number(transaction.amount);
        break;
      case TransactionType.ESCROW_HOLD:
        updateAmount = 0; // لا يغير الرصيد الكلي
        updateAvailableBalance = false; // يتم خصم المبلغ من الرصيد المتاح فقط
        await updateWalletBalance(wallet.id, -Number(transaction.amount), true);
        break;
      case TransactionType.ESCROW_RELEASE:
      case TransactionType.DISPUTE_RELEASE:
        updateAmount = 0; // الرصيد الكلي لا يتغير
        updateAvailableBalance = false; // قد تم حجز المبلغ مسبقًا
        break;
      case TransactionType.ESCROW_REFUND:
      case TransactionType.DISPUTE_REFUND:
        updateAmount = 0; // الرصيد الكلي لا يتغير
        updateAvailableBalance = true; // إعادة المبلغ إلى الرصيد المتاح
        await updateWalletBalance(wallet.id, Number(transaction.amount), true);
        break;
      case TransactionType.PLATFORM_FEE:
        updateAmount = -Number(transaction.amount);
        break;
      default:
        break;
    }

    if (updateAmount !== 0) {
      await updateWalletBalance(wallet.id, updateAmount, updateAvailableBalance);
    }
  }

  return transaction;
}

/**
 * الحصول على معاملات المستخدم
 * @param userId معرف المستخدم
 * @param filters معايير التصفية
 */
export async function getUserTransactions(
  userId: number,
  filters: TransactionFilterParams = {}
): Promise<{ transactions: TransactionDTO[], pagination: any }> {
  const { page = 1, limit = 10, type, status, startDate, endDate } = filters;
  const skip = (page - 1) * limit;
  
  // بناء شروط البحث
  const where: any = { userId };
  
  // إضافة شرط نوع المعاملة إذا تم تحديده
  if (type) {
    where.type = type;
  }
  
  // إضافة شرط حالة المعاملة إذا تم تحديده
  if (status) {
    where.status = status;
  }
  
  // إضافة شرط التاريخ إذا تم تحديده
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }
  
  // استعلام قاعدة البيانات
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        user: true,
        wallet: true,
        request: true,
        offer: true,
        dispute: true,
      }
    }),
    prisma.transaction.count({ where })
  ]);
  
  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * الحصول على المعاملة حسب المعرف
 * @param transactionId معرف المعاملة
 */
export async function getTransactionById(transactionId: number): Promise<TransactionDTO> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: true,
      wallet: true,
      request: true,
      offer: true,
      dispute: true,
    }
  });

  if (!transaction) {
    throw new Error('المعاملة غير موجودة');
  }

  return transaction;
}

/**
 * تحديث حالة المعاملة
 * @param transactionId معرف المعاملة
 * @param status الحالة الجديدة
 */
export async function updateTransactionStatus(
  transactionId: number,
  status: TransactionStatus
): Promise<TransactionDTO> {
  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: { status },
    include: {
      user: true,
      wallet: true,
      request: true,
      offer: true,
      dispute: true,
    }
  });

  return transaction;
} 