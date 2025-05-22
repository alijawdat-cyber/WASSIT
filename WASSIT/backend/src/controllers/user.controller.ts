import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '../utils/apiResponse';

const prisma = new PrismaClient();

/**
 * الحصول على بيانات المستخدم الحالي
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return notFoundResponse(res, 'المستخدم غير موجود');
    }
    
    // إضافة معلومات إضافية حسب نوع المستخدم
    let additionalInfo = {};
    
    if (user.role === 'PROVIDER') {
      // للمزود، نحضر وثائقه وتقييماته
      const providerDocs = await prisma.providerDoc.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          docURL: true,
          verified: true,
        },
      });
      
      const ratings = await prisma.rating.findMany({
        where: {
          toUserId: userId,
        },
        select: {
          id: true,
          score: true,
          comment: true,
          createdAt: true,
        },
      });
      
      const avgRating = ratings.length > 0
        ? ratings.reduce((total: number, rating: { score: number }) => total + rating.score, 0) / ratings.length
        : 0;
      
      additionalInfo = {
        providerDocs,
        ratings: {
          count: ratings.length,
          averageScore: parseFloat(avgRating.toFixed(2)),
          items: ratings,
        },
      };
    } else if (user.role === 'CLIENT') {
      // للعميل، نحضر عدد طلباته وتقييماته
      const requestCount = await prisma.request.count({
        where: {
          clientId: userId,
        },
      });
      
      const ratings = await prisma.rating.findMany({
        where: {
          toUserId: userId,
        },
        select: {
          id: true,
          score: true,
          comment: true,
          createdAt: true,
        },
      });
      
      const avgRating = ratings.length > 0
        ? ratings.reduce((total: number, rating: { score: number }) => total + rating.score, 0) / ratings.length
        : 0;
      
      additionalInfo = {
        requestCount,
        ratings: {
          count: ratings.length,
          averageScore: parseFloat(avgRating.toFixed(2)),
          items: ratings,
        },
      };
    }
    
    return successResponse(res, 'تم الحصول على بيانات المستخدم بنجاح', {
      user: {
        ...user,
        ...additionalInfo,
      },
    });
  } catch (error) {
    console.error('خطأ في الحصول على بيانات المستخدم:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على بيانات المستخدم');
  }
}

/**
 * تعديل بيانات المستخدم
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function updateUserProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    const { name, phone, city } = req.body;
    
    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    if (!user) {
      return notFoundResponse(res, 'المستخدم غير موجود');
    }
    
    // تحديث البيانات
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name || user.name,
        phone: phone || user.phone,
        city: city || user.city,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return successResponse(res, 'تم تحديث بيانات المستخدم بنجاح', { user: updatedUser });
  } catch (error) {
    console.error('خطأ في تحديث بيانات المستخدم:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تحديث بيانات المستخدم');
  }
}

/**
 * تغيير كلمة المرور
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function changePassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return badRequestResponse(res, 'يرجى توفير كلمة المرور الحالية والجديدة');
    }
    
    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    if (!user) {
      return notFoundResponse(res, 'المستخدم غير موجود');
    }
    
    // التحقق من صحة كلمة المرور الحالية
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return badRequestResponse(res, 'كلمة المرور الحالية غير صحيحة');
    }
    
    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // تحديث كلمة المرور
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    
    return successResponse(res, 'تم تغيير كلمة المرور بنجاح');
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تغيير كلمة المرور');
  }
}

/**
 * حذف حساب المستخدم
 * @param req طلب HTTP
 * @param res استجابة HTTP
 */
export async function deleteAccount(req: Request, res: Response) {
  try {
    if (!req.user) {
      return badRequestResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    const { userId } = req.user;
    const { password } = req.body;
    
    if (!password) {
      return badRequestResponse(res, 'يرجى توفير كلمة المرور للتأكيد');
    }
    
    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    if (!user) {
      return notFoundResponse(res, 'المستخدم غير موجود');
    }
    
    // التحقق من صحة كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return badRequestResponse(res, 'كلمة المرور غير صحيحة');
    }
    
    // في النسخة الحقيقية، قد نرغب في تعطيل الحساب بدلاً من الحذف النهائي
    // أو حذف البيانات المرتبطة أولاً
    
    // حذف الحساب
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    
    return successResponse(res, 'تم حذف الحساب بنجاح');
  } catch (error) {
    console.error('خطأ في حذف الحساب:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة حذف الحساب');
  }
} 