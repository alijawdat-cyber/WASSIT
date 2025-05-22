'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { requestsAPI, offersAPI } from '@/lib/api';
import { Request, Offer, RequestStatus, OfferStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RequestStatusBadge from '@/components/ui/RequestStatusBadge';
import OfferStatusBadge from '@/components/ui/OfferStatusBadge';

export default function RequestDetails() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<Request | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    action: 'accept_offer' | 'cancel_request' | 'complete_request' | null;
    targetId?: number;
  }>({ action: null });

  // التحقق من المصادقة وتحميل تفاصيل الطلب
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (isAuthenticated && user?.role !== 'CLIENT') {
        router.push('/provider/dashboard');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // تحميل تفاصيل الطلب
        const requestResponse = await requestsAPI.getRequestById(parseInt(requestId));
        
        if (requestResponse.success && requestResponse.data) {
          setRequest(requestResponse.data);
          
          // تحميل العروض المرتبطة بالطلب
          const offersResponse = await offersAPI.getOffersByRequestId(parseInt(requestId));
          
          if (offersResponse.success && offersResponse.data) {
            // التأكد من أن البيانات الواردة هي مصفوفة
            if (Array.isArray(offersResponse.data)) {
              setOffers(offersResponse.data);
            } else if (typeof offersResponse.data === 'object' && offersResponse.data !== null && 'offers' in offersResponse.data && Array.isArray((offersResponse.data as any).offers)) {
              // في حالة كان البيانات مغلفة في كائن يحتوي على مصفوفة offers
              setOffers((offersResponse.data as any).offers);
            } else {
              // إذا لم تكن البيانات بالشكل المتوقع، نضع مصفوفة فارغة
              console.error('بيانات العروض ليست بالتنسيق المتوقع:', offersResponse.data);
              setOffers([]);
            }
          } else {
            setOffers([]);
          }
        } else {
          setError(requestResponse.message || 'حدث خطأ أثناء تحميل الطلب');
        }
      } catch (err) {
        console.error('خطأ في تحميل تفاصيل الطلب:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل الطلب');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && requestId) {
      fetchRequestDetails();
    }
  }, [user, isAuthenticated, authLoading, router, requestId]);

  // قبول عرض
  const acceptOffer = async (offerId: number) => {
    try {
      setActionLoading(true);
      
      // تحديث حالة العرض إلى "مقبول"
      const offerResponse = await offersAPI.updateOfferStatus(offerId, OfferStatus.ACCEPTED);
      
      if (offerResponse.success) {
        // تحديث حالة الطلب إلى "قيد التنفيذ"
        const requestResponse = await requestsAPI.updateRequestStatus(
          parseInt(requestId),
          'IN_PROGRESS'
        );
        
        if (requestResponse.success) {
          // تحديث البيانات في الواجهة
          setRequest(requestResponse.data || null);
          
          // تحديث حالة العروض
          const updatedOffers = offers.map(offer => {
            if (offer.id === offerId) {
              return { ...offer, status: OfferStatus.ACCEPTED };
            } else {
              return { ...offer, status: OfferStatus.REJECTED };
            }
          });
          
          setOffers(updatedOffers);
        } else {
          setError(requestResponse.message || 'فشل تحديث حالة الطلب');
        }
      } else {
        setError(offerResponse.message || 'فشل تحديث حالة العرض');
      }
    } catch (err) {
      console.error('خطأ أثناء قبول العرض:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setActionLoading(false);
      setConfirmAction({ action: null });
    }
  };

  // إكمال الطلب
  const completeRequest = async () => {
    try {
      setActionLoading(true);
      
      // تحديث حالة الطلب إلى "مكتمل"
      const response = await requestsAPI.updateRequestStatus(
        parseInt(requestId),
        'COMPLETED'
      );
      
      if (response.success) {
        // تحديث البيانات في الواجهة
        setRequest(response.data || null);
      } else {
        setError(response.message || 'فشل تحديث حالة الطلب');
      }
    } catch (err) {
      console.error('خطأ أثناء إكمال الطلب:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setActionLoading(false);
      setConfirmAction({ action: null });
    }
  };

  // إلغاء الطلب
  const cancelRequest = async () => {
    try {
      setActionLoading(true);
      
      // تحديث حالة الطلب إلى "ملغي"
      const response = await requestsAPI.updateRequestStatus(
        parseInt(requestId),
        'CANCELED'
      );
      
      if (response.success) {
        // تحديث البيانات في الواجهة
        setRequest(response.data || null);
      } else {
        setError(response.message || 'فشل إلغاء الطلب');
      }
    } catch (err) {
      console.error('خطأ أثناء إلغاء الطلب:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setActionLoading(false);
      setConfirmAction({ action: null });
    }
  };

  // معالجة الأحداث
  const handleAction = (action: 'accept_offer' | 'cancel_request' | 'complete_request', targetId?: number) => {
    setConfirmAction({ action, targetId });
  };

  // تنفيذ الإجراء المؤكد
  const executeConfirmedAction = () => {
    const { action, targetId } = confirmAction;
    
    if (action === 'accept_offer' && targetId) {
      acceptOffer(targetId);
    } else if (action === 'complete_request') {
      completeRequest();
    } else if (action === 'cancel_request') {
      cancelRequest();
    }
  };

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
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      return 'تاريخ غير صالح';
    }
  };

  // تفاصيل الإجراء المؤكد
  const renderConfirmationDialog = () => {
    if (!confirmAction.action) return null;
    
    let title = '';
    let message = '';
    let confirmText = '';
    
    switch (confirmAction.action) {
      case 'accept_offer':
        title = 'تأكيد قبول العرض';
        message = 'هل أنت متأكد من قبول هذا العرض؟ سيتم رفض جميع العروض الأخرى وتغيير حالة الطلب إلى "قيد التنفيذ".';
        confirmText = 'قبول العرض';
        break;
      case 'complete_request':
        title = 'تأكيد إكمال الطلب';
        message = 'هل أنت متأكد من إكمال هذا الطلب؟ هذا يعني أنك راضٍ عن الخدمة المقدمة وستنتقل الأموال إلى مقدم الخدمة.';
        confirmText = 'إكمال الطلب';
        break;
      case 'cancel_request':
        title = 'تأكيد إلغاء الطلب';
        message = 'هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.';
        confirmText = 'إلغاء الطلب';
        break;
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setConfirmAction({ action: null })}
              disabled={actionLoading}
            >
              إلغاء
            </Button>
            <Button
              variant={confirmAction.action === 'cancel_request' ? 'danger' : 'primary'}
              onClick={executeConfirmedAction}
              isLoading={actionLoading}
              disabled={actionLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // عرض زر الإجراء حسب حالة الطلب
  const renderActionButton = () => {
    if (!request) return null;
    
    switch (request.status) {
      case 'OPEN':
        return (
          <Button
            variant="outline"
            onClick={() => handleAction('cancel_request')}
          >
            إلغاء الطلب
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <Button
            variant="primary"
            onClick={() => handleAction('complete_request')}
          >
            تأكيد استلام الخدمة
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="bg-background py-8">
        <div className="container mx-auto px-4">
          {/* رابط العودة */}
          <div className="mb-6">
            <Button
              variant="ghost"
              href="/client/dashboard"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              }
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>

          {/* حالة التحميل أو الخطأ */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">جاري تحميل تفاصيل الطلب...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="mb-8 text-center py-8">
              <div className="text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">حدث خطأ</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                محاولة مرة أخرى
              </Button>
            </Card>
          ) : !request ? (
            <Card className="mb-8 text-center py-8">
              <div className="text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">الطلب غير موجود</h3>
              <p className="text-gray-600 mb-4">لم يتم العثور على الطلب المطلوب أو ليس لديك صلاحية للوصول إليه.</p>
              <Button
                href="/client/dashboard"
                variant="primary"
              >
                العودة إلى لوحة التحكم
              </Button>
            </Card>
          ) : (
            <>
              {/* تفاصيل الطلب */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <Card
                    title={request.service?.name || 'خدمة غير محددة'}
                    subtitle={`طلب رقم #${request.id} • ${formatDate(request.createdAt)}`}
                  >
                    <div className="mb-4">
                      <RequestStatusBadge status={request.status as RequestStatus} className="text-base" />
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-gray-700 font-medium mb-2">وصف الطلب</h3>
                      <p className="text-gray-900 whitespace-pre-line">
                        {request.description}
                      </p>
                    </div>
                    
                    {request.budget && (
                      <div className="mb-6">
                        <h3 className="text-gray-700 font-medium mb-2">الميزانية التقديرية</h3>
                        <p className="text-gray-900">
                          ${request.budget}
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'IN_PROGRESS' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <h3 className="text-green-800 font-medium mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          جاري العمل على طلبك
                        </h3>
                        <p className="text-green-700">
                          مقدم الخدمة الآن يعمل على طلبك. سيتم إشعارك عند الانتهاء من التنفيذ.
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'COMPLETED' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <h3 className="text-green-800 font-medium mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          تم إكمال الطلب بنجاح
                        </h3>
                        <p className="text-green-700">
                          تم إكمال طلبك بنجاح. شكراً لاستخدامك منصة وسّط!
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'CANCELED' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <h3 className="text-gray-800 font-medium mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          تم إلغاء الطلب
                        </h3>
                        <p className="text-gray-700">
                          تم إلغاء هذا الطلب. يمكنك إنشاء طلب جديد في أي وقت.
                        </p>
                      </div>
                    )}
                    
                    {renderActionButton()}
                  </Card>
                </div>
                
                <div>
                  <Card
                    title="العروض"
                    subtitle={`${offers.length} عرض`}
                  >
                    {offers.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">لا توجد عروض على هذا الطلب حتى الآن.</p>
                        {request.status === 'OPEN' && (
                          <p className="text-gray-700">سيتم إشعارك عند وصول عروض جديدة.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Array.isArray(offers) && offers.map((offer) => (
                          <div
                            key={offer.id}
                            className={`p-4 rounded-lg border ${
                              offer.status === OfferStatus.ACCEPTED
                                ? 'bg-green-50 border-green-200'
                                : offer.status === OfferStatus.REJECTED
                                ? 'bg-gray-50 border-gray-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="font-medium">
                                {offer.provider?.name || 'مقدم خدمة'}
                              </div>
                              <OfferStatusBadge status={offer.status} />
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <span className="text-gray-600 text-sm">السعر:</span>
                                <div className="font-bold text-primary">${offer.finalPrice || offer.proposedPrice}</div>
                              </div>
                              <div>
                                <span className="text-gray-600 text-sm">مدة التنفيذ:</span>
                                <div className="font-medium">
                                  {offer.proposedDays !== undefined ? 
                                    `${offer.proposedDays} ${offer.proposedDays === 1 ? 'يوم' : offer.proposedDays <= 10 ? 'أيام' : 'يوم'}`
                                    : 'غير محدد'
                                  }
                                </div>
                              </div>
                            </div>
                            
                            {offer.status === OfferStatus.PENDING && request.status === 'OPEN' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAction('accept_offer', offer.id)}
                                fullWidth
                              >
                                قبول العرض
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </>
          )}
          
          {/* مربع حوار التأكيد */}
          {renderConfirmationDialog()}
        </div>
      </div>
    </MainLayout>
  );
} 