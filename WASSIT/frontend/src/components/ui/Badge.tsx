'use client';

import React, { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: BadgeProps) => {
  // الحصول على فئات CSS بناءً على النوع
  const getVariantClasses = (variant: BadgeVariant): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-light/20 text-primary-dark';
      case 'secondary':
        return 'bg-secondary-light/20 text-secondary-dark';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'gray':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-primary-light/20 text-primary-dark';
    }
  };

  // الحصول على فئات CSS بناءً على الحجم
  const getSizeClasses = (size: BadgeSize): string => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2.5 py-0.5 text-sm';
      case 'lg':
        return 'px-3 py-1 text-base';
      default:
        return 'px-2.5 py-0.5 text-sm';
    }
  };

  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge; 