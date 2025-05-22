/**
 * خدمة Escrow لإدارة المدفوعات
 */

import { PrismaClient } from '@prisma/client';
import { RequestStatus, TransactionType, TransactionStatus } from '../types';
import * as walletService from './wallet.service';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

/**
 * حجز مبلغ في Escrow
 * @param requestId معرف الطلب
 * @param amount المبلغ المراد حجزه
 * @returns عملية ناجحة مع الطلب المُحدّث
 */
export async function lockAmount(requestId: number, amount: number) {
  // الحصول على معلومات الطلب
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { client: true, service: true }
  });

  if (!request) {
    throw new Error('الطلب غير موجود');
  }

  // تحديث حالة الطلب وإضافة المبلغ المحجوز
  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      escrowAmount: amount,
      status: RequestStatus.IN_PROGRESS,
    },
    include: { client: true, service: true }
  });

  // الحصول على محفظة العميل
  const wallet = await walletService.getOrCreateWallet(request.clientId);

  // إنشاء معاملة حجز المبلغ
  const transaction = await walletService.createTransaction({
    userId: request.clientId,
    walletId: wallet.id,
    type: TransactionType.ESCROW_HOLD,
    amount,
    status: TransactionStatus.COMPLETED,
    requestId,
    description: `حجز مبلغ للطلب #${requestId} - ${request.service.name}`,
  });

  // إرسال إشعار للعميل
  await notificationService.sendUserNotification(
    request.clientId,
    notificationService.NotificationType.PAYMENT_RELEASED,
    'تم حجز المبلغ بنجاح',
    `تم حجز مبلغ ${amount} للطلب #${requestId} بنجاح.`,
    requestId,
    'request'
  );
  
  return {
    success: true,
    transaction,
    request: updatedRequest,
  };
}

/**
 * فك حجز المبلغ وتحويله إلى مقدم الخدمة
 * @param requestId معرف الطلب
 * @param providerId معرف مقدم الخدمة
 * @returns عملية ناجحة مع الطلب المُحدّث
 */
export async function releaseAmount(requestId: number, providerId: number) {
  // الحصول على تفاصيل الطلب والعرض
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    include: {
      client: true,
      service: true,
      offers: {
        where: {
          providerId,
          status: 'ACCEPTED',
        },
      },
    },
  });

  if (!request || !request.escrowAmount || request.offers.length === 0) {
    throw new Error('الطلب غير موجود أو المبلغ غير محجوز أو العرض غير مقبول');
  }

  // تحديث حالة الطلب
  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status: RequestStatus.COMPLETED,
      // لا نريد حذف قيمة المبلغ المحجوز للاحتفاظ بتاريخ العملية
    },
    include: { client: true, service: true }
  });

  // الحصول على محفظة مقدم الخدمة
  const providerWallet = await walletService.getOrCreateWallet(providerId);

  // إنشاء معاملة إطلاق المبلغ لمقدم الخدمة
  const transaction = await walletService.createTransaction({
    userId: providerId,
    walletId: providerWallet.id,
    type: TransactionType.ESCROW_RELEASE,
    amount: request.escrowAmount,
    status: TransactionStatus.COMPLETED,
    requestId,
    offerId: request.offers[0].id,
    description: `تحرير مبلغ للطلب #${requestId} - ${request.service.name}`,
  });

  // إرسال إشعار لمقدم الخدمة
  await notificationService.sendUserNotification(
    providerId,
    notificationService.NotificationType.PAYMENT_RELEASED,
    'تم تحرير المبلغ',
    `تم تحرير مبلغ ${request.escrowAmount} للطلب #${requestId} إلى حسابك.`,
    requestId,
    'request'
  );

  // إرسال إشعار للعميل
  await notificationService.sendUserNotification(
    request.clientId,
    notificationService.NotificationType.PAYMENT_RELEASED,
    'تم إكمال الدفع',
    `تم تحرير المبلغ المحجوز للطلب #${requestId} لمقدم الخدمة.`,
    requestId,
    'request'
  );
  
  return {
    success: true,
    transaction,
    request: updatedRequest,
  };
}

/**
 * إلغاء الحجز وإعادة المبلغ للعميل
 * @param requestId معرف الطلب
 * @returns عملية ناجحة مع الطلب المُحدّث
 */
export async function refundAmount(requestId: number) {
  // الحصول على تفاصيل الطلب
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    include: { client: true, service: true }
  });

  if (!request || !request.escrowAmount) {
    throw new Error('الطلب غير موجود أو المبلغ غير محجوز');
  }

  // تحديث حالة الطلب
  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status: RequestStatus.CANCELED,
      // لا نريد حذف قيمة المبلغ المحجوز للاحتفاظ بتاريخ العملية
    },
    include: { client: true, service: true }
  });

  // الحصول على محفظة العميل
  const clientWallet = await walletService.getOrCreateWallet(request.clientId);

  // إنشاء معاملة إعادة المبلغ للعميل
  const transaction = await walletService.createTransaction({
    userId: request.clientId,
    walletId: clientWallet.id,
    type: TransactionType.ESCROW_REFUND,
    amount: request.escrowAmount,
    status: TransactionStatus.COMPLETED,
    requestId,
    description: `إعادة مبلغ للطلب #${requestId} - ${request.service.name}`,
  });

  // إرسال إشعار للعميل
  await notificationService.sendUserNotification(
    request.clientId,
    notificationService.NotificationType.PAYMENT_RELEASED,
    'تم إعادة المبلغ',
    `تم إعادة مبلغ ${request.escrowAmount} للطلب #${requestId} إلى حسابك.`,
    requestId,
    'request'
  );
  
  return {
    success: true,
    transaction,
    request: updatedRequest,
  };
} 