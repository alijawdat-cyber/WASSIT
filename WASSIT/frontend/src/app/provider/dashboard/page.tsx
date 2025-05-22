'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { requestsAPI, offersAPI } from '@/lib/api';
import { Request, Offer, OfferStatus, RequestStatus, Role } from '@/types';
import AppLayout from '@/components/layout/AppLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RequestStatusBadge from '@/components/ui/RequestStatusBadge';
import OfferStatusBadge from '@/components/ui/OfferStatusBadge';
import { useAuth } from '@/contexts/AuthContext';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'offers' | 'active'>('offers');

  // تحميل البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب العروض المقدمة
        const offersResponse = await offersAPI.getProviderOffers();
        
        if (offersResponse.success && offersResponse.data) {
          setOffers(offersResponse.data);
        }
        
        // جلب الطلبات النشطة
        const requestsResponse = await requestsAPI.getAllRequests({ status: RequestStatus.OPEN });
        
        if (requestsResponse.success && requestsResponse.data) {
          // التأكد من أن البيانات الواردة هي مصفوفة
          if (Array.isArray(requestsResponse.data)) {
            setActiveRequests(requestsResponse.data);
          } else if (typeof requestsResponse.data === 'object' && requestsResponse.data !== null && 'requests' in requestsResponse.data) {
            // في حالة كان البيانات مغلفة في كائن يحتوي على مصفوفة requests
            setActiveRequests((requestsResponse.data as any).requests);
          } else {
            // إذا لم تكن البيانات بالشكل المتوقع، نضع مصفوفة فارغة
            console.error('بيانات الطلبات النشطة ليست بالتنسيق المتوقع:', requestsResponse.data);
            setActiveRequests([]);
          }
        } else {
          setActiveRequests([]);
        }
        
      } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // تنسيق التاريخ بالعربية
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'غير محدد';
      
      const date = new Date(dateString);
      
      // التحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صالح';
      }
      
      return new Intl.DateTimeFormat('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      return 'تاريخ غير صالح';
    }
  };

  return (
    <AppLayout requireRoles={[Role.PROVIDER]} hideIfUnauthenticated={true}>
      <DashboardLayout title="لوحة تحكم مقدم الخدمة">
        <div className="mb-4">
          <p className="text-gray-600 mt-1">مرحباً {user?.name}، هنا يمكنك إدارة خدماتك ومتابعة الطلبات</p>
        </div>
        
        {/* روابط سريعة */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link 
            href="/provider/documentation" 
            className="bg-white border border-primary text-primary py-2 px-4 rounded-lg inline-flex items-center transition-colors hover:bg-primary-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ms-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            توثيق الحساب
          </Link>
          
          <Link 
            href="/provider/offers" 
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg inline-flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ms-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            عرض جميع العروض
          </Link>
        </div>

        {/* شريط التبويبات */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px space-x-8 rtl:space-x-reverse">
            <button
              onClick={() => setActiveTab('offers')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'offers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              عروضي
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              طلبات نشطة
            </button>
          </nav>
        </div>

        {/* عرض البيانات */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">جاري تحميل البيانات...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ms-3">
                <h3 className="text-sm font-medium text-red-800">حدث خطأ</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        ) : activeTab === 'offers' ? (
          // عرض العروض
          <div className="grid gap-4">
            {offers.length === 0 ? (
              <div className="bg-white shadow-sm rounded-lg p-8 text-center border">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">لا توجد عروض</h3>
                <p className="mt-2 text-gray-600">
                  لم تقم بتقديم أي عروض على الطلبات بعد
                </p>
                <div className="mt-6">
                  <Link
                    href="/provider/requests"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                  >
                    تصفح الطلبات المتاحة
                  </Link>
                </div>
              </div>
            ) : (
              offers.map((offer) => (
                <Link
                  href={`/provider/requests/${offer.requestId}`}
                  key={offer.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <h2 className="text-lg font-semibold">
                          طلب رقم #{offer.requestId}
                        </h2>
                        <div className="mx-2">
                          <OfferStatusBadge status={offer.status as OfferStatus} />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        السعر المقترح: {offer.proposedPrice} دينار
                      </p>
                      <p className="text-gray-600 text-sm">
                        مدة التنفيذ: {offer.proposedDays} يوم
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-gray-500 text-sm">{formatDate(offer.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          // عرض الطلبات النشطة
          <div className="grid gap-4">
            {activeRequests.length === 0 ? (
              <div className="bg-white shadow-sm rounded-lg p-8 text-center border">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">لا توجد طلبات نشطة</h3>
                <p className="mt-2 text-gray-600">
                  لا توجد طلبات مفتوحة متاحة للتقديم حالياً
                </p>
              </div>
            ) : (
              Array.isArray(activeRequests) && activeRequests.map((request) => (
                <Link
                  href={`/provider/requests/${request.id}`}
                  key={request.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <h2 className="text-lg font-semibold">
                          {request.service?.name || 'خدمة'}
                        </h2>
                        <div className="mx-2">
                          <RequestStatusBadge status={request.status as RequestStatus} />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-gray-500 text-sm">{formatDate(request.createdAt)}</p>
                      <p className="text-primary font-medium mt-2">قدّم عرضك الآن</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </DashboardLayout>
    </AppLayout>
  );
}
