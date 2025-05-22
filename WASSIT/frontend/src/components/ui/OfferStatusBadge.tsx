'use client';

import React from 'react';
import { OfferStatus } from '@/types';

interface OfferStatusBadgeProps {
  status: OfferStatus | string;
  className?: string;
}

const OfferStatusBadge: React.FC<OfferStatusBadgeProps> = ({ status, className = '' }) => {
  // الألوان والنصوص حسب الحالة
  let textColor = '';
  let bgColor = '';
  let label = '';

  switch (status) {
    case OfferStatus.PENDING:
      textColor = 'text-orange-800';
      bgColor = 'bg-orange-100';
      label = 'قيد المراجعة';
      break;
    case OfferStatus.ACCEPTED:
      textColor = 'text-green-800';
      bgColor = 'bg-green-100';
      label = 'مقبول';
      break;
    case OfferStatus.REJECTED:
      textColor = 'text-gray-800';
      bgColor = 'bg-gray-100';
      label = 'مرفوض';
      break;
    default:
      textColor = 'text-gray-800';
      bgColor = 'bg-gray-100';
      label = 'غير معروف';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}>
      {label}
    </span>
  );
};

export default OfferStatusBadge; 