import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '../utils/apiResponse';

const prisma = new PrismaClient();

/**
 * الحصول على جميع الخدمات المتاحة
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getAllServices(req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return successResponse(res, 'تم الحصول على الخدمات بنجاح', { services });
  } catch (error) {
    console.error('خطأ في الحصول على الخدمات:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على الخدمات');
  }
}

/**
 * الحصول على خدمة بواسطة المعرف
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getServiceById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف الخدمة غير صالح');
    }
    
    const service = await prisma.service.findUnique({
      where: {
        id: Number(id),
      },
    });
    
    if (!service) {
      return notFoundResponse(res, 'الخدمة غير موجودة');
    }
    
    return successResponse(res, 'تم الحصول على الخدمة بنجاح', { service });
  } catch (error) {
    console.error('خطأ في الحصول على الخدمة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على الخدمة');
  }
}

/**
 * إضافة خدمة جديدة (للمشرف فقط)
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function createService(req: Request, res: Response) {
  try {
    const { name } = req.body;
    
    if (!name) {
      return badRequestResponse(res, 'يرجى توفير اسم الخدمة');
    }
    
    // التحقق من عدم وجود خدمة بنفس الاسم
    const existingService = await prisma.service.findFirst({
      where: {
        name,
      },
    });
    
    if (existingService) {
      return badRequestResponse(res, 'توجد خدمة بهذا الاسم بالفعل');
    }
    
    // إنشاء خدمة جديدة
    const newService = await prisma.service.create({
      data: {
        name,
      },
    });
    
    return createdResponse(res, 'تم إضافة الخدمة بنجاح', { service: newService });
  } catch (error) {
    console.error('خطأ في إضافة الخدمة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة إضافة الخدمة');
  }
}

/**
 * تحديث خدمة (للمشرف فقط)
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function updateService(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف الخدمة غير صالح');
    }
    
    if (!name) {
      return badRequestResponse(res, 'يرجى توفير اسم الخدمة');
    }
    
    // التحقق من وجود الخدمة
    const service = await prisma.service.findUnique({
      where: {
        id: Number(id),
      },
    });
    
    if (!service) {
      return notFoundResponse(res, 'الخدمة غير موجودة');
    }
    
    // التحقق من عدم وجود خدمة أخرى بنفس الاسم
    const existingService = await prisma.service.findFirst({
      where: {
        name,
        id: {
          not: Number(id),
        },
      },
    });
    
    if (existingService) {
      return badRequestResponse(res, 'توجد خدمة أخرى بهذا الاسم بالفعل');
    }
    
    // تحديث الخدمة
    const updatedService = await prisma.service.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });
    
    return successResponse(res, 'تم تحديث الخدمة بنجاح', { service: updatedService });
  } catch (error) {
    console.error('خطأ في تحديث الخدمة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحديث الخدمة');
  }
}

/**
 * حذف خدمة (للمشرف فقط)
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function deleteService(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف الخدمة غير صالح');
    }
    
    // التحقق من وجود الخدمة
    const service = await prisma.service.findUnique({
      where: {
        id: Number(id),
      },
    });
    
    if (!service) {
      return notFoundResponse(res, 'الخدمة غير موجودة');
    }
    
    // التحقق من عدم استخدام الخدمة في أي طلبات
    const usedInRequests = await prisma.request.count({
      where: {
        serviceId: Number(id),
      },
    });
    
    if (usedInRequests > 0) {
      return badRequestResponse(res, 'لا يمكن حذف الخدمة لأنها مستخدمة في طلبات');
    }
    
    // حذف الخدمة
    await prisma.service.delete({
      where: {
        id: Number(id),
      },
    });
    
    return successResponse(res, 'تم حذف الخدمة بنجاح');
  } catch (error) {
    console.error('خطأ في حذف الخدمة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة حذف الخدمة');
  }
} 