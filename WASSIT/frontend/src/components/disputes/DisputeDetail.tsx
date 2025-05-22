import React from 'react';
import { Dispute, DisputeStatus, User } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatSimpleDate } from '@/lib/date-utils';

// نوع البادج المحدد في Badge.tsx
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';

interface DisputeDetailProps {
  dispute: Dispute;
  currentUser?: User;
}

// دالة تحويل حالة النزاع إلى نص معبر بالعربية
const getStatusText = (status: DisputeStatus): string => {
  const statusMap: Record<DisputeStatus, string> = {
    OPEN: 'مفتوح',
    IN_REVIEW: 'قيد المراجعة',
    RESOLVED_CLIENT: 'تم الحل لصالح العميل',
    RESOLVED_PROVIDER: 'تم الحل لصالح مقدم الخدمة',
    RESOLVED_PARTIAL: 'تم الحل بشكل جزئي',
    CANCELED: 'ملغي'
  };
  return statusMap[status] || status;
};

// دالة تحديد نوع البادج حسب حالة النزاع
const getStatusVariant = (status: DisputeStatus): BadgeVariant => {
  const variantMap: Record<DisputeStatus, BadgeVariant> = {
    OPEN: 'danger',
    IN_REVIEW: 'warning',
    RESOLVED_CLIENT: 'success',
    RESOLVED_PROVIDER: 'success',
    RESOLVED_PARTIAL: 'success',
    CANCELED: 'gray'
  };
  return variantMap[status] || 'gray';
};

const DisputeDetail: React.FC<DisputeDetailProps> = ({ dispute, currentUser }) => {
  const isInitiator = currentUser?.id === dispute.initiatedBy;
  
  return (
    <div className="space-y-4">
      <Card 
        title={`تفاصيل النزاع #${dispute.id}`}
        subtitle={`تم إنشاء النزاع في ${formatSimpleDate(dispute.createdAt)}`}
      >
        <div className="mb-4 flex justify-between items-center">
          <h3 className="font-semibold">حالة النزاع</h3>
          <Badge variant={getStatusVariant(dispute.status as DisputeStatus)}>
            {getStatusText(dispute.status as DisputeStatus)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">سبب النزاع</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{dispute.reason}</p>
          </div>
          
          {(dispute.status !== 'OPEN' && dispute.resolution) && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-1">قرار الإدارة</h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{dispute.resolution}</p>
            </div>
          )}
          
          {dispute.refundAmount !== undefined && dispute.refundAmount > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold mb-1">مبلغ الاسترداد</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{dispute.refundAmount} دينار عراقي</p>
            </div>
          )}

          {dispute.refundPercentage !== undefined && dispute.refundPercentage > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold mb-1">نسبة الاسترداد</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{dispute.refundPercentage}%</p>
            </div>
          )}
          
          {/* معلومات الطلب */}
          {dispute.request && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">معلومات الطلب المرتبط</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">رقم الطلب:</span> #{dispute.request.id}
                </div>
                <div>
                  <span className="font-medium">تاريخ الطلب:</span> {formatSimpleDate(dispute.request.createdAt)}
                </div>
                {dispute.request.service && (
                  <div>
                    <span className="font-medium">الخدمة:</span> {dispute.request.service.name}
                  </div>
                )}
                {dispute.request.budget && (
                  <div>
                    <span className="font-medium">الميزانية:</span> {dispute.request.budget} د.ع
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* معلومات العرض */}
          {dispute.offer && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">معلومات العرض المرتبط</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">رقم العرض:</span> #{dispute.offer.id}
                </div>
                <div>
                  <span className="font-medium">تاريخ العرض:</span> {formatSimpleDate(dispute.offer.createdAt)}
                </div>
                {dispute.offer.finalPrice && (
                  <div>
                    <span className="font-medium">السعر النهائي:</span> {dispute.offer.finalPrice} د.ع
                  </div>
                )}
                {dispute.offer.proposedDays && (
                  <div>
                    <span className="font-medium">مدة التنفيذ:</span> {dispute.offer.proposedDays} يوم
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DisputeDetail; 