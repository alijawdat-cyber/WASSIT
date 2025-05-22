import { Request, Response } from 'express';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '../utils/apiResponse';
import * as uploadService from '../services/upload.service';
import { PrismaClient } from '@prisma/client';

// استخدام اعلان نوع لطلب مع multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const prisma = new PrismaClient();

/**
 * تحميل مرفق طلب
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function uploadRequestAttachment(req: MulterRequest, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    // التحقق من وجود الملف
    if (!req.file) {
      return badRequestResponse(res, 'يرجى اختيار ملف للتحميل');
    }
    
    const { requestId } = req.params;
    
    if (!requestId || isNaN(Number(requestId))) {
      return badRequestResponse(res, 'معرف الطلب غير صالح');
    }
    
    // التحقق من وجود الطلب
    const request = await prisma.request.findUnique({
      where: {
        id: Number(requestId),
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    // التحقق من أن المستخدم هو صاحب الطلب أو مقدم الخدمة المقبول أو المشرف
    if (
      req.user.role !== 'ADMIN' &&
      request.clientId !== req.user.userId &&
      !(await prisma.offer.findFirst({
        where: {
          requestId: Number(requestId),
          providerId: req.user.userId,
          status: 'ACCEPTED',
        },
      }))
    ) {
      return badRequestResponse(res, 'ليس لديك صلاحية تحميل مرفقات لهذا الطلب');
    }
    
    // حفظ الملف
    const fileInfo = uploadService.saveFile(
      req.file.buffer,
      req.file.originalname,
      uploadService.FileType.REQUEST_ATTACHMENT,
      Number(requestId)
    );
    
    // في النسخة الحقيقية، يمكن تخزين معلومات الملف في قاعدة البيانات
    
    return createdResponse(res, 'تم تحميل المرفق بنجاح', { file: fileInfo });
  } catch (error) {
    console.error('خطأ في تحميل مرفق الطلب:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحميل مرفق الطلب');
  }
}

/**
 * تحميل وثيقة مقدم خدمة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function uploadProviderDocument(req: MulterRequest, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    
    // التحقق من أن المستخدم مقدم خدمة
    if (req.user.role !== 'PROVIDER') {
      return badRequestResponse(res, 'فقط مقدمي الخدمة يمكنهم تحميل الوثائق');
    }
    
    // التحقق من وجود الملف
    if (!req.file) {
      return badRequestResponse(res, 'يرجى اختيار ملف للتحميل');
    }
    
    // حفظ الملف
    const fileInfo = uploadService.saveFile(
      req.file.buffer,
      req.file.originalname,
      uploadService.FileType.PROVIDER_DOC,
      userId
    );
    
    // إنشاء سجل وثيقة في قاعدة البيانات
    const providerDoc = await prisma.providerDoc.create({
      data: {
        userId,
        docURL: fileInfo.url,
        verified: false, // بانتظار التحقق من قِبل المشرف
      },
    });
    
    return createdResponse(res, 'تم تحميل الوثيقة بنجاح وهي قيد المراجعة', {
      file: fileInfo,
      document: providerDoc,
    });
  } catch (error) {
    console.error('خطأ في تحميل وثيقة مقدم الخدمة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحميل وثيقة مقدم الخدمة');
  }
}

/**
 * تحميل ملف تسليم نهائي
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function uploadDeliverable(req: MulterRequest, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    // التحقق من وجود الملف
    if (!req.file) {
      return badRequestResponse(res, 'يرجى اختيار ملف للتحميل');
    }
    
    const { requestId } = req.params;
    
    if (!requestId || isNaN(Number(requestId))) {
      return badRequestResponse(res, 'معرف الطلب غير صالح');
    }
    
    // التحقق من وجود الطلب
    const request = await prisma.request.findUnique({
      where: {
        id: Number(requestId),
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    // التحقق من أن المستخدم هو مقدم الخدمة المقبول للطلب
    const offer = await prisma.offer.findFirst({
      where: {
        requestId: Number(requestId),
        providerId: req.user.userId,
        status: 'ACCEPTED',
      },
    });
    
    if (!offer && req.user.role !== 'ADMIN') {
      return badRequestResponse(res, 'ليس لديك صلاحية تحميل ملفات التسليم لهذا الطلب');
    }
    
    // حفظ الملف
    const fileInfo = uploadService.saveFile(
      req.file.buffer,
      req.file.originalname,
      uploadService.FileType.DELIVERABLE,
      Number(requestId)
    );
    
    // تحديث حالة الطلب إلى "تم التسليم" (اختياري)
    // في الإصدار الحقيقي، قد يكون هناك تأكيد إضافي من المستخدم
    
    return createdResponse(res, 'تم تحميل ملف التسليم بنجاح', { file: fileInfo });
  } catch (error) {
    console.error('خطأ في تحميل ملف التسليم:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحميل ملف التسليم');
  }
}

/**
 * حذف ملف
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function deleteUploadedFile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { filePath } = req.body;
    
    if (!filePath) {
      return badRequestResponse(res, 'يرجى توفير مسار الملف');
    }
    
    // في النسخة الحقيقية، يجب التحقق من ملكية الملف قبل الحذف
    // وتحديث قاعدة البيانات إذا لزم الأمر
    
    const result = uploadService.deleteFile(filePath);
    
    if (!result.success) {
      return badRequestResponse(res, result.message);
    }
    
    return successResponse(res, 'تم حذف الملف بنجاح');
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة حذف الملف');
  }
} 