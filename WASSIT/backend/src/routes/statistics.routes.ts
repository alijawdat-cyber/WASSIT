import express from 'express';
import * as statisticsController from '../controllers/statistics.controller';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/statistics/dashboard
 * @desc الحصول على إحصائيات لوحة التحكم العامة
 * @access خاص (المشرف فقط)
 */
router.get('/dashboard', authMiddleware, isAdmin, statisticsController.getDashboardStatistics);

/**
 * @route GET /api/statistics/financial
 * @desc الحصول على إحصائيات مالية
 * @access خاص (المشرف فقط)
 */
router.get('/financial', authMiddleware, isAdmin, statisticsController.getFinancialStatistics);

/**
 * @route GET /api/statistics/user-growth
 * @desc الحصول على إحصائيات نمو المستخدمين
 * @access خاص (المشرف فقط)
 */
router.get('/user-growth', authMiddleware, isAdmin, statisticsController.getUserGrowthStatistics);

/**
 * @route GET /api/statistics/completed-requests
 * @desc الحصول على تقرير الطلبات المكتملة
 * @access خاص (المشرف فقط)
 */
router.get('/completed-requests', authMiddleware, isAdmin, statisticsController.getCompletedRequestsReport);

export default router; 