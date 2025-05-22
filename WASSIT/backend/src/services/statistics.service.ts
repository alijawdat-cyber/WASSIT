/**
 * خدمة الإحصائيات والتقارير
 * توفير تقارير وإحصائيات للمشرفين عن نشاط المنصة وأداءها
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * الحصول على إحصائيات عامة عن المنصة
 * @returns إحصائيات عامة
 */
export async function getDashboardStatistics() {
  try {
    // إحصائيات المستخدمين
    const totalUsers = await prisma.user.count();
    const totalClients = await prisma.user.count({
      where: { role: 'CLIENT' }
    });
    const totalProviders = await prisma.user.count({
      where: { role: 'PROVIDER' }
    });
    
    // إحصائيات الطلبات
    const totalRequests = await prisma.request.count();
    const activeRequests = await prisma.request.count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      }
    });
    const completedRequests = await prisma.request.count({
      where: { status: 'COMPLETED' }
    });
    
    // إحصائيات العروض
    const totalOffers = await prisma.offer.count();
    const acceptedOffers = await prisma.offer.count({
      where: { status: 'ACCEPTED' }
    });
    
    // نسبة إكمال الطلبات
    const completionRate = totalRequests > 0 
      ? (completedRequests / totalRequests) * 100 
      : 0;
    
    // إحصائيات النزاعات
    const totalDisputes = await prisma.dispute.count();
    const resolvedDisputes = await prisma.dispute.count({
      where: { status: 'RESOLVED' }
    });
    
    return {
      users: {
        total: totalUsers,
        clients: totalClients,
        providers: totalProviders
      },
      requests: {
        total: totalRequests,
        active: activeRequests,
        completed: completedRequests,
        completionRate: parseFloat(completionRate.toFixed(2))
      },
      offers: {
        total: totalOffers,
        accepted: acceptedOffers,
        acceptanceRate: totalOffers > 0 
          ? parseFloat(((acceptedOffers / totalOffers) * 100).toFixed(2)) 
          : 0
      },
      disputes: {
        total: totalDisputes,
        resolved: resolvedDisputes,
        resolutionRate: totalDisputes > 0 
          ? parseFloat(((resolvedDisputes / totalDisputes) * 100).toFixed(2)) 
          : 0
      },
      timestamp: new Date()
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
    throw new Error('فشل في الحصول على إحصائيات لوحة التحكم');
  }
}

/**
 * الحصول على إحصائيات مالية للمنصة
 * @returns إحصائيات مالية
 */
export async function getFinancialStatistics() {
  try {
    // إجمالي المبالغ المحجوزة في الطلبات النشطة
    const activeEscrowQuery = await prisma.request.aggregate({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        },
        escrowAmount: {
          not: null
        }
      },
      _sum: {
        escrowAmount: true
      }
    });
    
    const activeEscrow = activeEscrowQuery._sum.escrowAmount || 0;
    
    // إجمالي المبالغ المدفوعة في الطلبات المكتملة
    const completedPaymentsQuery = await prisma.request.aggregate({
      where: {
        status: 'COMPLETED',
        escrowAmount: {
          not: null
        }
      },
      _sum: {
        escrowAmount: true
      }
    });
    
    const completedPayments = completedPaymentsQuery._sum.escrowAmount || 0;
    
    // تحويل القيم إلى أرقام للعمليات الحسابية
    const completedPaymentsNumber = typeof completedPayments === 'number' 
      ? completedPayments 
      : parseFloat(completedPayments.toString());
    
    // حساب تقديري للهوامش والأرباح (مبسط)
    // في التطبيق الحقيقي، سيتم حساب هذا بدقة أكبر
    const estimatedMargin = (completedPaymentsNumber * 0.1).toFixed(2);
    
    return {
      activeEscrow,
      completedPayments,
      estimatedMargin: parseFloat(estimatedMargin),
      currency: 'USD', // أو أي عملة أخرى مستخدمة
      timestamp: new Date()
    };
  } catch (error) {
    console.error('خطأ في الحصول على الإحصائيات المالية:', error);
    throw new Error('فشل في الحصول على الإحصائيات المالية');
  }
}

/**
 * الحصول على إحصائيات نمو المستخدمين على مدار فترة زمنية
 * @param days عدد الأيام السابقة للتحليل
 * @returns إحصائيات النمو
 */
export async function getUserGrowthStatistics(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const usersByDate = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    });
    
    // تنظيم البيانات حسب التاريخ
    // تعريف نوع مخصص للمستخدم مجمّع حسب التاريخ
    type UserDateGroup = {
      createdAt: Date;
      _count: {
        id: number;
      };
    };
    
    const growthData = usersByDate.map((item: UserDateGroup) => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }));
    
    return {
      period: `${days} days`,
      data: growthData,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات نمو المستخدمين:', error);
    throw new Error('فشل في الحصول على إحصائيات نمو المستخدمين');
  }
}

/**
 * الحصول على تقرير تفصيلي عن طلبات مكتملة خلال فترة معينة
 * @param startDate تاريخ البداية
 * @param endDate تاريخ النهاية
 * @returns تقرير الطلبات المكتملة
 */
export async function getCompletedRequestsReport(startDate: Date, endDate: Date) {
  try {
    const requests = await prisma.request.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        service: true,
        offers: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // تعريف نوع للطلب المتضمن البيانات المجمعة
    type CompletedRequestWithRelations = {
      id: number;
      client: {
        name: string;
        city: string | null;
      };
      service: {
        name: string;
      };
      offers: Array<{
        provider: {
          name: string;
          city: string | null;
        };
      }>;
      escrowAmount: any; // استخدام Decimal من Prisma
      updatedAt: Date;
    };
    
    return {
      period: {
        from: startDate,
        to: endDate
      },
      totalCount: requests.length,
      requests: requests.map((request: CompletedRequestWithRelations) => ({
        id: request.id,
        clientName: request.client.name,
        clientCity: request.client.city,
        service: request.service.name,
        providerName: request.offers[0]?.provider.name || 'غير متوفر',
        providerCity: request.offers[0]?.provider.city || 'غير متوفر',
        escrowAmount: request.escrowAmount,
        completedAt: request.updatedAt
      })),
      timestamp: new Date()
    };
  } catch (error) {
    console.error('خطأ في الحصول على تقرير الطلبات المكتملة:', error);
    throw new Error('فشل في الحصول على تقرير الطلبات المكتملة');
  }
} 