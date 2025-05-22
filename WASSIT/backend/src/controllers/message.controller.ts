import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '../utils/apiResponse';
import { MessageCreateDTO } from '../types';
import * as notificationService from '../services/notification.service';

const prisma = new PrismaClient();

/**
 * الحصول على رسائل طلب معين
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getMessagesByRequestId(req: Request, res: Response) {
  try {
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
    
    // التحقق من صلاحية الوصول
    if (
      req.user?.role !== 'ADMIN' &&
      request.clientId !== req.user?.userId &&
      !(await prisma.offer.findFirst({
        where: {
          requestId: Number(requestId),
          providerId: req.user?.userId,
        },
      }))
    ) {
      return badRequestResponse(res, 'ليس لديك صلاحية الوصول إلى هذه المحادثة');
    }
    
    // الحصول على الرسائل
    const messages = await prisma.message.findMany({
      where: {
        requestId: Number(requestId),
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    return successResponse(res, 'تم الحصول على الرسائل بنجاح', { messages });
  } catch (error) {
    console.error('خطأ في الحصول على الرسائل:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على الرسائل');
  }
}

/**
 * إنشاء رسالة جديدة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function createMessage(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    const messageData: MessageCreateDTO = req.body;
    
    // التحقق من صحة البيانات
    if (!messageData.requestId || !messageData.toUserId || !messageData.content) {
      return badRequestResponse(res, 'يرجى توفير جميع البيانات المطلوبة');
    }
    
    // التحقق من وجود الطلب
    const request = await prisma.request.findUnique({
      where: {
        id: messageData.requestId,
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    // التحقق من صلاحية الوصول
    if (
      req.user?.role !== 'ADMIN' &&
      request.clientId !== userId &&
      !(await prisma.offer.findFirst({
        where: {
          requestId: messageData.requestId,
          providerId: userId,
        },
      }))
    ) {
      return badRequestResponse(res, 'ليس لديك صلاحية إرسال رسائل في هذا الطلب');
    }
    
    // التحقق من وجود المستخدم المستلم
    const toUser = await prisma.user.findUnique({
      where: {
        id: messageData.toUserId,
      },
    });
    
    if (!toUser) {
      return notFoundResponse(res, 'المستخدم المستلم غير موجود');
    }
    
    // إنشاء رسالة جديدة
    const newMessage = await prisma.message.create({
      data: {
        requestId: messageData.requestId,
        fromUserId: userId,
        toUserId: messageData.toUserId,
        content: messageData.content,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    
    // إرسال إشعار للمستلم
    await notificationService.sendUserNotification(
      messageData.toUserId,
      notificationService.NotificationType.NEW_MESSAGE,
      'رسالة جديدة',
      `لديك رسالة جديدة بخصوص الطلب #${messageData.requestId}`,
      { messageId: newMessage.id, requestId: messageData.requestId }
    );
    
    return createdResponse(res, 'تم إرسال الرسالة بنجاح', { message: newMessage });
  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة إرسال الرسالة');
  }
} 