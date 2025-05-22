/**
 * وحدة تحكم ردود النزاعات
 * هذه الوحدة تتعامل مع طلبات HTTP المتعلقة بردود النزاعات
 */

import { Request, Response } from 'express';
import { DisputeReplyCreateDTO } from '../types';
import * as disputeReplyService from '../services/dispute-reply.service';
import { badRequestResponse, notFoundResponse, serverErrorResponse, successResponse } from '../utils/apiResponse';

/**
 * إنشاء رد جديد على نزاع
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function createDisputeReply(req: Request, res: Response) {
  try {
    const { disputeId, content, attachments } = req.body;
    
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول');
    }
    
    if (!disputeId || !content) {
      return badRequestResponse(res, 'يرجى توفير معرف النزاع ومحتوى الرد');
    }
    
    const replyData: DisputeReplyCreateDTO = {
      disputeId: Number(disputeId),
      userId: req.user.userId,
      content,
      attachments,
    };
    
    const reply = await disputeReplyService.createDisputeReply(replyData);
    
    return successResponse(res, 'تم إضافة الرد بنجاح', { reply });
  } catch (error: any) {
    console.error('خطأ في إضافة رد على النزاع:', error);
    
    if (error.message === 'النزاع غير موجود') {
      return notFoundResponse(res, 'النزاع غير موجود');
    }
    
    if (error.message === 'لا يمكن إضافة رد على نزاع مغلق أو تم حله') {
      return badRequestResponse(res, 'لا يمكن إضافة رد على نزاع مغلق أو تم حله');
    }
    
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة إضافة رد على النزاع');
  }
}

/**
 * الحصول على ردود نزاع محدد
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getDisputeReplies(req: Request, res: Response) {
  try {
    const { disputeId } = req.params;
    
    if (!disputeId || isNaN(Number(disputeId))) {
      return badRequestResponse(res, 'معرف النزاع غير صالح');
    }
    
    const replies = await disputeReplyService.getDisputeReplies(Number(disputeId));
    
    return successResponse(res, 'تم الحصول على ردود النزاع بنجاح', { replies });
  } catch (error: any) {
    console.error('خطأ في الحصول على ردود النزاع:', error);
    
    if (error.message === 'النزاع غير موجود') {
      return notFoundResponse(res, 'النزاع غير موجود');
    }
    
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على ردود النزاع');
  }
}

/**
 * حذف رد على نزاع
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function deleteDisputeReply(req: Request, res: Response) {
  try {
    const { replyId } = req.params;
    
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول');
    }
    
    if (!replyId || isNaN(Number(replyId))) {
      return badRequestResponse(res, 'معرف الرد غير صالح');
    }
    
    const isAdmin = req.user.role === 'ADMIN';
    
    const reply = await disputeReplyService.deleteDisputeReply(
      Number(replyId),
      req.user.userId,
      isAdmin
    );
    
    return successResponse(res, 'تم حذف الرد بنجاح', { reply });
  } catch (error: any) {
    console.error('خطأ في حذف رد على النزاع:', error);
    
    if (error.message === 'الرد غير موجود') {
      return notFoundResponse(res, 'الرد غير موجود');
    }
    
    if (error.message === 'ليس لديك صلاحية حذف هذا الرد') {
      return badRequestResponse(res, 'ليس لديك صلاحية حذف هذا الرد');
    }
    
    if (error.message === 'لا يمكن حذف رد على نزاع مغلق أو تم حله') {
      return badRequestResponse(res, 'لا يمكن حذف رد على نزاع مغلق أو تم حله');
    }
    
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة حذف رد على النزاع');
  }
} 