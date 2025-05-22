/**
 * مسارات الإشعارات - Notification Routes
 */
import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// استخدام وسيط المصادقة لجميع مسارات الإشعارات
router.use(authMiddleware);

// الحصول على إشعارات المستخدم
router.get('/', notificationController.getUserNotifications);

// تحديث حالة قراءة الإشعار
router.put('/:id/read', notificationController.markAsRead);

// تحديث حالة قراءة جميع الإشعارات
router.put('/read-all', notificationController.markAllAsRead);

// حذف إشعار
router.delete('/:id', notificationController.deleteNotification);

export default router; 