import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc تسجيل مستخدم جديد
 * @access عام
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc تسجيل الدخول
 * @access عام
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/verify-otp
 * @desc التحقق من رمز OTP
 * @access عام
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * @route GET /api/auth/verify
 * @desc التحقق من صحة التوكن
 * @access خاص
 */
router.get('/verify', authMiddleware, authController.verifyToken);

/**
 * @route POST /api/auth/refresh-token
 * @desc تحديث رمز JWT
 * @access خاص
 */
router.post('/refresh-token', authMiddleware, authController.refreshToken);

export default router;