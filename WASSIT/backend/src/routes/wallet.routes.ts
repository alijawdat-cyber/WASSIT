/**
 * مسارات المحفظة - Wallet Routes
 */
import express from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// تطبيق وسيط المصادقة على جميع المسارات
router.use(authMiddleware);

// الحصول على محفظة المستخدم
router.get('/', walletController.getUserWallet);

// الحصول على معاملات المستخدم
router.get('/transactions', walletController.getUserTransactions);

// الحصول على معاملة محددة
router.get('/transactions/:id', walletController.getTransaction);

export default router; 