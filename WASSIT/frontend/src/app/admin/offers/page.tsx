'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Role, Offer } from '@/types';
import OfferList from '@/components/admin/OfferList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

export default function AdminOffersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marginModalOpen, setMarginModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<{ id: number, currentPrice: number } | null>(null);
  const [marginValue, setMarginValue] = useState<number>(0);

  // التحقق من صلاحية المستخدم
  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // الحصول على جميع العروض
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAllOffers();
        
        if (response.success && response.data) {
          setOffers(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب العروض');
        }
      } catch (err) {
        console.error('خطأ في جلب العروض:', err);
        setError('حدث خطأ أثناء جلب العروض');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === Role.ADMIN) {
      fetchOffers();
    }
  }, [user]);

  // فتح نافذة تعديل هامش الربح
  const handleUpdateMargin = (offerId: number, currentPrice: number) => {
    setSelectedOffer({ id: offerId, currentPrice });
    setMarginValue(0);
    setMarginModalOpen(true);
  };

  // إرسال تحديث هامش الربح
  const submitMarginUpdate = async () => {
    if (!selectedOffer) return;

    try {
      const finalPrice = selectedOffer.currentPrice + marginValue;
      
      const response = await adminAPI.updateOfferMargin(selectedOffer.id, finalPrice);
      
      if (response.success && response.data) {
        // تحديث العروض في الواجهة
        setOffers(prevOffers => 
          prevOffers.map(offer => 
            offer.id === selectedOffer.id 
              ? { ...offer, finalPrice: finalPrice } 
              : offer
          )
        );
        setMarginModalOpen(false);
        setSelectedOffer(null);
      } else {
        setError(response.message || 'حدث خطأ أثناء تحديث هامش الربح');
      }
    } catch (err) {
      console.error('خطأ في تحديث هامش الربح:', err);
      setError('حدث خطأ أثناء تحديث هامش الربح');
    }
  };

  // عرض صفحة تفاصيل العرض
  const handleViewDetails = (offerId: number) => {
    router.push(`/admin/offers/${offerId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مديرًا، لا نعرض المحتوى
  if (!user || user.role !== Role.ADMIN) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة العروض</h1>
        <a 
          href="/admin/dashboard"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
        >
          العودة للوحة التحكم
        </a>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">إجمالي العروض</h3>
              <p className="text-xl font-bold text-blue-900">{offers.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">العروض المقبولة</h3>
              <p className="text-xl font-bold text-green-900">
                {offers.filter(offer => offer.status === 'ACCEPTED').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">العروض قيد الانتظار</h3>
              <p className="text-xl font-bold text-yellow-900">
                {offers.filter(offer => offer.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <OfferList 
        offers={offers} 
        isLoading={isLoading} 
        error={error}
        onUpdateMargin={handleUpdateMargin}
        onViewDetails={handleViewDetails}
      />

      {/* نافذة تعديل هامش الربح */}
      {marginModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">تحديث هامش الربح</h2>
            <p className="mb-4">
              عرض رقم: {selectedOffer.id} - السعر المقترح: {selectedOffer.currentPrice} د.ع
            </p>
            
            <div className="mb-4">
              <label htmlFor="margin" className="block text-sm font-medium text-gray-700 mb-1">هامش الربح</label>
              <input
                type="number"
                id="margin"
                min="0"
                value={marginValue}
                onChange={(e) => setMarginValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                السعر النهائي للعميل: <span className="font-bold">{selectedOffer.currentPrice + marginValue} د.ع</span>
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMarginModalOpen(false)}
                className="ml-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                إلغاء
              </button>
              <button
                onClick={submitMarginUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 