import express from 'express';
import * as messageController from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/messages/request/:requestId
 * @desc الحصول على الرسائل الخاصة بطلب معين
 * @access خاص (العميل ومقدم الخدمة المعنيين أو المشرف)
 */
router.get('/request/:requestId', authMiddleware, messageController.getMessagesByRequestId);

/**
 * @route POST /api/messages
 * @desc إرسال رسالة جديدة
 * @access خاص (العميل ومقدم الخدمة المعنيين أو المشرف)
 */
router.post('/', authMiddleware, messageController.createMessage);

export default router; 