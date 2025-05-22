'use client';

import React from 'react';
import { Dispute, DisputeStatus } from '@/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { AlertTriangle, MessageCircle, Eye } from 'lucide-react';
import Link from 'next/link';

interface DisputeItemProps {
  dispute: Dispute;
  userType: 'client' | 'provider' | 'admin';
}

const getStatusColor = (status: DisputeStatus): string => {
  switch (status) {
    case DisputeStatus.OPEN:
      return 'bg-yellow-100 text-yellow-800';
    case DisputeStatus.IN_REVIEW:
      return 'bg-blue-100 text-blue-800';
    case DisputeStatus.RESOLVED_CLIENT:
    case DisputeStatus.RESOLVED_PROVIDER:
    case DisputeStatus.RESOLVED_PARTIAL:
      return 'bg-green-100 text-green-800';
    case DisputeStatus.CANCELED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: DisputeStatus): string => {
  switch (status) {
    case DisputeStatus.OPEN:
      return 'مفتوح';
    case DisputeStatus.IN_REVIEW:
      return 'قيد المراجعة';
    case DisputeStatus.RESOLVED_CLIENT:
      return 'تم الحل لصالح العميل';
    case DisputeStatus.RESOLVED_PROVIDER:
      return 'تم الحل لصالح مقدم الخدمة';
    case DisputeStatus.RESOLVED_PARTIAL:
      return 'تم الحل جزئياً';
    case DisputeStatus.CANCELED:
      return 'ملغي';
    default:
      return 'غير معروف';
  }
};

const DisputeItem: React.FC<DisputeItemProps> = ({ dispute, userType }) => {
  const router = useRouter();
  const { 
    id,
    requestId,
    reason,
    status,
    createdAt,
    client,
    provider,
    request
  } = dispute;

  const formattedDate = format(new Date(createdAt), 'PPP', { locale: ar });
  const isResolved = status === DisputeStatus.RESOLVED_CLIENT || 
                      status === DisputeStatus.RESOLVED_PROVIDER || 
                      status === DisputeStatus.RESOLVED_PARTIAL;

  // تحديد العنوان والوصف للنزاع حسب نوع المستخدم
  const title = userType === 'admin' 
    ? `نزاع: ${client?.name} ضد ${provider?.name}`
    : userType === 'client'
      ? `نزاع على طلب: ${request?.service?.name || ''}`
      : `نزاع مقدم من العميل: ${client?.name}`;

  // السماح فقط للمسؤول بالتنقل إلى صفحة تفاصيل النزاع من القائمة
  const handleViewDetails = () => {
    const basePath = userType === 'client' 
      ? '/client/disputes' 
      : userType === 'provider'
        ? '/provider/disputes'
        : '/admin/disputes';
        
    router.push(`${basePath}/${id}`);
  };

  return (
    <div className="bg-white p-4 mb-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <AlertTriangle className="text-orange-500 ml-2" size={20} />
            <h3 className="text-lg font-semibold">{title}</h3>
            <span className={`mx-2 px-2 py-1 text-xs rounded-full ${getStatusColor(status as DisputeStatus)}`}>
              {getStatusText(status as DisputeStatus)}
            </span>
          </div>
          
          <p className="mt-2 text-gray-600 line-clamp-2">{reason}</p>
          
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <span>تاريخ التقديم: {formattedDate}</span>
            {request && (
              <span className="mr-4">طلب رقم: {requestId}</span>
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
          <Button
            onClick={handleViewDetails}
            className="flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
          >
            <Eye size={16} className="ml-1" />
            عرض التفاصيل
          </Button>
          
          {userType !== 'admin' && status === DisputeStatus.OPEN && (
            <Link href={`/${userType}/disputes/${id}/reply`} passHref>
              <Button className="flex items-center justify-center text-green-600 bg-green-50 hover:bg-green-100 border border-green-200">
                <MessageCircle size={16} className="ml-1" />
                إضافة رد
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeItem; 