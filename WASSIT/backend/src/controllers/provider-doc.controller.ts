import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '../utils/apiResponse';
import { ProviderDocCreateDTO } from '../types';
import * as notificationService from '../services/notification.service';

const prisma = new PrismaClient();

/**
 * الحصول على وثائق مقدم خدمة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getProviderDocs(req: Request, res: Response) {
  try {
    const { providerId } = req.params;
    
    if (!providerId || isNaN(Number(providerId))) {
      return badRequestResponse(res, 'معرف مقدم الخدمة غير صالح');
    }
    
    // التحقق من وجود المستخدم ودوره
    const provider = await prisma.user.findUnique({
      where: {
        id: Number(providerId),
        role: 'PROVIDER',
      },
    });
    
    if (!provider) {
      return notFoundResponse(res, 'مقدم الخدمة غير موجود');
    }
    
    // الحصول على الوثائق
    const docs = await prisma.providerDoc.findMany({
      where: {
        userId: Number(providerId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return successResponse(res, 'تم الحصول على الوثائق بنجاح', { docs });
  } catch (error) {
    console.error('خطأ في الحصول على الوثائق:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على الوثائق');
  }
}

/**
 * إضافة وثيقة جديدة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function uploadProviderDoc(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId, role } = req.user;
    
    // التحقق من أن المستخدم مقدم خدمة
    if (role !== 'PROVIDER') {
      return badRequestResponse(res, 'فقط مقدمي الخدمة يمكنهم رفع الوثائق');
    }
    
    const { docURL } = req.body;
    
    if (!docURL) {
      return badRequestResponse(res, 'يرجى توفير رابط الوثيقة');
    }
    
    // إنشاء وثيقة جديدة
    const newDoc = await prisma.providerDoc.create({
      data: {
        userId,
        docURL,
        verified: false, // بانتظار التحقق من قِبل المشرف
      },
    });
    
    // إرسال إشعار للمشرفين
    // في النسخة المستقبلية، يمكننا إضافة دالة لإرسال إشعارات للمشرفين
    
    return createdResponse(res, 'تم رفع الوثيقة بنجاح وهي قيد المراجعة', { doc: newDoc });
  } catch (error) {
    console.error('خطأ في رفع الوثيقة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة رفع الوثيقة');
  }
}

/**
 * تحديث حالة التحقق من وثيقة (للمشرف فقط)
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function verifyProviderDoc(req: Request, res: Response) {
  try {
    const { docId } = req.params;
    const { verified } = req.body;
    
    if (!docId || isNaN(Number(docId))) {
      return badRequestResponse(res, 'معرف الوثيقة غير صالح');
    }
    
    if (typeof verified !== 'boolean') {
      return badRequestResponse(res, 'يرجى توفير حالة التحقق بشكل صحيح');
    }
    
    // التحقق من وجود الوثيقة
    const doc = await prisma.providerDoc.findUnique({
      where: {
        id: Number(docId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!doc) {
      return notFoundResponse(res, 'الوثيقة غير موجودة');
    }
    
    // تحديث حالة التحقق
    const updatedDoc = await prisma.providerDoc.update({
      where: {
        id: Number(docId),
      },
      data: {
        verified,
      },
    });
    
    // إرسال إشعار لمقدم الخدمة
    await notificationService.sendUserNotification(
      doc.userId,
      verified
        ? notificationService.NotificationType.DOCUMENT_VERIFIED
        : notificationService.NotificationType.DOCUMENT_REJECTED,
      verified ? 'تم التحقق من وثيقتك' : 'تم رفض وثيقتك',
      verified
        ? `تم التحقق من الوثيقة التي رفعتها بنجاح.`
        : `تم رفض الوثيقة التي رفعتها. يرجى رفع وثيقة أخرى متوافقة مع متطلباتنا.`,
      { docId: updatedDoc.id }
    );
    
    return successResponse(
      res,
      `تم ${verified ? 'التحقق من' : 'رفض'} الوثيقة بنجاح`,
      { doc: updatedDoc }
    );
  } catch (error) {
    console.error('خطأ في تحديث حالة التحقق من الوثيقة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحديث حالة التحقق من الوثيقة');
  }
} 