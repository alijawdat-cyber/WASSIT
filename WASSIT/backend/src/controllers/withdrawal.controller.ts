/**
 * مراقب طلبات السحب - Withdrawal Controller
 */
import { Request, Response } from 'express';
import * as withdrawalService from '../services/withdrawal.service';
import { WithdrawalStatus, WithdrawalFilterParams } from '../types';

/**
 * إنشاء طلب سحب جديد
 */
export async function createWithdrawalRequest(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.userId);
    const { amount, paymentMethod, paymentDetails, notes } = req.body;
    
    if (!amount || !paymentMethod || !paymentDetails) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ وطريقة الدفع وتفاصيل الدفع مطلوبة'
      });
    }
    
    const withdrawalRequest = await withdrawalService.createWithdrawalRequest({
      userId,
      amount,
      paymentMethod,
      paymentDetails,
      notes
    });
    
    res.json({
      success: true,
      withdrawalRequest
    });
  } catch (error: any) {
    console.error('خطأ في إنشاء طلب السحب:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إنشاء طلب السحب'
    });
  }
}

/**
 * الحصول على طلبات السحب للمستخدم
 */
export async function getUserWithdrawalRequests(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.userId);
    const { page, limit, status, startDate, endDate } = req.query;
    
    const filters: WithdrawalFilterParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status ? String(status) as any : undefined,
      startDate: startDate ? new Date(String(startDate)) : undefined,
      endDate: endDate ? new Date(String(endDate)) : undefined,
    };
    
    const result = await withdrawalService.getUserWithdrawalRequests(userId, filters);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على طلبات السحب:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في الحصول على طلبات السحب'
    });
  }
}

/**
 * الحصول على طلب سحب محدد
 */
export async function getWithdrawalRequest(req: Request, res: Response) {
  try {
    const withdrawalId = Number(req.params.id);
    const userId = Number(req.user?.userId);
    
    if (!withdrawalId) {
      return res.status(400).json({
        success: false,
        message: 'معرف طلب السحب مطلوب'
      });
    }
    
    const withdrawalRequest = await withdrawalService.getWithdrawalById(withdrawalId);
    
    // التحقق من أن طلب السحب ينتمي للمستخدم الحالي أو أنه مشرف
    if (withdrawalRequest.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بعرض هذا الطلب'
      });
    }
    
    res.json({
      success: true,
      withdrawalRequest
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على طلب السحب:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في الحصول على طلب السحب'
    });
  }
}

/**
 * الحصول على جميع طلبات السحب (للمشرف)
 */
export async function getAllWithdrawalRequests(req: Request, res: Response) {
  try {
    // التحقق من أن المستخدم هو مشرف
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'هذه العملية متاحة فقط للمشرفين'
      });
    }
    
    const { page, limit, status, userId, startDate, endDate } = req.query;
    
    const filters: WithdrawalFilterParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status ? String(status) as any : undefined,
      userId: userId ? Number(userId) : undefined,
      startDate: startDate ? new Date(String(startDate)) : undefined,
      endDate: endDate ? new Date(String(endDate)) : undefined,
    };
    
    const result = await withdrawalService.getAllWithdrawalRequests(filters);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على جميع طلبات السحب:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في الحصول على جميع طلبات السحب'
    });
  }
}

/**
 * تحديث حالة طلب السحب (للمشرف)
 */
export async function updateWithdrawalStatus(req: Request, res: Response) {
  try {
    // التحقق من أن المستخدم هو مشرف
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'هذه العملية متاحة فقط للمشرفين'
      });
    }
    
    const withdrawalId = Number(req.params.id);
    const { status, adminNotes } = req.body;
    
    if (!withdrawalId || !status) {
      return res.status(400).json({
        success: false,
        message: 'معرف طلب السحب والحالة الجديدة مطلوبة'
      });
    }
    
    const withdrawalRequest = await withdrawalService.updateWithdrawalStatus(
      withdrawalId,
      status as WithdrawalStatus,
      adminNotes
    );
    
    res.json({
      success: true,
      withdrawalRequest
    });
  } catch (error: any) {
    console.error('خطأ في تحديث حالة طلب السحب:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في تحديث حالة طلب السحب'
    });
  }
} 