'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { offersAPI, requestsAPI } from '@/lib/api';
import { Offer, OfferStatus, Request } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import OfferStatusBadge from '@/components/ui/OfferStatusBadge';
import Button from '@/components/ui/Button';

export default function ProviderOffers() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<{ [key: number]: Request }>({});

  // التحقق من المصادقة وتحميل البيانات
  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (isAuthenticated && user?.role !== 'PROVIDER') {
        router.push('/client/dashboard');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // جلب عروض مقدم الخدمة
        const offersResponse = await offersAPI.getProviderOffers();
        
        if (offersResponse.success && offersResponse.data) {
          // التأكد من أن البيانات الواردة هي مصفوفة
          if (Array.isArray(offersResponse.data)) {
            setOffers(offersResponse.data);
            
            // جلب تفاصيل الطلبات المرتبطة بالعروض
            const requestIds = [...new Set(offersResponse.data.map(offer => offer.requestId))];
            const requestsMap: { [key: number]: Request } = {};
            
            for (const requestId of requestIds) {
              try {
                const requestResponse = await requestsAPI.getRequestById(requestId);
                if (requestResponse.success && requestResponse.data) {
                  requestsMap[requestId] = requestResponse.data;
                }
              } catch (err) {
                console.error(`خطأ في جلب تفاصيل الطلب ${requestId}:`, err);
              }
            }
            
            setRequestDetails(requestsMap);
          } else {
            console.error('بيانات العروض ليست بالتنسيق المتوقع:', offersResponse.data);
            setOffers([]);
          }
        } else {
          setOffers([]);
        }
      } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, isAuthenticated, authLoading, router]);

  // تنسيق التاريخ
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

  // تصفية العروض حسب الحالة
  const filteredOffers = filterStatus 
    ? offers.filter(offer => offer.status === filterStatus)
    : offers;

  // حساب عدد العروض لكل حالة
  const offerCounts = {
    all: offers.length,
    pending: offers.filter(offer => offer.status === OfferStatus.PENDING).length,
    accepted: offers.filter(offer => offer.status === OfferStatus.ACCEPTED).length,
    rejected: offers.filter(offer => offer.status === OfferStatus.REJECTED).length,
  };

  return (
    <MainLayout>
      <div className="bg-background py-8">
        <div className="container mx-auto px-4">
          {/* ترويسة الصفحة */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">إدارة العروض</h1>
                <p className="text-gray-600 mt-1">عرض وإدارة جميع العروض التي قمت بتقديمها على الطلبات</p>
              </div>
              
              {/* روابط سريعة */}
              <div className="mt-4 md:mt-0">
                <Link 
                  href="/provider/dashboard" 
                  className="bg-white border border-primary text-primary py-2 px-4 rounded-lg inline-flex items-center transition-colors hover:bg-primary-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ms-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  لوحة التحكم
                </Link>
              </div>
            </div>

            {/* أزرار التصفية */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-gray-700 me-2 font-medium">تصفية حسب الحالة:</span>
              <Button
                variant={filterStatus === null ? "primary" : "outline"}
                onClick={() => setFilterStatus(null)}
                className="!text-sm"
              >
                الكل <span className="ms-1.5 font-medium">{offerCounts.all}</span>
              </Button>
              <Button
                variant={filterStatus === OfferStatus.PENDING ? "primary" : "outline"}
                onClick={() => setFilterStatus(OfferStatus.PENDING)}
                className="!text-sm"
              >
                قيد الانتظار <span className="ms-1.5 font-medium">{offerCounts.pending}</span>
              </Button>
              <Button
                variant={filterStatus === OfferStatus.ACCEPTED ? "primary" : "outline"}
                onClick={() => setFilterStatus(OfferStatus.ACCEPTED)}
                className="!text-sm"
              >
                مقبولة <span className="ms-1.5 font-medium">{offerCounts.accepted}</span>
              </Button>
              <Button
                variant={filterStatus === OfferStatus.REJECTED ? "primary" : "outline"}
                onClick={() => setFilterStatus(OfferStatus.REJECTED)}
                className="!text-sm"
              >
                مرفوضة <span className="ms-1.5 font-medium">{offerCounts.rejected}</span>
              </Button>
            </div>
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
          ) : filteredOffers.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center border">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {filterStatus ? 'لا توجد عروض مطابقة للتصفية' : 'لا توجد عروض'}
              </h3>
              <p className="mt-2 text-gray-600">
                {filterStatus 
                  ? 'لم يتم العثور على عروض مطابقة للتصفية المحددة'
                  : 'لم تقم بتقديم أي عروض على الطلبات بعد'
                }
              </p>
              {!filterStatus && (
                <div className="mt-6">
                  <Link
                    href="/provider/requests"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                  >
                    تصفح الطلبات المتاحة
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOffers.map((offer) => {
                const request = requestDetails[offer.requestId];
                return (
                  <div
                    key={offer.id}
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      offer.status === OfferStatus.ACCEPTED
                        ? 'border-green-200'
                        : offer.status === OfferStatus.REJECTED
                        ? 'border-red-100'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="mb-4 md:mb-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-lg font-semibold">
                            {request?.service?.name || 'خدمة'}
                          </h2>
                          <span className="text-gray-500">•</span>
                          <Link 
                            href={`/provider/requests/${offer.requestId}`}
                            className="text-primary hover:underline"
                          >
                            طلب رقم #{offer.requestId}
                          </Link>
                          <div className="mx-2">
                            <OfferStatusBadge status={offer.status as OfferStatus} />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">السعر المقترح:</span>
                            <span className="font-semibold text-primary ms-1">{offer.proposedPrice} دينار</span>
                          </div>
                          <div>
                            <span className="text-gray-600">مدة التنفيذ:</span>
                            <span className="font-medium ms-1">{offer.proposedDays} يوم</span>
                          </div>
                        </div>

                        {offer.message && (
                          <div className="text-gray-700 text-sm">
                            <span className="text-gray-600">الرسالة:</span>
                            <p className="mt-1 text-gray-700">{offer.message}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className="text-gray-500 text-sm mb-2">{formatDate(offer.createdAt)}</p>
                        
                        {offer.status === OfferStatus.ACCEPTED && (
                          <Button
                            variant="primary"
                            size="sm"
                            href={`/provider/requests/${offer.requestId}`}
                          >
                            إدارة الطلب
                          </Button>
                        )}
                        
                        {offer.status === OfferStatus.PENDING && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            في انتظار الرد
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {request && (
                      <div className="pt-3 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">وصف الطلب:</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 