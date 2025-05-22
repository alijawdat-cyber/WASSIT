import React from 'react';
import { Wallet } from '@/types';
import Card from '@/components/ui/Card';

interface WalletBalanceProps {
  wallet: Wallet | null;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ wallet }) => {
  if (!wallet) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-gray-500">لا توجد معلومات متاحة عن المحفظة</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">الرصيد</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm">الرصيد الكلي</p>
            <p className="text-3xl font-bold text-blue-600">
              {wallet.balance.toLocaleString('ar-IQ')}
              <span className="text-lg mr-1">د.ع</span>
            </p>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">الرصيد المتاح للسحب</p>
            <p className="text-2xl font-bold text-green-600">
              {wallet.availableBalance.toLocaleString('ar-IQ')}
              <span className="text-lg mr-1">د.ع</span>
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-gray-500 text-sm">المحفظة</p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex h-3 w-3 rounded-full mr-2 ${wallet.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <p className="text-sm">{wallet.isActive ? 'نشطة' : 'معلقة'}</p>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <p className="text-gray-500 text-sm">العملة</p>
            <p className="font-medium">{wallet.currency}</p>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <p className="text-gray-500 text-sm">آخر تحديث</p>
            <p className="font-medium">
              {new Date(wallet.updatedAt).toLocaleDateString('ar-IQ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WalletBalance; 