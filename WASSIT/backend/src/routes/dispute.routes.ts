import express from 'express';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware';
import * as disputeController from '../controllers/dispute.controller';

const router = express.Router();

/**
 * @route POST /api/disputes
 * @desc إنشاء نزاع جديد
 * @access خاص (مستخدم مسجل)
 */
router.post('/', authMiddleware, disputeController.createDispute);

/**
 * @route GET /api/disputes/:id
 * @desc الحصول على تفاصيل نزاع
 * @access خاص (المستخدم المعني أو المشرف)
 */
router.get('/:id', authMiddleware, disputeController.getDisputeDetails);

/**
 * @route PATCH /api/disputes/:id/in-review
 * @desc تحديث حالة النزاع إلى قيد المراجعة (للمشرف فقط)
 * @access خاص (المشرف فقط)
 */
router.patch('/:id/in-review', authMiddleware, isAdmin, disputeController.updateDisputeToInReview);

/**
 * @route PATCH /api/disputes/:id/resolve
 * @desc حل النزاع (للمشرف فقط)
 * @access خاص (المشرف فقط)
 */
router.patch('/:id/resolve', authMiddleware, isAdmin, disputeController.resolveDispute);

export default router; 