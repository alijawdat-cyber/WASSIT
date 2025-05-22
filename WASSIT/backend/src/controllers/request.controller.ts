import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '../utils/apiResponse';
import { RequestCreateDTO, RequestStatus } from '../types';

const prisma = new PrismaClient();

/**
 * الحصول على جميع الطلبات
 * يمكن استخدام مرشحات مثل الحالة أو المدينة أو نوع الخدمة
 */
export async function getAllRequests(req: Request, res: Response) {
  try {
    const { status, serviceId, city, page = 1, limit = 10 } = req.query;
    
    // إعداد مرشحات البحث
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (serviceId) {
      filters.serviceId = Number(serviceId);
    }
    
    if (city) {
      filters.client = {
        city: String(city),
      };
    }
    
    // حساب التخطي للصفحات
    const skip = (Number(page) - 1) * Number(limit);
    
    // الحصول على الطلبات مع المرشحات
    const requests = await prisma.request.findMany({
      where: filters,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        service: true,
        _count: {
          select: {
            offers: true,
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // حساب إجمالي الطلبات للمرشحات المحددة
    const total = await prisma.request.count({
      where: filters,
    });
    
    return successResponse(res, 'تم الحصول على الطلبات بنجاح', {
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('خطأ في الحصول على الطلبات:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على الطلبات');
  }
}

/**
 * الحصول على طلب واحد بواسطة المعرف مع تفاصيله
 */
export async function getRequestById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف الطلب غير صالح');
    }
    
    const request = await prisma.request.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            city: true,
            email: true,
          },
        },
        service: true,
        offers: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                city: true,
                providerDocs: {
                  select: {
                    docURL: true,
                    verified: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    return successResponse(res, 'تم الحصول على تفاصيل الطلب بنجاح', { request });
  } catch (error) {
    console.error('خطأ في الحصول على تفاصيل الطلب:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على تفاصيل الطلب');
  }
}

/**
 * إنشاء طلب جديد بواسطة العميل
 */
export async function createRequest(req: Request, res: Response) {
  try {
    // التأكد من وجود المستخدم في الطلب بواسطة middleware
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    const requestData: RequestCreateDTO = req.body;
    
    // التحقق من صحة البيانات
    if (!requestData.serviceId || !requestData.description) {
      return badRequestResponse(res, 'يرجى توفير جميع البيانات المطلوبة');
    }
    
    // التحقق من وجود الخدمة
    const serviceExists = await prisma.service.findUnique({
      where: {
        id: requestData.serviceId,
      },
    });
    
    if (!serviceExists) {
      return notFoundResponse(res, 'الخدمة المطلوبة غير موجودة');
    }
    
    // إنشاء الطلب الجديد
    const newRequest = await prisma.request.create({
      data: {
        clientId: userId,
        serviceId: requestData.serviceId,
        description: requestData.description,
        budget: requestData.budget ? parseFloat(String(requestData.budget)) : null,
        status: RequestStatus.OPEN,
      },
      include: {
        service: true,
      },
    });
    
    return createdResponse(res, 'تم إنشاء الطلب بنجاح', { request: newRequest });
  } catch (error) {
    console.error('خطأ في إنشاء الطلب:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة إنشاء الطلب');
  }
}

/**
 * تحديث حالة الطلب (للمشرف أو العميل)
 */
export async function updateRequestStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف الطلب غير صالح');
    }
    
    if (!status || !Object.values(RequestStatus).includes(status as RequestStatus)) {
      return badRequestResponse(res, 'حالة الطلب غير صالحة');
    }
    
    // التحقق من وجود الطلب
    const request = await prisma.request.findUnique({
      where: {
        id: Number(id),
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    // تحديث حالة الطلب
    const updatedRequest = await prisma.request.update({
      where: {
        id: Number(id),
      },
      data: {
        status: status as RequestStatus,
      },
    });
    
    return successResponse(res, 'تم تحديث حالة الطلب بنجاح', { request: updatedRequest });
  } catch (error) {
    console.error('خطأ في تحديث حالة الطلب:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحديث حالة الطلب');
  }
}

/**
 * حذف طلب (للمشرف أو العميل صاحب الطلب)
 */
export async function deleteRequest(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { id } = req.params;
    const { userId, role } = req.user;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف الطلب غير صالح');
    }
    
    // التحقق من وجود الطلب
    const request = await prisma.request.findUnique({
      where: {
        id: Number(id),
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    // التحقق من صلاحية الحذف (المشرف أو العميل صاحب الطلب)
    if (role !== 'ADMIN' && request.clientId !== userId) {
      return badRequestResponse(res, 'ليس لديك صلاحية لحذف هذا الطلب');
    }
    
    // حذف الطلب
    await prisma.request.delete({
      where: {
        id: Number(id),
      },
    });
    
    return successResponse(res, 'تم حذف الطلب بنجاح');
  } catch (error) {
    console.error('خطأ في حذف الطلب:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة حذف الطلب');
  }
} 