/**
 * خدمة طلبات السحب - Withdrawal Service
 */

import { PrismaClient } from '@prisma/client';
import { WithdrawalRequestDTO, WithdrawalRequestCreateDTO, WithdrawalStatus, WithdrawalFilterParams } from '../types';
import * as walletService from './wallet.service';
import { TransactionType, TransactionStatus } from '../types';

const prisma = new PrismaClient();

/**
 * إنشاء طلب سحب جديد
 * @param withdrawalData بيانات طلب السحب
 */
export async function createWithdrawalRequest(
  withdrawalData: WithdrawalRequestCreateDTO
): Promise<WithdrawalRequestDTO> {
  // التحقق من وجود المستخدم ومحفظته
  const wallet = await walletService.getOrCreateWallet(withdrawalData.userId);
  
  // التحقق من كفاية الرصيد المتاح
  if (Number(wallet.availableBalance) < Number(withdrawalData.amount)) {
    throw new Error('رصيد غير كافٍ');
  }
  
  // تحويل paymentDetails إلى نص إذا كان كائنًا
  const paymentDetailsString = typeof withdrawalData.paymentDetails === 'object'
    ? JSON.stringify(withdrawalData.paymentDetails)
    : withdrawalData.paymentDetails;
  
  // إنشاء طلب السحب
  const withdrawalRequest = await prisma.withdrawalRequest.create({
    data: {
      userId: withdrawalData.userId,
      amount: withdrawalData.amount,
      status: WithdrawalStatus.PENDING,
      paymentMethod: withdrawalData.paymentMethod,
      paymentDetails: paymentDetailsString,
      notes: withdrawalData.notes,
    },
    include: {
      user: true,
    }
  });
  
  return withdrawalRequest;
}

/**
 * الحصول على طلبات السحب الخاصة بالمستخدم
 * @param userId معرف المستخدم
 * @param filters معايير التصفية
 */
export async function getUserWithdrawalRequests(
  userId: number,
  filters: WithdrawalFilterParams = {}
): Promise<{ withdrawalRequests: WithdrawalRequestDTO[], pagination: any }> {
  const { page = 1, limit = 10, status, startDate, endDate } = filters;
  const skip = (page - 1) * limit;
  
  // بناء شروط البحث
  const where: any = { userId };
  
  // إضافة شرط حالة الطلب إذا تم تحديده
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
  const [withdrawalRequests, total] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        user: true,
        transaction: true,
      }
    }),
    prisma.withdrawalRequest.count({ where })
  ]);
  
  return {
    withdrawalRequests,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * الحصول على كل طلبات السحب (للمشرف)
 * @param filters معايير التصفية
 */
export async function getAllWithdrawalRequests(
  filters: WithdrawalFilterParams = {}
): Promise<{ withdrawalRequests: WithdrawalRequestDTO[], pagination: any }> {
  const { page = 1, limit = 10, status, userId, startDate, endDate } = filters;
  const skip = (page - 1) * limit;
  
  // بناء شروط البحث
  const where: any = {};
  
  // إضافة شرط حالة الطلب إذا تم تحديده
  if (status) {
    where.status = status;
  }
  
  // إضافة شرط المستخدم إذا تم تحديده
  if (userId) {
    where.userId = userId;
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
  const [withdrawalRequests, total] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        user: true,
        transaction: true,
      }
    }),
    prisma.withdrawalRequest.count({ where })
  ]);
  
  return {
    withdrawalRequests,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * تحديث حالة طلب السحب
 * @param withdrawalId معرف طلب السحب
 * @param status الحالة الجديدة
 * @param adminNotes ملاحظات المشرف (اختياري)
 */
export async function updateWithdrawalStatus(
  withdrawalId: number,
  status: WithdrawalStatus,
  adminNotes?: string
): Promise<WithdrawalRequestDTO> {
  // الحصول على طلب السحب
  const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
    include: { user: true }
  });
  
  if (!withdrawalRequest) {
    throw new Error('طلب السحب غير موجود');
  }
  
  // لا يمكن تحديث طلب تم معالجته مسبقًا
  if (withdrawalRequest.status === WithdrawalStatus.PROCESSED || 
      withdrawalRequest.status === WithdrawalStatus.REJECTED) {
    throw new Error('لا يمكن تحديث طلب تم معالجته مسبقًا');
  }
  
  // إنشاء كائن التحديث
  const updateData: any = { status };
  
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }
  
  // إذا تمت الموافقة على الطلب ومعالجته
  if (status === WithdrawalStatus.PROCESSED) {
    // التحقق من وجود محفظة للمستخدم
    const wallet = await walletService.getOrCreateWallet(withdrawalRequest.userId);
    
    // إنشاء معاملة سحب
    const transaction = await walletService.createTransaction({
      userId: withdrawalRequest.userId,
      walletId: wallet.id,
      type: TransactionType.WITHDRAWAL,
      amount: withdrawalRequest.amount,
      status: TransactionStatus.COMPLETED,
      description: `طلب سحب #${withdrawalId}`,
      metadata: {
        withdrawalRequestId: withdrawalId,
        paymentMethod: withdrawalRequest.paymentMethod,
      }
    });
    
    // ربط المعاملة بطلب السحب
    updateData.transactionId = transaction.id;
  }
  
  // تحديث طلب السحب
  const updatedWithdrawalRequest = await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: updateData,
    include: {
      user: true,
      transaction: true,
    }
  });
  
  return updatedWithdrawalRequest;
}

/**
 * الحصول على طلب سحب حسب المعرف
 * @param withdrawalId معرف طلب السحب
 */
export async function getWithdrawalById(withdrawalId: number): Promise<WithdrawalRequestDTO> {
  const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
    include: {
      user: true,
      transaction: true,
    }
  });
  
  if (!withdrawalRequest) {
    throw new Error('طلب السحب غير موجود');
  }
  
  return withdrawalRequest;
} 