/**
 * مسارات طلبات السحب - Withdrawal Routes
 */
import express from 'express';
import * as withdrawalController from '../controllers/withdrawal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = express.Router();

// تطبيق وسيط المصادقة على جميع المسارات
router.use(authMiddleware);

// إنشاء طلب سحب جديد
router.post('/', withdrawalController.createWithdrawalRequest);

// الحصول على طلبات السحب للمستخدم الحالي
router.get('/', withdrawalController.getUserWithdrawalRequests);

// الحصول على طلب سحب محدد
router.get('/:id', withdrawalController.getWithdrawalRequest);

// مسارات المشرف
// الحصول على جميع طلبات السحب (للمشرف)
router.get('/admin/all', adminMiddleware, withdrawalController.getAllWithdrawalRequests);

// تحديث حالة طلب السحب (للمشرف)
router.put('/:id/status', adminMiddleware, withdrawalController.updateWithdrawalStatus);

export default router; 