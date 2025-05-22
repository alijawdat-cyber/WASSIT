import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { unauthorizedResponse, forbiddenResponse } from '../utils/apiResponse';
import { Role } from '../types';

// توسيع واجهة Request لإضافة معلومات المستخدم
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: Role;
        email: string;
      };
    }
  }
}

/**
 * التحقق من وجود token صالح
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return unauthorizedResponse(res, 'يجب تسجيل الدخول');
    }
    
    const token = authHeader.split(' ')[1]; // Bearer {token}
    
    if (!token) {
      return unauthorizedResponse(res, 'يجب تسجيل الدخول');
    }
    
    // التحقق من صحة الـ token
    const decoded = verifyToken(token);
    
    // إضافة بيانات المستخدم إلى الطلب
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    return unauthorizedResponse(res, 'رمز مصادقة غير صالح أو منتهي الصلاحية');
  }
}

/**
 * التحقق من أن المستخدم هو عميل
 */
export function isClient(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return unauthorizedResponse(res, 'يجب تسجيل الدخول');
  }
  
  if (req.user.role !== Role.CLIENT) {
    return forbiddenResponse(res, 'هذه العملية متاحة فقط للعملاء');
  }
  
  next();
}

/**
 * التحقق من أن المستخدم هو مقدم خدمة
 */
export function isProvider(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return unauthorizedResponse(res, 'يجب تسجيل الدخول');
  }
  
  if (req.user.role !== Role.PROVIDER) {
    return forbiddenResponse(res, 'هذه العملية متاحة فقط لمقدمي الخدمات');
  }
  
  next();
}

/**
 * التحقق من أن المستخدم هو مشرف
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return unauthorizedResponse(res, 'يجب تسجيل الدخول');
  }
  
  if (req.user.role !== Role.ADMIN) {
    return forbiddenResponse(res, 'هذه العملية متاحة فقط للمشرفين');
  }
  
  next();
} 