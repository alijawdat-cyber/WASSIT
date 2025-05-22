/**
 * وسيط المشرف - Admin Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';

/**
 * التحقق من أن المستخدم هو مشرف
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // التحقق من وجود المستخدم والدور الخاص به
  if (!req.user || req.user.role !== Role.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح لك بالوصول إلى هذا المسار',
    });
  }

  // المستخدم مشرف، استمر في المعالجة
  next();
}; 