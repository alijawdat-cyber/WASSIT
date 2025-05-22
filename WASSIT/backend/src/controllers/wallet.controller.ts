/**
 * مراقب المحفظة - Wallet Controller
 */
import { Request, Response } from 'express';
import * as walletService from '../services/wallet.service';
import { TransactionFilterParams } from '../types';

/**
 * الحصول على محفظة المستخدم
 */
export async function getUserWallet(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.userId);
    
    const wallet = await walletService.getOrCreateWallet(userId);
    
    res.json({
      success: true,
      wallet
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على محفظة المستخدم:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في الحصول على محفظة المستخدم'
    });
  }
}

/**
 * الحصول على معاملات المستخدم
 */
export async function getUserTransactions(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.userId);
    const { page, limit, type, status, startDate, endDate } = req.query;
    
    const filters: TransactionFilterParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type: type ? String(type) as any : undefined,
      status: status ? String(status) as any : undefined,
      startDate: startDate ? new Date(String(startDate)) : undefined,
      endDate: endDate ? new Date(String(endDate)) : undefined,
    };
    
    const result = await walletService.getUserTransactions(userId, filters);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على معاملات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في الحصول على معاملات المستخدم'
    });
  }
}

/**
 * الحصول على معاملة محددة
 */
export async function getTransaction(req: Request, res: Response) {
  try {
    const transactionId = Number(req.params.id);
    const userId = Number(req.user?.userId);
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المعاملة مطلوب'
      });
    }
    
    const transaction = await walletService.getTransactionById(transactionId);
    
    // التحقق من أن المعاملة تنتمي للمستخدم الحالي أو أنه مشرف
    if (transaction.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بعرض هذه المعاملة'
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على معاملة:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في الحصول على معاملة'
    });
  }
} 