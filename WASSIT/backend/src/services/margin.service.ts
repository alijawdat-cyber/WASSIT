/**
 * خدمة إدارة هوامش الربح
 * هذه الخدمة تتعامل مع حساب وإدارة هوامش الربح التي يضيفها المشرف على عروض مقدمي الخدمات
 */

import { PrismaClient } from '@prisma/client';
import { OfferDTO } from '../types';

const prisma = new PrismaClient();

// قيمة هامش الربح الافتراضية (10٪)
const DEFAULT_MARGIN_PERCENTAGE = 10;

/**
 * حساب السعر النهائي بعد إضافة هامش الربح
 * @param originalPrice السعر الأصلي
 * @param marginPercentage نسبة هامش الربح (اختياري، الافتراضي 10٪)
 * @returns السعر النهائي بعد إضافة الهامش
 */
export function calculateFinalPrice(
  originalPrice: number,
  marginPercentage: number = DEFAULT_MARGIN_PERCENTAGE
): number {
  // ضمان أن هامش الربح قيمة منطقية
  const validMargin = Math.max(0, Math.min(100, marginPercentage));
  
  // حساب السعر النهائي
  const finalPrice = originalPrice * (1 + validMargin / 100);
  
  // تقريب السعر لأقرب رقمين عشريين
  return Math.round(finalPrice * 100) / 100;
}

/**
 * تطبيق هامش ربح على عرض
 * @param offerId معرف العرض
 * @param marginPercentage نسبة هامش الربح (اختياري)
 * @returns العرض بعد تحديث السعر النهائي
 */
export async function applyMarginToOffer(
  offerId: number,
  marginPercentage: number = DEFAULT_MARGIN_PERCENTAGE
) {
  // الحصول على تفاصيل العرض
  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },
  });
  
  if (!offer || !offer.proposedPrice) {
    throw new Error('العرض غير موجود أو السعر المقترح غير محدد');
  }
  
  // تحويل السعر المقترح إلى رقم
  const proposedPrice = parseFloat(offer.proposedPrice.toString());
  
  // حساب السعر النهائي مع هامش الربح
  const finalPrice = calculateFinalPrice(proposedPrice, marginPercentage);
  
  // تحديث العرض بالسعر النهائي
  const updatedOffer = await prisma.offer.update({
    where: {
      id: offerId,
    },
    data: {
      finalPrice,
    },
  });
  
  return {
    originalPrice: proposedPrice,
    finalPrice,
    marginPercentage,
    offer: updatedOffer,
  };
}

/**
 * تطبيق هامش ربح على جميع العروض لطلب معين
 * @param requestId معرف الطلب
 * @param marginPercentage نسبة هامش الربح (اختياري)
 * @returns قائمة العروض بعد تحديث الأسعار النهائية
 */
export async function applyMarginToAllOffers(
  requestId: number,
  marginPercentage: number = DEFAULT_MARGIN_PERCENTAGE
) {
  // الحصول على جميع العروض للطلب
  const offers = await prisma.offer.findMany({
    where: {
      requestId,
      proposedPrice: {
        not: null,
      },
    },
  });
  
  if (offers.length === 0) {
    throw new Error('لا توجد عروض للطلب المحدد أو أن العروض لا تحتوي على أسعار مقترحة');
  }
  
  // تحديث كل عرض بالسعر النهائي
  const updatedOffers = await Promise.all(
    offers.map(async (offer: any) => {
      const proposedPrice = parseFloat(offer.proposedPrice!.toString());
      const finalPrice = calculateFinalPrice(proposedPrice, marginPercentage);
      
      return prisma.offer.update({
        where: {
          id: offer.id,
        },
        data: {
          finalPrice,
        },
      });
    })
  );
  
  return {
    count: updatedOffers.length,
    marginPercentage,
    offers: updatedOffers,
  };
} 