import express from 'express';
import * as requestController from '../controllers/request.controller';
import { authMiddleware, isClient, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/requests
 * @desc الحصول على جميع الطلبات (يمكن استخدام مرشحات)
 * @access خاص (مستخدم مسجل)
 */
router.get('/', authMiddleware, requestController.getAllRequests);

/**
 * @route GET /api/requests/:id
 * @desc الحصول على طلب محدد بواسطة المعرف
 * @access خاص (مستخدم مسجل)
 */
router.get('/:id', authMiddleware, requestController.getRequestById);

/**
 * @route POST /api/requests
 * @desc إنشاء طلب جديد
 * @access خاص (العميل فقط)
 */
router.post('/', authMiddleware, isClient, requestController.createRequest);

/**
 * @route PATCH /api/requests/:id/status
 * @desc تحديث حالة الطلب
 * @access خاص (المشرف أو العميل صاحب الطلب)
 */
router.patch('/:id/status', authMiddleware, requestController.updateRequestStatus);

/**
 * @route DELETE /api/requests/:id
 * @desc حذف طلب
 * @access خاص (المشرف أو العميل صاحب الطلب)
 */
router.delete('/:id', authMiddleware, requestController.deleteRequest);

export default router; 