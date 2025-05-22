import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// إعداد multer لتخزين الملفات في الذاكرة
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 ميجابايت كحد أقصى
  }
});

/**
 * @route POST /api/upload/request/:requestId/attachment
 * @desc تحميل مرفق لطلب
 * @access خاص (العميل ومقدم الخدمة المعنيين)
 */
router.post(
  '/request/:requestId/attachment',
  authMiddleware,
  upload.single('file'),
  uploadController.uploadRequestAttachment
);

/**
 * @route POST /api/upload/provider/document
 * @desc تحميل وثيقة مقدم خدمة
 * @access خاص (مقدم خدمة فقط)
 */
router.post(
  '/provider/document',
  authMiddleware,
  upload.single('file'),
  uploadController.uploadProviderDocument
);

/**
 * @route POST /api/upload/request/:requestId/deliverable
 * @desc تحميل ملف تسليم نهائي
 * @access خاص (مقدم الخدمة المقبول للطلب فقط)
 */
router.post(
  '/request/:requestId/deliverable',
  authMiddleware,
  upload.single('file'),
  uploadController.uploadDeliverable
);

/**
 * @route DELETE /api/upload/file
 * @desc حذف ملف
 * @access خاص (المستخدم المالك أو المشرف)
 */
router.delete(
  '/file',
  authMiddleware,
  uploadController.deleteUploadedFile
);

export default router; 