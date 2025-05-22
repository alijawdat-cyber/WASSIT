import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  badRequestResponse,
  createdResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
} from '../utils/apiResponse';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { UserCreateDTO, Role } from '../types';

const prisma = new PrismaClient();

/**
 * تسجيل مستخدم جديد
 */
export async function register(req: Request, res: Response) {
  try {
    const userData: UserCreateDTO = req.body;
    
    // التحقق من صحة البيانات
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
      return badRequestResponse(res, 'جميع الحقول المطلوبة: الاسم، البريد الإلكتروني، كلمة المرور، ونوع الحساب');
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(userData.password);
    
    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        phone: userData.phone,
        city: userData.city,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // إنشاء JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role as unknown as Role,
      email: user.email,
    });
    
    return createdResponse(res, 'تم إنشاء الحساب بنجاح', { user, token });
  } catch (error: any) {
    // التحقق من خطأ تكرار البريد الإلكتروني
    if (error.code === 'P2002') {
      return badRequestResponse(res, 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل');
    }
    return serverErrorResponse(res, 'حدث خطأ أثناء تسجيل المستخدم', error);
  }
}

/**
 * تسجيل الدخول
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    // التحقق من صحة البيانات
    if (!email || !password) {
      return badRequestResponse(res, 'البريد الإلكتروني وكلمة المرور مطلوبان');
    }
    
    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // التحقق من وجود المستخدم
    if (!user) {
      return notFoundResponse(res, 'البريد الإلكتروني غير مسجل');
    }
    
    // التحقق من صحة كلمة المرور
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'كلمة المرور غير صحيحة');
    }
    
    // إنشاء JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role as unknown as Role,
      email: user.email,
    });
    
    // إرجاع معلومات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = user;
    
    return successResponse(res, 'تم تسجيل الدخول بنجاح', { user: userWithoutPassword, token });
  } catch (error) {
    return serverErrorResponse(res, 'حدث خطأ أثناء تسجيل الدخول', error);
  }
}

/**
 * التحقق من رمز OTP (وهمي لـ MVP)
 */
export async function verifyOTP(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    
    // التحقق من صحة البيانات
    if (!email || !otp) {
      return badRequestResponse(res, 'البريد الإلكتروني ورمز التحقق مطلوبان');
    }
    
    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // التحقق من وجود المستخدم
    if (!user) {
      return notFoundResponse(res, 'البريد الإلكتروني غير مسجل');
    }
    
    // في الـ MVP نقبل أي رمز للتبسيط (بشرط أن يكون 6 أرقام)
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return badRequestResponse(res, 'رمز التحقق غير صالح، يجب أن يتكون من 6 أرقام');
    }
    
    return successResponse(res, 'تم التحقق بنجاح');
  } catch (error) {
    return serverErrorResponse(res, 'حدث خطأ أثناء التحقق من الرمز', error);
  }
}

/**
 * التحقق من صحة التوكن
 */
export async function verifyToken(req: Request, res: Response) {
  try {
    const { userId } = req.user || {};
    
    if (!userId) {
      return unauthorizedResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return notFoundResponse(res, 'المستخدم غير موجود');
    }
    
    return successResponse(res, 'التوكن صالح', { user });
  } catch (error) {
    return serverErrorResponse(res, 'حدث خطأ أثناء التحقق من التوكن', error);
  }
}

/**
 * تحديث رمز JWT
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    // في هذه الطريقة، يجب أن يكون المستخدم مسجل الدخول بالفعل
    const { userId } = req.user || {};
    
    if (!userId) {
      return unauthorizedResponse(res, 'يجب تسجيل الدخول أولاً');
    }
    
    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return notFoundResponse(res, 'المستخدم غير موجود');
    }
    
    // إنشاء JWT token جديد
    const token = generateToken({
      userId: user.id,
      role: user.role as unknown as Role,
      email: user.email,
    });
    
    return successResponse(res, 'تم تحديث رمز الوصول بنجاح', { token });
  } catch (error) {
    return serverErrorResponse(res, 'حدث خطأ أثناء تحديث رمز الوصول', error);
  }
} 