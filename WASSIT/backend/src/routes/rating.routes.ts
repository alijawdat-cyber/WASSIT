import express from 'express';
import * as ratingController from '../controllers/rating.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/ratings/user/:userId
 * @desc الحصول على تقييمات مستخدم
 * @access عام
 */
router.get('/user/:userId', ratingController.getUserRatings);

/**
 * @route POST /api/ratings
 * @desc إضافة تقييم جديد
 * @access خاص (مستخدم مسجل)
 */
router.post('/', authMiddleware, ratingController.createRating);

export default router; 