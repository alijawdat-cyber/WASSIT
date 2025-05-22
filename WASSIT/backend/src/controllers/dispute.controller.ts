/**
 * وحدة تحكم النزاعات
 * هذه الوحدة تتعامل مع طلبات HTTP المتعلقة بالنزاعات
 */

import { Request, Response } from 'express';
import { DisputeStatus } from '../types';
import * as disputeService from '../services/dispute.service';
import { badRequestResponse, notFoundResponse, serverErrorResponse, successResponse } from '../utils/apiResponse';

/**
 * إنشاء نزاع جديد
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function createDispute(req: Request, res: Response) {
  try {
    const { requestId, providerId, reason } = req.body;
    
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول');
    }
    
    if (!requestId || !providerId || !reason) {
      return badRequestResponse(res, 'يرجى توفير جميع البيانات المطلوبة');
    }
    
    const dispute = await disputeService.createDispute(
      Number(requestId),
      req.user.userId,
      Number(providerId),
      reason
    );
    
    return successResponse(res, 'تم إنشاء النزاع بنجاح', { dispute });
  } catch (error: any) {
    console.error('خطأ في إنشاء النزاع:', error);
    return serverErrorResponse(res, error.message || 'حدث خطأ أثناء محاولة إنشاء النزاع');
  }
}

/**
 * الحصول على تفاصيل نزاع
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getDisputeDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف النزاع غير صالح');
    }
    
    const dispute = await disputeService.getDisputeDetails(Number(id));
    
    // التحقق من صلاحية الوصول
    if (
      req.user?.role !== 'ADMIN' &&
      dispute.clientId !== req.user?.userId &&
      dispute.providerId !== req.user?.userId
    ) {
      return badRequestResponse(res, 'ليس لديك صلاحية الوصول إلى هذا النزاع');
    }
    
    return successResponse(res, 'تم الحصول على تفاصيل النزاع بنجاح', { dispute });
  } catch (error: any) {
    console.error('خطأ في الحصول على تفاصيل النزاع:', error);
    
    if (error.message === 'النزاع غير موجود') {
      return notFoundResponse(res, 'النزاع غير موجود');
    }
    
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على تفاصيل النزاع');
  }
}

/**
 * تحديث حالة النزاع إلى قيد المراجعة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function updateDisputeToInReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف النزاع غير صالح');
    }
    
    const updatedDispute = await disputeService.updateDisputeToInReview(Number(id));
    
    return successResponse(res, 'تم تحديث حالة النزاع إلى قيد المراجعة بنجاح', { dispute: updatedDispute });
  } catch (error: any) {
    console.error('خطأ في تحديث حالة النزاع:', error);
    
    if (error.message === 'النزاع غير موجود') {
      return notFoundResponse(res, 'النزاع غير موجود');
    }
    
    if (error.message === 'يمكن تحديث حالة النزاع فقط عندما يكون مفتوحًا') {
      return badRequestResponse(res, 'يمكن تحديث حالة النزاع فقط عندما يكون مفتوحًا');
    }
    
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحديث حالة النزاع');
  }
}

/**
 * حل النزاع
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function resolveDispute(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { resolution, status, refundAmount, refundPercentage } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف النزاع غير صالح');
    }
    
    if (!resolution) {
      return badRequestResponse(res, 'يرجى توفير قرار الحل');
    }
    
    // التحقق من صحة الحالة المقدمة
    let disputeStatus: DisputeStatus;
    
    switch (status) {
      case 'RESOLVED_CLIENT':
        disputeStatus = DisputeStatus.RESOLVED_CLIENT;
        break;
      case 'RESOLVED_PROVIDER':
        disputeStatus = DisputeStatus.RESOLVED_PROVIDER;
        break;
      case 'RESOLVED_PARTIAL':
        disputeStatus = DisputeStatus.RESOLVED_PARTIAL;
        break;
      case 'CANCELED':
        disputeStatus = DisputeStatus.CANCELED;
        break;
      default:
        disputeStatus = DisputeStatus.RESOLVED_CLIENT;
    }
    
    const updatedDispute = await disputeService.resolveDispute(
      Number(id),
      resolution,
      disputeStatus,
      refundAmount ? Number(refundAmount) : undefined,
      refundPercentage ? Number(refundPercentage) : undefined
    );
    
    return successResponse(res, 'تم حل النزاع بنجاح', { dispute: updatedDispute });
  } catch (error: any) {
    console.error('خطأ في حل النزاع:', error);
    
    if (error.message === 'النزاع غير موجود') {
      return notFoundResponse(res, 'النزاع غير موجود');
    }
    
    if (error.message === 'لا يمكن حل النزاع لأنه ليس مفتوحًا أو قيد المراجعة') {
      return badRequestResponse(res, 'لا يمكن حل النزاع لأنه ليس مفتوحًا أو قيد المراجعة');
    }
    
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة حل النزاع');
  }
} 