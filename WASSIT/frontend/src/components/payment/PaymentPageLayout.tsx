'use client';

import React, { ReactNode } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface PaymentPageLayoutProps {
  children: ReactNode;
  title: string;
  onBack?: () => void;
  backText?: string;
  showBackButton?: boolean;
  actionButton?: ReactNode;
}

const PaymentPageLayout: React.FC<PaymentPageLayoutProps> = ({
  children,
  title,
  onBack,
  backText = 'العودة',
  showBackButton = true,
  actionButton,
}) => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="flex gap-2">
            {actionButton}
            {showBackButton && (
              <button
                onClick={onBack}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
              >
                {backText}
              </button>
            )}
          </div>
        </div>
        {children}
      </div>
    </MainLayout>
  );
};

export default PaymentPageLayout; 