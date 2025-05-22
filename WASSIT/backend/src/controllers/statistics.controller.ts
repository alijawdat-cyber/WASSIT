import { Request, Response } from 'express';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '../utils/apiResponse';
import * as statisticsService from '../services/statistics.service';

/**
 * الحصول على إحصائيات لوحة التحكم العامة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getDashboardStatistics(req: Request, res: Response) {
  try {
    const statistics = await statisticsService.getDashboardStatistics();
    return successResponse(res, 'تم الحصول على إحصائيات لوحة التحكم بنجاح', { statistics });
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على إحصائيات لوحة التحكم');
  }
}

/**
 * الحصول على إحصائيات مالية
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getFinancialStatistics(req: Request, res: Response) {
  try {
    const financialStats = await statisticsService.getFinancialStatistics();
    return successResponse(res, 'تم الحصول على الإحصائيات المالية بنجاح', { financialStats });
  } catch (error) {
    console.error('خطأ في الحصول على الإحصائيات المالية:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على الإحصائيات المالية');
  }
}

/**
 * الحصول على إحصائيات نمو المستخدمين
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getUserGrowthStatistics(req: Request, res: Response) {
  try {
    const { days } = req.query;
    
    // التحقق من صحة المعلمة
    const daysNumber = days ? parseInt(days as string, 10) : 30;
    
    if (isNaN(daysNumber) || daysNumber <= 0) {
      return badRequestResponse(res, 'عدد الأيام يجب أن يكون رقمًا موجبًا');
    }
    
    const growthStats = await statisticsService.getUserGrowthStatistics(daysNumber);
    return successResponse(res, 'تم الحصول على إحصائيات نمو المستخدمين بنجاح', { growthStats });
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات نمو المستخدمين:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على إحصائيات نمو المستخدمين');
  }
}

/**
 * الحصول على تقرير الطلبات المكتملة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getCompletedRequestsReport(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    // التحقق من صحة المعلمات
    if (!startDate || !endDate) {
      return badRequestResponse(res, 'يجب تحديد تاريخ البداية والنهاية');
    }
    
    const startDateObj = new Date(startDate as string);
    const endDateObj = new Date(endDate as string);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return badRequestResponse(res, 'تنسيق التاريخ غير صالح');
    }
    
    if (startDateObj > endDateObj) {
      return badRequestResponse(res, 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
    }
    
    // ضبط نهاية اليوم لتاريخ النهاية
    endDateObj.setHours(23, 59, 59, 999);
    
    const report = await statisticsService.getCompletedRequestsReport(startDateObj, endDateObj);
    return successResponse(res, 'تم الحصول على تقرير الطلبات المكتملة بنجاح', { report });
  } catch (error) {
    console.error('خطأ في الحصول على تقرير الطلبات المكتملة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على تقرير الطلبات المكتملة');
  }
} 