'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from './MainLayout';
import { Role } from '@/types';

interface AppLayoutProps {
  children: ReactNode;
  customHeader?: ReactNode;
  customFooter?: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  printMode?: boolean;
  hideIfUnauthenticated?: boolean;
  requireRoles?: Role[];
  containerWidth?: 'max-w-7xl' | 'max-w-full' | 'max-w-5xl' | 'max-w-md';
  className?: string;
}

/**
 * مكون التخطيط الرئيسي للتطبيق - يوفر الدعم لمختلف السياقات والصفحات
 * يتحقق من الصلاحيات ويعالج حالات التحميل والمصادقة
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  customHeader,
  customFooter,
  showHeader = true,
  showFooter = true,
  printMode = false,
  hideIfUnauthenticated = false,
  requireRoles = [],
  containerWidth = 'max-w-7xl',
  className = '',
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  
  // التحقق من وصول المستخدم بناءً على الأدوار المطلوبة
  const hasRequiredRole = React.useMemo(() => {
    if (!requireRoles.length || !user) return true;
    return requireRoles.includes(user.role);
  }, [requireRoles, user]);
  
  // تحديد ما إذا كانت الصفحة الحالية هي في لوحة الإدارة
  const isAdminDashboard = pathname?.startsWith('/admin');
  // تحديد ما إذا كانت الصفحة الحالية هي في لوحة العميل
  const isClientDashboard = pathname?.startsWith('/client');
  // تحديد ما إذا كانت الصفحة الحالية هي في لوحة مقدم الخدمة
  const isProviderDashboard = pathname?.startsWith('/provider');
  
  // حالة التحميل
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // التحقق من صلاحية المستخدم إذا كانت مطلوبة
  if (hideIfUnauthenticated && !isAuthenticated) {
    return null;
  }
  
  // التحقق من دور المستخدم إذا كان مطلوبًا
  if (requireRoles.length > 0 && !hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">لا تملك صلاحية الوصول</h2>
          <p className="text-gray-600 mb-6">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
          <a href="/" className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    );
  }
  
  // تحديد الصفوف الإضافية بناءً على نوع اللوحة
  let dashboardClasses = '';
  if (isAdminDashboard) {
    dashboardClasses = 'admin-dashboard';
  } else if (isClientDashboard) {
    dashboardClasses = 'client-dashboard';
  } else if (isProviderDashboard) {
    dashboardClasses = 'provider-dashboard';
  }
  
  return (
    <MainLayout showFooter={showFooter} printMode={printMode}>
      {customHeader && showHeader ? customHeader : null}
      <div className={`container mx-auto px-4 py-8 ${containerWidth} ${className} ${dashboardClasses}`}>
        {children}
      </div>
      {customFooter && showFooter ? customFooter : null}
    </MainLayout>
  );
};

export default AppLayout; 