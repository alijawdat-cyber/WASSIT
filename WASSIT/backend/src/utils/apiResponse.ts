import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * دالة مساعدة لإنشاء استجابة API موحدة
 * @param res كائن الاستجابة من Express
 * @param success حالة النجاح
 * @param message رسالة العملية
 * @param statusCode رمز الحالة HTTP
 * @param data البيانات المراد إرجاعها (اختياري)
 * @param errors أخطاء التحقق من الصحة (اختياري)
 */
export function apiResponse<T>(
  res: Response,
  success: boolean,
  message: string,
  statusCode: number,
  data?: T,
  errors?: any
): Response {
  const response: ApiResponse<T> = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

// دوال مساعدة للحالات الشائعة
export function successResponse<T>(
  res: Response,
  message: string = 'تمت العملية بنجاح',
  data?: T
): Response {
  return apiResponse(res, true, message, 200, data);
}

export function createdResponse<T>(
  res: Response,
  message: string = 'تم الإنشاء بنجاح',
  data?: T
): Response {
  return apiResponse(res, true, message, 201, data);
}

export function badRequestResponse(
  res: Response,
  message: string = 'بيانات غير صالحة',
  errors?: any
): Response {
  return apiResponse(res, false, message, 400, undefined, errors);
}

export function unauthorizedResponse(
  res: Response,
  message: string = 'غير مصرح بالوصول'
): Response {
  return apiResponse(res, false, message, 401);
}

export function forbiddenResponse(
  res: Response,
  message: string = 'لا تملك صلاحية الوصول'
): Response {
  return apiResponse(res, false, message, 403);
}

export function notFoundResponse(
  res: Response,
  message: string = 'غير موجود'
): Response {
  return apiResponse(res, false, message, 404);
}

export function serverErrorResponse(
  res: Response,
  message: string = 'خطأ في الخادم',
  error?: any
): Response {
  console.error('Server Error:', error);
  return apiResponse(res, false, message, 500, undefined, error);
} 