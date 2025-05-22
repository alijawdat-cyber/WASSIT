'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  fullScreen = false
}) => {
  // تحديد الحجم
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  // تحديد اللون
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-cyan-600',
    light: 'text-gray-300',
    dark: 'text-gray-800'
  };
  
  const spinnerSize = sizeClasses[size];
  const spinnerColor = colorClasses[color];
  
  // مكون مؤشر التحميل
  const spinner = (
    <svg 
      className={`animate-spin ${spinnerSize} ${spinnerColor} ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
  
  // إذا كانت قيمة fullScreen صحيحة، يتم عرض الشاشة الكاملة
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          {spinner}
          {text && <div className="mt-4 text-lg text-gray-700">{text}</div>}
        </div>
      </div>
    );
  }
  
  // وإلا، يتم عرض المؤشر فقط أو مع النص
  if (text) {
    return (
      <div className="flex items-center">
        {spinner}
        <div className="mr-3 text-gray-700">{text}</div>
      </div>
    );
  }
  
  return spinner;
};

export default LoadingSpinner; 