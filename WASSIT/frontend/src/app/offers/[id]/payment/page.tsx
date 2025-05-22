'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { walletAPI, offersAPI } from '@/lib/api';
import { Offer, Role } from '@/types';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import PaymentForm from '@/components/payment/PaymentForm';

export default function OfferPaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const offerId = params?.id ? parseInt(params.id as string) : 0;
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // التأكد من أن المستخدم الحالي عميل
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== Role.CLIENT) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // جلب بيانات العرض
  useEffect(() => {
    const fetchOfferData = async () => {
      if (!offerId) {
        setError('معرّف العرض غير صالح');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await offersAPI.getOfferById(offerId);
        
        if (response.success && response.data) {
          setOffer(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب بيانات العرض');
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات العرض:', err);
        setError('حدث خطأ أثناء الاتصال بالخادم');
      } finally {
        setIsLoading(false);
      }
    };

    if (offerId) {
      fetchOfferData();
    }
  }, [offerId]);

  // معالجة عملية الدفع
  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      setIsLoading(true);
      const response = await walletAPI.processPayment(offerId, paymentData);
      
      if (response.success) {
        setSuccessMessage('تمت عملية الدفع بنجاح! جارِ تحويلك...');
        // الانتقال إلى صفحة تفاصيل الطلب بعد نجاح عملية الدفع
        setTimeout(() => {
          router.push(`/requests/${offer?.requestId}`);
        }, 3000);
      } else {
        setError(response.message || 'حدث خطأ أثناء معالجة عملية الدفع');
      }
    } catch (err) {
      console.error('خطأ في معالجة عملية الدفع:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إتمام عملية الدفع</h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
        >
          العودة
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
          {/* معلومات العرض */}
          <div className="md:col-span-4">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">تفاصيل العرض</h2>
                {offer ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500 text-sm">رقم الطلب</p>
                      <p className="font-medium">{offer.requestId}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm">مقدم الخدمة</p>
                      <p className="font-medium">{offer.provider?.name || 'غير متوفر'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm">المبلغ المطلوب دفعه</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {offer.finalPrice?.toLocaleString('ar-IQ')}
                        <span className="text-lg mr-1">د.ع</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm">مدة التنفيذ</p>
                      <p className="font-medium">{offer.proposedDays} يوم</p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-gray-500 text-sm">ملاحظة</p>
                      <p className="mt-1">عند إتمام عملية الدفع، سيتم حجز المبلغ في ضمان المنصة حتى يتم تسليم العمل بشكل مرضٍ.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">لا توجد معلومات متاحة عن العرض</p>
                )}
              </div>
            </Card>
          </div>
          
          {/* نموذج الدفع */}
          <div className="md:col-span-8">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">معلومات الدفع</h2>
                {offer ? (
                  <PaymentForm 
                    onSubmit={handlePaymentSubmit} 
                    amount={offer.finalPrice || 0} 
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                    <p className="font-medium">لا يمكن إتمام عملية الدفع</p>
                    <p className="text-sm mt-1">تعذر تحميل معلومات العرض</p>
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