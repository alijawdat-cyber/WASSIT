import express from 'express';
import * as offerController from '../controllers/offer.controller';
import { authMiddleware, isProvider, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/offers/request/:requestId
 * @desc الحصول على جميع العروض لطلب معين
 * @access خاص (مستخدم مسجل)
 */
router.get('/request/:requestId', authMiddleware, offerController.getOffersByRequestId);

/**
 * @route GET /api/offers/provider
 * @desc الحصول على جميع العروض المقدمة من مزود الخدمة الحالي
 * @access خاص (مقدم خدمة فقط)
 */
router.get('/provider', authMiddleware, isProvider, offerController.getProviderOffers);

/**
 * @route POST /api/offers
 * @desc إنشاء عرض جديد
 * @access خاص (مقدم خدمة فقط)
 */
router.post('/', authMiddleware, isProvider, offerController.createOffer);

/**
 * @route PATCH /api/offers/:id/price
 * @desc تعديل سعر العرض (إضافة هامش الربح)
 * @access خاص (المشرف فقط)
 */
router.patch('/:id/price', authMiddleware, isAdmin, offerController.updateOfferPrice);

/**
 * @route PATCH /api/offers/:id/status
 * @desc تحديث حالة العرض (قبول/رفض)
 * @access خاص (المشرف أو العميل صاحب الطلب)
 */
router.patch('/:id/status', authMiddleware, offerController.updateOfferStatus);

export default router; 