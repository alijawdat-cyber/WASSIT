'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  href?: string;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  href,
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  // تعريف الفئات الأساسية لزر
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none';
  
  // تعريف فئات الأحجام
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };
  
  // تعريف فئات الأنواع
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark',
    secondary: 'bg-secondary text-gray-900 hover:bg-secondary-dark active:bg-secondary-dark',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };
  
  // تجميع الفئات
  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    isLoading ? 'opacity-70 cursor-not-allowed' : '',
    className,
  ].join(' ');
  
  // إنشاء محتوى الزر
  const buttonContent = (
    <>
      {isLoading && (
        <svg className="animate-spin -me-1 me-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && <span className="me-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ms-2">{rightIcon}</span>}
    </>
  );
  
  // إذا كان هناك رابط، نستخدم مكون Link
  if (href) {
    return (
      <Link href={href} className={classes}>
        {buttonContent}
      </Link>
    );
  }
  
  // وإلا نستخدم الزر العادي
  return (
    <button className={classes} disabled={isLoading} {...props}>
      {buttonContent}
    </button>
  );
};

export default Button; 