'use client';

import React from 'react';
import Badge from './Badge';
import { RequestStatus } from '@/types';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const RequestStatusBadge = ({ status, className = '' }: RequestStatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case RequestStatus.OPEN:
        return 'info';
      case RequestStatus.IN_PROGRESS:
        return 'primary';
      case RequestStatus.COMPLETED:
        return 'success';
      case RequestStatus.CANCELED:
        return 'gray';
      case RequestStatus.DISPUTE:
        return 'danger';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case RequestStatus.OPEN:
        return 'مفتوح';
      case RequestStatus.IN_PROGRESS:
        return 'قيد التنفيذ';
      case RequestStatus.COMPLETED:
        return 'مكتمل';
      case RequestStatus.CANCELED:
        return 'ملغي';
      case RequestStatus.DISPUTE:
        return 'نزاع';
      default:
        return 'غير معروف';
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {getStatusText()}
    </Badge>
  );
};

export default RequestStatusBadge; 