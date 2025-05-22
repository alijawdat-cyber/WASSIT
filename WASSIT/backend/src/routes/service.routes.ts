import express from 'express';
import * as serviceController from '../controllers/service.controller';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/services
 * @desc الحصول على جميع الخدمات المتاحة
 * @access عام
 */
router.get('/', serviceController.getAllServices);

/**
 * @route GET /api/services/:id
 * @desc الحصول على خدمة بواسطة المعرف
 * @access عام
 */
router.get('/:id', serviceController.getServiceById);

/**
 * @route POST /api/services
 * @desc إضافة خدمة جديدة
 * @access خاص (المشرف فقط)
 */
router.post('/', authMiddleware, isAdmin, serviceController.createService);

/**
 * @route PUT /api/services/:id
 * @desc تحديث خدمة
 * @access خاص (المشرف فقط)
 */
router.put('/:id', authMiddleware, isAdmin, serviceController.updateService);

/**
 * @route DELETE /api/services/:id
 * @desc حذف خدمة
 * @access خاص (المشرف فقط)
 */
router.delete('/:id', authMiddleware, isAdmin, serviceController.deleteService);

export default router; 