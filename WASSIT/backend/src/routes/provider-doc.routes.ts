import express from 'express';
import * as providerDocController from '../controllers/provider-doc.controller';
import { authMiddleware, isAdmin, isProvider } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/provider-docs/:providerId
 * @desc الحصول على وثائق مقدم خدمة
 * @access عام
 */
router.get('/:providerId', providerDocController.getProviderDocs);

/**
 * @route POST /api/provider-docs
 * @desc رفع وثيقة جديدة
 * @access خاص (مقدم خدمة فقط)
 */
router.post('/', authMiddleware, isProvider, providerDocController.uploadProviderDoc);

/**
 * @route PATCH /api/provider-docs/:docId/verify
 * @desc تحديث حالة التحقق من وثيقة
 * @access خاص (المشرف فقط)
 */
router.patch('/:docId/verify', authMiddleware, isAdmin, providerDocController.verifyProviderDoc);

export default router; 