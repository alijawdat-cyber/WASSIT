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

export default function ProviderRequestDetails() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<Request | null>(null);
  const [myOffer, setMyOffer] = useState<Offer | null>(null);
  const [offerFormData, setOfferFormData] = useState({
    proposedPrice: '',
    proposedDays: '',
    message: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // التحقق من المصادقة وتحميل تفاصيل الطلب
  useEffect(() => {
    const fetchRequestDetails = async () => {
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
        
        // التحقق من صحة معرف الطلب
        const requestIdNum = parseInt(requestId);
        if (isNaN(requestIdNum) || requestIdNum <= 0) {
          setError('معرّف الطلب غير صالح');
          setLoading(false);
          return;
        }
        
        // تحميل تفاصيل الطلب
        const requestResponse = await requestsAPI.getRequestById(requestIdNum);
        
        if (requestResponse.success && requestResponse.data) {
          setRequest(requestResponse.data);
          
          // التحقق مما إذا كان لدي عرض مقدم بالفعل على هذا الطلب
          try {
            const myOffersResponse = await offersAPI.getMyOfferForRequest(requestIdNum);
            
            if (myOffersResponse.success && myOffersResponse.data) {
              setMyOffer(myOffersResponse.data);
            }
          } catch (offerErr) {
            console.error('خطأ في تحميل بيانات العرض الخاص بي:', offerErr);
            // لا نعرض خطأ للمستخدم هنا لأن التطبيق يمكن أن يعمل بدون تحميل العرض الخاص بي
          }
        } else {
          setError(requestResponse.message || 'لم يتم العثور على الطلب المطلوب');
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

  // معالجة تغيير الحقول
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfferFormData((prev) => ({ ...prev, [name]: value }));
  };

  // إرسال العرض
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!offerFormData.proposedPrice.trim() || !offerFormData.proposedDays.trim()) {
      setFormError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    if (isNaN(Number(offerFormData.proposedPrice)) || isNaN(Number(offerFormData.proposedDays))) {
      setFormError('يرجى إدخال أرقام صحيحة للسعر والمدة');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError(null);
      
      const offerData = {
        requestId: parseInt(requestId),
        proposedPrice: parseFloat(offerFormData.proposedPrice),
        proposedDays: parseInt(offerFormData.proposedDays),
        message: offerFormData.message,
      };
      
      const response = await offersAPI.createOffer(offerData);
      
      if (response.success && response.data) {
        setMyOffer(response.data);
        setShowForm(false);
        
        // إعادة تحميل الطلب لتحديث الحالة
        const requestResponse = await requestsAPI.getRequestById(parseInt(requestId));
        if (requestResponse.success && requestResponse.data) {
          setRequest(requestResponse.data);
        }
      } else {
        setFormError(response.message || 'فشل إرسال العرض. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('خطأ في إرسال العرض:', err);
      setFormError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  // رفع نتائج العمل
  const handleSubmitWork = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // هنا سيتم تنفيذ واجهة برمجة التطبيقات لرفع النتائج
      // في النسخة MVP سنفترض أن هذا يعمل بشكل صحيح
      
      const response = await offersAPI.markWorkAsCompleted(myOffer?.id || 0);
      
      if (response.success) {
        // تحديث حالة العرض
        const updatedOffer = { ...myOffer, workSubmitted: true } as Offer;
        setMyOffer(updatedOffer);
      } else {
        setError(response.message || 'فشل تحديث حالة العمل');
      }
    } catch (err) {
      console.error('خطأ في تحديث حالة العمل:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
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
  
  // عرض نموذج تقديم العرض
  const renderOfferForm = () => {
    return (
      <form onSubmit={handleSubmitOffer} className="mt-6">
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {formError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="proposedPrice" className="block text-gray-700 font-medium mb-2">
              السعر المقترح *
            </label>
            <div className="relative">
              <input
                type="text"
                id="proposedPrice"
                name="proposedPrice"
                value={offerFormData.proposedPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 ps-10 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="proposedDays" className="block text-gray-700 font-medium mb-2">
              مدة التنفيذ (بالأيام) *
            </label>
            <input
              type="number"
              id="proposedDays"
              name="proposedDays"
              value={offerFormData.proposedDays}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
              placeholder="عدد الأيام"
              min="1"
              required
            />
          </div>
      </div>
      
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
            رسالة للعميل (اختياري)
          </label>
          <textarea
            id="message"
            name="message"
            value={offerFormData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary min-h-[100px]"
            placeholder="أضف تفاصيل إضافية عن عرضك..."
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            disabled={submitting}
          >
            إرسال العرض
          </Button>
        </div>
      </form>
    );
  };

  // عرض تفاصيل العرض المقدم مني
  const renderMyOffer = () => {
    if (!myOffer) return null;
    
    return (
      <Card title="العرض المقدم مني" className="mb-6">
        <div className="mb-4">
          <OfferStatusBadge status={myOffer.status} className="mb-4" />
          
          <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
              <span className="text-gray-600 text-sm">السعر المقترح:</span>
              <div className="font-bold text-primary">${myOffer.proposedPrice}</div>
                </div>
            <div>
              <span className="text-gray-600 text-sm">مدة التنفيذ:</span>
              <div className="font-medium">
                {myOffer.proposedDays} {myOffer.proposedDays === 1 ? 'يوم' : myOffer.proposedDays && myOffer.proposedDays <= 10 ? 'أيام' : 'يوم'}
              </div>
            </div>
          </div>
          
          {myOffer.message && (
            <div className="mb-4">
              <span className="text-gray-600 text-sm">رسالتك للعميل:</span>
              <p className="mt-1 text-gray-800">{myOffer.message}</p>
            </div>
          )}
          
          {/* عرض زر تسليم العمل فقط إذا كان العرض مقبولاً والطلب قيد التنفيذ */}
          {myOffer.status === OfferStatus.ACCEPTED && 
           request?.status === RequestStatus.IN_PROGRESS && 
           !myOffer.workSubmitted && (
            <Button
              variant="primary"
              onClick={handleSubmitWork}
              isLoading={submitting}
              disabled={submitting}
              fullWidth
            >
              تسليم العمل
            </Button>
          )}
          
          {/* عرض رسالة تأكيد التسليم إذا تم تسليم العمل */}
          {myOffer.workSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-700 font-medium mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                تم تسليم العمل
              </div>
              <p className="text-green-600">
                تم تسليم العمل بنجاح وبانتظار مراجعة العميل.
              </p>
                        </div>
                      )}
                      </div>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="bg-background py-8">
        <div className="container mx-auto px-4">
          {/* رابط العودة */}
          <div className="mb-6">
            <Button
              variant="ghost"
              href="/provider/dashboard"
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
                href="/provider/dashboard"
                variant="primary"
              >
                العودة إلى لوحة التحكم
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* تفاصيل الطلب */}
                  <Card
                    title={request.service?.name || 'خدمة غير محددة'}
                    subtitle={`طلب رقم #${request.id} • ${formatDate(request.createdAt)}`}
                    className="mb-6"
                  >
                    <div className="mb-4">
                      <RequestStatusBadge status={request.status} className="text-base" />
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
                    
                    {/* حالة الطلب النشط */}
                    {request.status === RequestStatus.OPEN && !myOffer && !showForm && (
                      <Button
                        variant="primary"
                        onClick={() => setShowForm(true)}
                      >
                        تقديم عرض
                      </Button>
                    )}
                    
                    {/* نموذج تقديم العرض */}
                    {showForm && request.status === RequestStatus.OPEN && !myOffer && renderOfferForm()}
                  </Card>
                  
                  {/* العرض المقدم مني */}
                  {myOffer && renderMyOffer()}
                </div>
                
                      <div>
                  {/* معلومات عن الإجراءات والعمولة */}
                  <Card title="معلومات هامة" className="mb-6">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 me-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        تأكد من قراءة وصف الطلب بدقة قبل تقديم عرضك.
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 me-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        يتم حجز المبلغ في نظام Escrow وسيتم تحويله إليك بعد تأكيد العميل لاستلام العمل.
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 me-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        تأكد من تسليم العمل في الوقت المحدد لتجنب أي نزاعات.
                      </li>
                    </ul>
                  </Card>
                  
                  {/* حالة الطلب */}
                  <Card title="حالة الطلب">
                    <div className="space-y-4">
                      <div className={`flex items-center ${request.status === RequestStatus.OPEN ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center me-3 ${request.status === RequestStatus.OPEN ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                          1
                        </div>
                        <span>طلب مفتوح</span>
                      </div>
                      
                      <div className={`flex items-center ${request.status === RequestStatus.IN_PROGRESS ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center me-3 ${request.status === RequestStatus.IN_PROGRESS ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                          2
                    </div>
                        <span>قيد التنفيذ</span>
                  </div>
                      
                      <div className={`flex items-center ${request.status === RequestStatus.COMPLETED ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center me-3 ${request.status === RequestStatus.COMPLETED ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                          3
                        </div>
                        <span>مكتمل</span>
                      </div>
                    </div>
                  </Card>
                  </div>
              </div>
            </>
            )}
          </div>
      </div>
    </MainLayout>
  );
} 