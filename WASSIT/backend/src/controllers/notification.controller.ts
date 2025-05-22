/**
 * مراقب الإشعارات - Notification Controller
 */
import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { NotificationType, NotificationFilterParams } from '../types';

// تعريف فئة ApiError للتعامل مع أخطاء API
class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * الحصول على إشعارات المستخدم
 */
export async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.userId);
    const { page, limit, isRead, type } = req.query;
    
    const filters: NotificationFilterParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      type: type as NotificationType
    };
    
    const result = await notificationService.getUserNotifications(userId, filters);
    
    res.json(result);
  } catch (error: any) {
    console.error('خطأ في الحصول على إشعارات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في الحصول على إشعارات المستخدم'
    });
  }
}

/**
 * تحديث حالة قراءة الإشعار
 */
export async function markAsRead(req: Request, res: Response) {
  try {
    const notificationId = Number(req.params.id);
    const { isRead = true } = req.body;
    
    if (!notificationId) {
      throw new ApiError('معرف الإشعار مطلوب', 400);
    }
    
    const result = await notificationService.markNotificationAsRead(notificationId, Boolean(isRead));
    
    res.json(result);
  } catch (error: any) {
    console.error('خطأ في تحديث حالة قراءة الإشعار:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'خطأ في تحديث حالة قراءة الإشعار'
    });
  }
}

/**
 * تحديث حالة قراءة جميع الإشعارات
 */
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.userId);
    const { isRead = true } = req.body;
    
    const result = await notificationService.markAllNotificationsAsRead(userId, Boolean(isRead));
    
    res.json(result);
  } catch (error: any) {
    console.error('خطأ في تحديث حالة قراءة جميع الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في تحديث حالة قراءة جميع الإشعارات'
    });
  }
}

/**
 * حذف إشعار
 */
export async function deleteNotification(req: Request, res: Response) {
  try {
    const notificationId = Number(req.params.id);
    
    if (!notificationId) {
      throw new ApiError('معرف الإشعار مطلوب', 400);
    }
    
    const result = await notificationService.deleteNotification(notificationId);
    
    res.json(result);
  } catch (error: any) {
    console.error('خطأ في حذف الإشعار:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'خطأ في حذف الإشعار'
    });
  }
} 