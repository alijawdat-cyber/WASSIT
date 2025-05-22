/**
 * خدمة الإشعارات لإرسال وإدارة الإشعارات للمستخدمين
 */

import { PrismaClient } from '@prisma/client';
import { NotificationType, NotificationCreateDTO, NotificationDTO, NotificationFilterParams } from '../types';

const prisma = new PrismaClient();

/**
 * إرسال إشعار إلى مستخدم
 * @param userId معرف المستخدم
 * @param type نوع الإشعار
 * @param title عنوان الإشعار
 * @param message محتوى الإشعار
 * @param relatedId معرف العنصر المرتبط (اختياري)
 * @param relatedType نوع العنصر المرتبط (اختياري)
 */
export async function sendUserNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: number,
  relatedType?: string
) {
  console.log(`[تنبيه] إرسال إشعار إلى المستخدم #${userId}: ${title}`);
  
  // تخزين الإشعار في قاعدة البيانات
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      isRead: false
    }
  });
  
  // في النسخة الحقيقية، يتم هنا إرسال إشعار Push
  // باستخدام Firebase Cloud Messaging أو خدمة مشابهة
  
  return {
    success: true,
    notification
  };
}

/**
 * الحصول على كل إشعارات المستخدم
 * @param userId معرف المستخدم
 * @param filters معايير التصفية
 */
export async function getUserNotifications(
  userId: number,
  filters: NotificationFilterParams = {}
) {
  const { page = 1, limit = 10, isRead, type } = filters;
  const skip = (page - 1) * limit;
  
  // بناء شروط البحث
  const where: any = { userId };
  
  // إضافة شرط حالة القراءة إذا تم تحديده
  if (isRead !== undefined) {
    where.isRead = isRead;
  }
  
  // إضافة شرط نوع الإشعار إذا تم تحديده
  if (type) {
    where.type = type;
  }
  
  // استعلام قاعدة البيانات
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        user: true
      }
    }),
    prisma.notification.count({ where })
  ]);
  
  return {
    success: true,
    data: notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * تحديث حالة قراءة الإشعار
 * @param notificationId معرف الإشعار
 * @param isRead حالة القراءة الجديدة
 */
export async function markNotificationAsRead(
  notificationId: number,
  isRead: boolean = true
) {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead }
  });
  
  return {
    success: true,
    notification
  };
}

/**
 * تحديث حالة قراءة جميع إشعارات المستخدم
 * @param userId معرف المستخدم
 * @param isRead حالة القراءة الجديدة
 */
export async function markAllNotificationsAsRead(
  userId: number,
  isRead: boolean = true
) {
  await prisma.notification.updateMany({
    where: { userId },
    data: { isRead }
  });
  
  return {
    success: true,
    message: 'تم تحديث حالة قراءة جميع الإشعارات بنجاح'
  };
}

/**
 * حذف إشعار
 * @param notificationId معرف الإشعار
 */
export async function deleteNotification(notificationId: number) {
  await prisma.notification.delete({
    where: { id: notificationId }
  });
  
  return {
    success: true,
    message: 'تم حذف الإشعار بنجاح'
  };
}

/**
 * إرسال إشعار للمشرفين
 * @param type نوع الإشعار
 * @param title عنوان الإشعار
 * @param message محتوى الإشعار
 * @param relatedId معرف العنصر المرتبط (اختياري)
 * @param relatedType نوع العنصر المرتبط (اختياري)
 */
export async function sendAdminNotification(
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: number,
  relatedType?: string
) {
  // الحصول على قائمة المشرفين
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  
  // إرسال إشعار لكل مشرف
  const promises = admins.map(admin => 
    sendUserNotification(admin.id, type, title, message, relatedId, relatedType)
  );
  
  await Promise.all(promises);
  
  return {
    success: true,
    message: `تم إرسال الإشعار إلى ${admins.length} مشرف/مشرفين`
  };
}

/**
 * إرسال إشعار إلى مقدمي الخدمة المتاحين
 * @param type نوع الإشعار
 * @param title عنوان الإشعار
 * @param message محتوى الإشعار
 * @param serviceId معرف الخدمة المرتبطة (اختياري)
 * @param relatedId معرف العنصر المرتبط (اختياري)
 * @param relatedType نوع العنصر المرتبط (اختياري)
 */
export async function sendProvidersNotification(
  type: NotificationType,
  title: string,
  message: string,
  serviceId?: number,
  relatedId?: number,
  relatedType?: string
) {
  // الحصول على قائمة مقدمي الخدمة
  const providersQuery: any = { role: 'PROVIDER' };
  
  // إذا تم تحديد خدمة معينة، سيتم لاحقًا تنفيذ منطق للتصفية
  // حسب الخدمات المقدمة، لكن هذا يتطلب تطوير نموذج ProviderService
  
  const providers = await prisma.user.findMany({
    where: providersQuery
  });
  
  // إرسال إشعار لكل مقدم خدمة
  const promises = providers.map(provider => 
    sendUserNotification(provider.id, type, title, message, relatedId, relatedType)
  );
  
  await Promise.all(promises);
  
  return {
    success: true,
    message: `تم إرسال الإشعار إلى ${providers.length} مقدم خدمة`
  };
} 