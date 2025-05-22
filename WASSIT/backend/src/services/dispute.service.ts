/**
 * خدمة إدارة النزاعات
 * هذه الخدمة تتعامل مع إنشاء وإدارة النزاعات بين العملاء ومقدمي الخدمات
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { DisputeStatus, RequestStatus } from '../types';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

/**
 * إنشاء نزاع جديد
 * @param requestId معرف الطلب
 * @param clientId معرف العميل
 * @param providerId معرف مقدم الخدمة
 * @param reason سبب النزاع
 * @returns النزاع الذي تم إنشاؤه
 */
export async function createDispute(
  requestId: number,
  clientId: number,
  providerId: number,
  reason: string
) {
  // التحقق من عدم وجود نزاع سابق على نفس الطلب
  const existingDispute = await prisma.dispute.findUnique({
    where: {
      requestId,
    },
  });

  if (existingDispute) {
    throw new Error('يوجد بالفعل نزاع على هذا الطلب');
  }

  // إنشاء النزاع
  const dispute = await prisma.dispute.create({
    data: {
      requestId,
      clientId,
      providerId,
      reason,
      status: 'OPEN', // استخدام النص مباشرة بدلاً من التعداد
    },
  });

  // تحديث حالة الطلب إلى "نزاع"
  await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status: RequestStatus.DISPUTE,
    },
  });

  // إرسال إشعارات للمشرفين ومقدم الخدمة
  await notificationService.sendAdminDisputeNotification(
    dispute.id,
    requestId,
    reason
  );

  await notificationService.sendUserNotification(
    providerId,
    notificationService.NotificationType.NEW_DISPUTE,
    'تم فتح نزاع حول طلب',
    `تم فتح نزاع حول الطلب رقم ${requestId}. يرجى مراجعة تفاصيل النزاع.`,
    { disputeId: dispute.id, requestId }
  );

  return dispute;
}

/**
 * الحصول على تفاصيل نزاع
 * @param disputeId معرف النزاع
 * @returns تفاصيل النزاع مع العلاقات ذات الصلة
 */
export async function getDisputeDetails(disputeId: number) {
  const dispute = await prisma.dispute.findUnique({
    where: {
      id: disputeId,
    },
    include: {
      request: {
        include: {
          service: true,
          offers: {
            where: {
              status: 'ACCEPTED',
            },
          },
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!dispute) {
    throw new Error('النزاع غير موجود');
  }

  return dispute;
}

/**
 * تحديث حالة النزاع إلى قيد المراجعة
 * @param disputeId معرف النزاع
 * @returns النزاع بعد تحديثه
 */
export async function updateDisputeToInReview(disputeId: number) {
  const dispute = await prisma.dispute.findUnique({
    where: {
      id: disputeId,
    },
  });

  if (!dispute) {
    throw new Error('النزاع غير موجود');
  }

  if (dispute.status !== 'OPEN') {
    throw new Error('يمكن تحديث حالة النزاع فقط عندما يكون مفتوحًا');
  }

  return prisma.dispute.update({
    where: { id: disputeId },
    data: { status: 'IN_REVIEW' }
  });
}

/**
 * حل النزاع
 * @param disputeId معرف النزاع
 * @param resolution قرار الحل
 * @param status حالة النزاع بعد الحل
 * @param refundAmount مبلغ الاسترداد (إذا كان هناك استرداد جزئي)
 * @param refundPercentage نسبة الاسترداد (إذا كان هناك استرداد جزئي)
 * @returns النزاع بعد تحديثه
 */
export async function resolveDispute(
  disputeId: number,
  resolution: string,
  status: DisputeStatus = DisputeStatus.RESOLVED_CLIENT,
  refundAmount?: number,
  refundPercentage?: number
) {
  // الحصول على النزاع مع تفاصيل الطلب
  const dispute = await prisma.dispute.findUnique({
    where: {
      id: disputeId,
    },
    include: {
      request: true,
    },
  });

  if (!dispute) {
    throw new Error('النزاع غير موجود');
  }

  if (dispute.status !== 'OPEN' && dispute.status !== 'IN_REVIEW') {
    throw new Error('لا يمكن حل النزاع لأنه ليس مفتوحًا أو قيد المراجعة');
  }

  // تحديث النزاع
  const updatedDispute = await prisma.dispute.update({
    where: {
      id: disputeId,
    },
    data: {
      status: status as string, // تحويل إلى نص
      resolution,
    },
  });

  // تحديث حالة الطلب حسب قرار النزاع
  let requestStatus: RequestStatus;
  
  switch (status) {
    case DisputeStatus.RESOLVED_CLIENT:
      requestStatus = RequestStatus.CANCELED;
      break;
    case DisputeStatus.RESOLVED_PROVIDER:
      requestStatus = RequestStatus.COMPLETED;
      break;
    case DisputeStatus.RESOLVED_PARTIAL:
      requestStatus = RequestStatus.COMPLETED;
      break;
    case DisputeStatus.CANCELED:
      requestStatus = RequestStatus.IN_PROGRESS;
      break;
    default:
      requestStatus = RequestStatus.IN_PROGRESS;
  }

  await prisma.request.update({
    where: {
      id: dispute.requestId,
    },
    data: {
      status: requestStatus,
    },
  });

  // إرسال إشعارات للعميل ومقدم الخدمة
  await notificationService.sendUserNotification(
    dispute.clientId,
    notificationService.NotificationType.DISPUTE_RESOLVED,
    'تم حل النزاع',
    `تم حل النزاع حول الطلب رقم ${dispute.requestId}.`,
    { disputeId, requestId: dispute.requestId, resolution, status }
  );

  await notificationService.sendUserNotification(
    dispute.providerId,
    notificationService.NotificationType.DISPUTE_RESOLVED,
    'تم حل النزاع',
    `تم حل النزاع حول الطلب رقم ${dispute.requestId}.`,
    { disputeId, requestId: dispute.requestId, resolution, status }
  );

  return updatedDispute;
} 