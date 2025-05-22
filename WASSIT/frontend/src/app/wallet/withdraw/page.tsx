'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { walletAPI } from '@/lib/api';
import { Wallet } from '@/types';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import WithdrawalForm from '@/components/payment/WithdrawalForm';

export default function WithdrawPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        // جلب بيانات المحفظة
        const response = await walletAPI.getWallet();
        
        if (response.success && response.data) {
          setWallet(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب بيانات المحفظة');
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات المحفظة:', err);
        setError('حدث خطأ أثناء الاتصال بالخادم');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, [user, router]);

  const handleWithdrawalSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await walletAPI.createWithdrawalRequest(data);
      
      if (response.success) {
        setSuccessMessage('تم إرسال طلب السحب بنجاح وهو قيد المراجعة من قبل الإدارة');
        // بعد نجاح الطلب، انتظر ثم انتقل إلى صفحة المحفظة
        setTimeout(() => {
          router.push('/wallet');
        }, 3000);
      } else {
        setError(response.message || 'حدث خطأ أثناء تقديم طلب السحب');
      }
    } catch (err) {
      console.error('خطأ في تقديم طلب السحب:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">طلب سحب رصيد</h1>
        <button
          onClick={() => router.push('/wallet')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
        >
          العودة للمحفظة
        </button>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md border border-green-200">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* معلومات الرصيد المتاح */}
          <div className="md:col-span-4">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">الرصيد المتاح للسحب</h2>
                {wallet ? (
                  <div>
                    <p className="text-3xl font-bold text-green-600 mb-2">
                      {wallet.availableBalance.toLocaleString('ar-IQ')}
                      <span className="text-lg mr-1">د.ع</span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      يمكنك سحب الرصيد المتاح فقط. الرصيد المحجوز غير متاح للسحب حتى إتمام المعاملة.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">لا توجد معلومات متاحة عن المحفظة</p>
                )}
              </div>
            </Card>
          </div>
          
          {/* نموذج طلب السحب */}
          <div className="md:col-span-8">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">معلومات طلب السحب</h2>
                {wallet && wallet.availableBalance > 0 ? (
                  <WithdrawalForm 
                    onSubmit={handleWithdrawalSubmit} 
                    maximumAmount={wallet.availableBalance}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                    <p className="font-medium">لا يمكن طلب سحب في الوقت الحالي</p>
                    <p className="text-sm mt-1">
                      {!wallet ? 'تعذر تحميل معلومات المحفظة' : 'ليس لديك رصيد متاح للسحب'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 