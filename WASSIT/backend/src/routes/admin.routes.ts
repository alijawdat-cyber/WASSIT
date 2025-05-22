import express from 'express';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware';
import * as offerController from '../controllers/offer.controller';
import * as requestController from '../controllers/request.controller';
import * as marginService from '../services/margin.service';
import { badRequestResponse, serverErrorResponse, successResponse } from '../utils/apiResponse';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ضمان أن جميع المسارات هنا تتطلب مصادقة ودور المشرف
router.use(authMiddleware, isAdmin);

/**
 * @route GET /api/admin/dashboard
 * @desc إحصائيات لوحة التحكم
 * @access خاص (المشرف فقط)
 */
router.get('/dashboard', async (req, res) => {
  try {
    // إحصائيات عامة
    const usersCount = await prisma.user.count();
    const clientsCount = await prisma.user.count({
      where: { role: 'CLIENT' },
    });
    const providersCount = await prisma.user.count({
      where: { role: 'PROVIDER' },
    });
    
    // إحصائيات الطلبات
    const requestsCount = await prisma.request.count();
    const pendingRequests = await prisma.request.count({
      where: { status: 'OPEN' },
    });
    const completedRequests = await prisma.request.count({
      where: { status: 'COMPLETED' },
    });
    
    // إحصائيات العروض
    const offersCount = await prisma.offer.count();
    const pendingOffers = await prisma.offer.count({
      where: { status: 'PENDING' },
    });
    const acceptedOffers = await prisma.offer.count({
      where: { status: 'ACCEPTED' },
    });
    
    // إحصائيات النزاعات
    const disputesCount = await prisma.dispute.count();
    const openDisputes = await prisma.dispute.count({
      where: { status: 'OPEN' },
    });
    
    return successResponse(res, 'تم الحصول على إحصائيات لوحة التحكم بنجاح', {
      users: {
        total: usersCount,
        clients: clientsCount,
        providers: providersCount,
      },
      requests: {
        total: requestsCount,
        pending: pendingRequests,
        completed: completedRequests,
      },
      offers: {
        total: offersCount,
        pending: pendingOffers,
        accepted: acceptedOffers,
      },
      disputes: {
        total: disputesCount,
        open: openDisputes,
      },
    });
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على إحصائيات لوحة التحكم');
  }
});

/**
 * @route GET /api/admin/users
 * @desc الحصول على قائمة المستخدمين
 * @access خاص (المشرف فقط)
 */
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    // إعداد مرشحات البحث
    const filters: any = {};
    
    if (role) {
      filters.role = role;
    }
    
    // حساب التخطي للصفحات
    const skip = (Number(page) - 1) * Number(limit);
    
    // الحصول على المستخدمين مع المرشحات
    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        city: true,
        createdAt: true,
        _count: {
          select: {
            requests: true,
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
    
    // حساب إجمالي المستخدمين للمرشحات المحددة
    const total = await prisma.user.count({
      where: filters,
    });
    
    return successResponse(res, 'تم الحصول على المستخدمين بنجاح', {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('خطأ في الحصول على المستخدمين:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة الحصول على المستخدمين');
  }
});

/**
 * @route PATCH /api/admin/offers/:id/margin
 * @desc تطبيق هامش ربح على عرض
 * @access خاص (المشرف فقط)
 */
router.patch('/offers/:id/margin', async (req, res) => {
  try {
    const { id } = req.params;
    const { marginPercentage } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف العرض غير صالح');
    }
    
    const offerId = Number(id);
    const margin = marginPercentage ? Number(marginPercentage) : undefined;
    
    const result = await marginService.applyMarginToOffer(offerId, margin);
    
    return successResponse(res, 'تم تطبيق هامش الربح بنجاح', result);
  } catch (error) {
    console.error('خطأ في تطبيق هامش الربح:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تطبيق هامش الربح');
  }
});

/**
 * @route PATCH /api/admin/requests/:id/offers/margin
 * @desc تطبيق هامش ربح على جميع عروض طلب معين
 * @access خاص (المشرف فقط)
 */
router.patch('/requests/:id/offers/margin', async (req, res) => {
  try {
    const { id } = req.params;
    const { marginPercentage } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return badRequestResponse(res, 'معرف الطلب غير صالح');
    }
    
    const requestId = Number(id);
    const margin = marginPercentage ? Number(marginPercentage) : undefined;
    
    const result = await marginService.applyMarginToAllOffers(requestId, margin);
    
    return successResponse(res, 'تم تطبيق هامش الربح على جميع العروض بنجاح', result);
  } catch (error) {
    console.error('خطأ في تطبيق هامش الربح على العروض:', error);
    return serverErrorResponse(res, 'حدث خطأ أثناء محاولة تطبيق هامش الربح على العروض');
  }
});

export default router; 