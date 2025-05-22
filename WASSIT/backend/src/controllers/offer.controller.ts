import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from '../utils/apiResponse';
import { OfferCreateDTO, OfferStatus, RequestStatus, Role } from '../types';

const prisma = new PrismaClient();

/**
 * الحصول على جميع العروض لطلب معين
 */
export async function getOffersByRequestId(req: Request, res: Response) {
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
    
    // الحصول على العروض للطلب
    const offers = await prisma.offer.findMany({
      where: {
        requestId: Number(requestId),
      },
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
    });
    
    return successResponse(res, 'تم الحصول على العروض بنجاح', { offers });
  } catch (error) {
    console.error('خطأ في الحصول على العروض:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على العروض');
  }
}

/**
 * الحصول على جميع العروض المقدمة من مزود الخدمة الحالي
 */
export async function getProviderOffers(req: Request, res: Response) {
  try {
    // التأكد من وجود المستخدم في الطلب بواسطة middleware
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId, role } = req.user;
    
    // التأكد من أن المستخدم هو مقدم خدمة
    if (role !== Role.PROVIDER) {
      return unauthorizedResponse(res, 'فقط مقدمي الخدمة يمكنهم الوصول إلى هذه البيانات');
    }
    
    // الحصول على العروض المقدمة من مزود الخدمة
    const offers = await prisma.offer.findMany({
      where: {
        providerId: userId,
      },
      include: {
        request: {
          select: {
            id: true,
            description: true,
            status: true,
            createdAt: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return successResponse(res, 'تم الحصول على العروض بنجاح', offers);
  } catch (error) {
    console.error('خطأ في الحصول على عروض مقدم الخدمة:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على العروض');
  }
}

/**
 * إنشاء عرض جديد من قبل مقدم الخدمة
 */
export async function createOffer(req: Request, res: Response) {
  try {
    // التأكد من وجود المستخدم في الطلب بواسطة middleware
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId, role } = req.user;
    
    // التأكد من أن المستخدم هو مقدم خدمة
    if (role !== Role.PROVIDER) {
      return unauthorizedResponse(res, 'فقط مقدمي الخدمة يمكنهم تقديم العروض');
    }
    
    const offerData: OfferCreateDTO = req.body;
    
    // التحقق من صحة البيانات
    if (!offerData.requestId || !offerData.proposedPrice || !offerData.proposedDays) {
      return badRequestResponse(res, 'يرجى توفير جميع البيانات المطلوبة');
    }
    
    // التحقق من وجود الطلب وحالته
    const request = await prisma.request.findUnique({
      where: {
        id: offerData.requestId,
      },
    });
    
    if (!request) {
      return notFoundResponse(res, 'الطلب غير موجود');
    }
    
    if (request.status !== RequestStatus.OPEN) {
      return badRequestResponse(res, 'هذا الطلب غير متاح لتقديم العروض حالياً');
    }
    
    // التحقق من عدم وجود عرض سابق من نفس مقدم الخدمة للطلب
    const existingOffer = await prisma.offer.findFirst({
      where: {
        requestId: offerData.requestId,
        providerId: userId,
      },
    });
    
    if (existingOffer) {
      return badRequestResponse(res, 'لقد قمت بتقديم عرض سابق لهذا الطلب');
    }
    
    // إنشاء العرض الجديد
    const newOffer = await prisma.offer.create({
      data: {
        requestId: offerData.requestId,
        providerId: userId,
        proposedPrice: parseFloat(String(offerData.proposedPrice)),
        proposedDays: offerData.proposedDays,
        status: OfferStatus.PENDING,
      },
      include: {
        request: {
          select: {
            description: true,
            clientId: true,
          },
        },
      },
    });
    
    return createdResponse(res, 'تم تقديم العرض بنجاح', { offer: newOffer });
  } catch (error) {
    console.error('خطأ في تقديم العرض:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تقديم العرض');
  }
}

/**
 * تعديل سعر العرض (إضافة هامش الربح) من قبل المشرف
 */
export async function updateOfferPrice(req: Request, res: Response) {
  try {
    // التأكد من وجود المستخدم في الطلب بواسطة middleware
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { role } = req.user;
    
    // التأكد من أن المستخدم هو مشرف
    if (role !== Role.ADMIN) {
      return unauthorizedResponse(res, 'فقط المشرفين يمكنهم تعديل سعر العرض');
    }
    
    const { id } = req.params;
    const { finalPrice } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف العرض غير صالح');
    }
    
    if (!finalPrice || isNaN(Number(finalPrice))) {
      return badRequestResponse(res, 'السعر النهائي غير صالح');
    }
    
    // التحقق من وجود العرض
    const offer = await prisma.offer.findUnique({
      where: {
        id: Number(id),
      },
    });
    
    if (!offer) {
      return notFoundResponse(res, 'العرض غير موجود');
    }
    
    // تحديث سعر العرض النهائي (بعد إضافة هامش الربح)
    const updatedOffer = await prisma.offer.update({
      where: {
        id: Number(id),
      },
      data: {
        finalPrice: parseFloat(String(finalPrice)),
      },
    });
    
    return successResponse(res, 'تم تحديث سعر العرض بنجاح', { offer: updatedOffer });
  } catch (error) {
    console.error('خطأ في تحديث سعر العرض:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحديث سعر العرض');
  }
}

/**
 * تحديث حالة العرض (قبول/رفض) من قبل العميل أو المشرف
 */
export async function updateOfferStatus(req: Request, res: Response) {
  try {
    // التأكد من وجود المستخدم في الطلب بواسطة middleware
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف العرض غير صالح');
    }
    
    if (!status || !Object.values(OfferStatus).includes(status as OfferStatus)) {
      return badRequestResponse(res, 'حالة العرض غير صالحة');
    }
    
    // التحقق من وجود العرض
    const offer = await prisma.offer.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        request: true,
      },
    });
    
    if (!offer) {
      return notFoundResponse(res, 'العرض غير موجود');
    }
    
    // التحقق من صلاحية المستخدم لتحديث حالة العرض
    const { userId, role } = req.user;
    
    if (role !== Role.ADMIN && offer.request.clientId !== userId) {
      return unauthorizedResponse(res, 'ليس لديك صلاحية لتحديث حالة هذا العرض');
    }
    
    // تحديث حالة العرض
    const updatedOffer = await prisma.offer.update({
      where: {
        id: Number(id),
      },
      data: {
        status: status as OfferStatus,
      },
    });
    
    // إذا تم قبول العرض، يتم تحديث حالة الطلب إلى "قيد التنفيذ"
    if (status === OfferStatus.ACCEPTED) {
      await prisma.request.update({
        where: {
          id: offer.requestId,
        },
        data: {
          status: RequestStatus.IN_PROGRESS,
          escrowAmount: offer.finalPrice || offer.proposedPrice,
        },
      });
      
      // رفض باقي العروض
      await prisma.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: {
            not: Number(id),
          },
        },
        data: {
          status: OfferStatus.REJECTED,
        },
      });
    }
    
    return successResponse(res, 'تم تحديث حالة العرض بنجاح', { offer: updatedOffer });
  } catch (error) {
    console.error('خطأ في تحديث حالة العرض:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحديث حالة العرض');
  }
} 