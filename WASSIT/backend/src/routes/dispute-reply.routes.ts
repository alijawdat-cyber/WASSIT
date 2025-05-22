import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as disputeReplyController from '../controllers/dispute-reply.controller';

const router = express.Router();

/**
 * @route POST /api/dispute-replies
 * @desc إنشاء رد جديد على نزاع
 * @access خاص (مستخدم مسجل)
 */
router.post('/', authMiddleware, disputeReplyController.createDisputeReply);

/**
 * @route GET /api/dispute-replies/dispute/:disputeId
 * @desc الحصول على ردود نزاع محدد
 * @access خاص (مستخدم مسجل)
 */
router.get('/dispute/:disputeId', authMiddleware, disputeReplyController.getDisputeReplies);

/**
 * @route DELETE /api/dispute-replies/:replyId
 * @desc حذف رد على نزاع
 * @access خاص (صاحب الرد أو المشرف)
 */
router.delete('/:replyId', authMiddleware, disputeReplyController.deleteDisputeReply);

export default router;