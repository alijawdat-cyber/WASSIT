/**
 * خدمة إدارة ردود النزاعات
 * هذه الخدمة تتعامل مع إنشاء وإدارة ردود النزاعات بين العملاء ومقدمي الخدمات والمشرفين
 */

import { PrismaClient } from '@prisma/client';
import { DisputeReplyCreateDTO, DisputeReplyDTO, DisputeStatus } from '../types';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

/**
 * إنشاء رد جديد على نزاع
 * @param replyData بيانات الرد
 * @returns الرد الذي تم إنشاؤه
 */
export async function createDisputeReply(replyData: DisputeReplyCreateDTO) {
  // التحقق من وجود النزاع
  const dispute = await prisma.dispute.findUnique({
    where: {
      id: replyData.disputeId,
    },
    include: {
      client: true,
      provider: true,
    },
  });

  if (!dispute) {
    throw new Error('النزاع غير موجود');
  }

  // التحقق من أن النزاع مفتوح أو قيد المراجعة
  if (dispute.status !== 'OPEN' && dispute.status !== 'IN_REVIEW') {
    throw new Error('لا يمكن إضافة رد على نزاع مغلق أو تم حله');
  }

  // إنشاء الرد
  const reply = await prisma.disputeReply.create({
    data: {
      disputeId: replyData.disputeId,
      userId: replyData.userId,
      content: replyData.content,
      attachments: replyData.attachments,
    },
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
  });

  // تحديد المستلم للإشعار (الطرف الآخر)
  let recipientId: number;
  
  if (replyData.userId === dispute.clientId) {
    // إذا كان المرسل هو العميل، نرسل إشعار لمقدم الخدمة
    recipientId = dispute.providerId;
  } else if (replyData.userId === dispute.providerId) {
    // إذا كان المرسل هو مقدم الخدمة، نرسل إشعار للعميل
    recipientId = dispute.clientId;
  } else {
    // إذا كان المرسل هو المشرف، نرسل إشعار للطرفين
    await notificationService.sendUserNotification(
      dispute.clientId,
      notificationService.NotificationType.NEW_DISPUTE_REPLY,
      'رد جديد على النزاع',
      `تم إضافة رد جديد على النزاع رقم ${dispute.id}.`,
      { disputeId: dispute.id, replyId: reply.id }
    );
    
    await notificationService.sendUserNotification(
      dispute.providerId,
      notificationService.NotificationType.NEW_DISPUTE_REPLY,
      'رد جديد على النزاع',
      `تم إضافة رد جديد على النزاع رقم ${dispute.id}.`,
      { disputeId: dispute.id, replyId: reply.id }
    );
    
    return reply;
  }

  // إرسال إشعار للطرف الآخر
  await notificationService.sendUserNotification(
    recipientId,
    notificationService.NotificationType.NEW_DISPUTE_REPLY,
    'رد جديد على النزاع',
    `تم إضافة رد جديد على النزاع رقم ${dispute.id}.`,
    { disputeId: dispute.id, replyId: reply.id }
  );

  return reply;
}

/**
 * الحصول على ردود نزاع محدد
 * @param disputeId معرف النزاع
 * @returns قائمة الردود المتعلقة بالنزاع
 */
export async function getDisputeReplies(disputeId: number) {
  // التحقق من وجود النزاع
  const dispute = await prisma.dispute.findUnique({
    where: {
      id: disputeId,
    },
  });

  if (!dispute) {
    throw new Error('النزاع غير موجود');
  }

  // الحصول على الردود مرتبة حسب تاريخ الإنشاء (الأقدم أولاً)
  const replies = await prisma.disputeReply.findMany({
    where: {
      disputeId,
    },
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
  });

  return replies;
}

/**
 * حذف رد على نزاع
 * @param replyId معرف الرد
 * @param userId معرف المستخدم الذي يريد الحذف (للتحقق من الصلاحية)
 * @param isAdmin هل المستخدم مشرف
 * @returns الرد الذي تم حذفه
 */
export async function deleteDisputeReply(replyId: number, userId: number, isAdmin: boolean = false) {
  // التحقق من وجود الرد
  const reply = await prisma.disputeReply.findUnique({
    where: {
      id: replyId,
    },
    include: {
      dispute: true,
    },
  });

  if (!reply) {
    throw new Error('الرد غير موجود');
  }

  // التحقق من صلاحية الحذف
  if (!isAdmin && reply.userId !== userId) {
    throw new Error('ليس لديك صلاحية حذف هذا الرد');
  }

  // التحقق من أن النزاع مفتوح أو قيد المراجعة
  if (reply.dispute.status !== 'OPEN' && reply.dispute.status !== 'IN_REVIEW') {
    throw new Error('لا يمكن حذف رد على نزاع مغلق أو تم حله');
  }

  // حذف الرد
  return prisma.disputeReply.delete({
    where: {
      id: replyId,
    },
  });
} 