import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '../utils/apiResponse';
import { RatingCreateDTO } from '../types';
import * as notificationService from '../services/notification.service';

const prisma = new PrismaClient();

/**
 * الحصول على تقييمات مستخدم
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getUserRatings(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(Number(userId))) {
      return badRequestResponse(res, 'معرف المستخدم غير صالح');
    }
    
    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });
    
    if (!user) {
      return notFoundResponse(res, 'المستخدم غير موجود');
    }
    
    // الحصول على التقييمات
    const ratings = await prisma.rating.findMany({
      where: {
        toUserId: Number(userId),
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        request: {
          select: {
            id: true,
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // حساب متوسط التقييم
    const averageRating = ratings.length > 0
      ? ratings.reduce((total: number, rating: { score: number }) => total + rating.score, 0) / ratings.length
      : 0;
    
    return successResponse(res, 'تم الحصول على التقييمات بنجاح', {
      ratings,
      averageRating,
      count: ratings.length,
    });
  } catch (error) {
    console.error('خطأ في الحصول على التقييمات:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على التقييمات');
  }
}

/**
 * إضافة تقييم جديد
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function createRating(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    const ratingData: RatingCreateDTO = {
      ...req.body,
      fromUserId: userId,
    };
    
    // التحقق من صحة البيانات
    if (
      !ratingData.toUserId ||
      !ratingData.requestId ||
      typeof ratingData.score !== 'number' ||
      ratingData.score < 1 ||
      ratingData.score > 5
    ) {
      return badRequestResponse(res, 'يرجى توفير جميع البيانات المطلوبة بصيغة صحيحة');
    }
    
    // التحقق من وجود الطلب
    const request = await prisma.request.findUnique({
      where: {
        id: ratingData.requestId,
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    // التحقق من اكتمال الطلب
    if (request.status !== 'COMPLETED') {
      return badRequestResponse(res, 'لا يمكن التقييم إلا بعد اكتمال الطلب');
    }
    
    // التحقق من أن المستخدم هو العميل أو مقدم الخدمة للطلب
    const isClient = request.clientId === userId;
    
    const isProvider = await prisma.offer.findFirst({
      where: {
        requestId: ratingData.requestId,
        providerId: userId,
        status: 'ACCEPTED',
      },
    });
    
    if (!isClient && !isProvider) {
      return badRequestResponse(res, 'ليس لديك صلاحية التقييم لهذا الطلب');
    }
    
    // التحقق من أن المستخدم المراد تقييمه هو الطرف الآخر في الطلب
    if (isClient) {
      const offer = await prisma.offer.findFirst({
        where: {
          requestId: ratingData.requestId,
          providerId: ratingData.toUserId,
          status: 'ACCEPTED',
        },
      });
      
      if (!offer) {
        return badRequestResponse(res, 'لا يمكن تقييم هذا المستخدم في هذا الطلب');
      }
    } else if (isProvider && request.clientId !== ratingData.toUserId) {
      return badRequestResponse(res, 'لا يمكن تقييم هذا المستخدم في هذا الطلب');
    }
    
    // التحقق من عدم وجود تقييم سابق
    const existingRating = await prisma.rating.findFirst({
      where: {
        fromUserId: userId,
        toUserId: ratingData.toUserId,
        requestId: ratingData.requestId,
      },
    });
    
    if (existingRating) {
      return badRequestResponse(res, 'لقد قمت بتقييم هذا المستخدم مسبقاً في هذا الطلب');
    }
    
    // إنشاء تقييم جديد
    const newRating = await prisma.rating.create({
      data: ratingData,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        request: {
          select: {
            id: true,
            service: true,
          },
        },
      },
    });
    
    // إرسال إشعار للمستخدم المقيَّم
    await notificationService.sendUserNotification(
      ratingData.toUserId,
      notificationService.NotificationType.NEW_RATING,
      'تقييم جديد',
      `لقد حصلت على تقييم جديد (${ratingData.score}/5) على الطلب #${ratingData.requestId}`,
      { ratingId: newRating.id, requestId: ratingData.requestId }
    );
    
    return createdResponse(res, 'تم إضافة التقييم بنجاح', { rating: newRating });
  } catch (error) {
    console.error('خطأ في إضافة التقييم:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة إضافة التقييم');
  }
} 