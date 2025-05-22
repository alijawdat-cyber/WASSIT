'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { servicesAPI, requestsAPI } from '@/lib/api';
import { Service } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function NewRequest() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    description: '',
    budget: '',
  });

  // التحقق من المصادقة وتحميل الخدمات
  useEffect(() => {
    const initialize = async () => {
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
        const response = await servicesAPI.getAllServices();
        
        if (response.success && response.data) {
          // التأكد من أن البيانات مصفوفة
          const servicesArray = Array.isArray(response.data) ? response.data : [];
          setServices(servicesArray);
          
          if (servicesArray.length > 0 && servicesArray[0]?.id) {
            setFormData(prev => ({ ...prev, serviceId: servicesArray[0].id.toString() }));
          }
        } else {
          setError(response.message || 'حدث خطأ أثناء تحميل الخدمات');
          setServices([]); // تأكد من أن services هو مصفوفة فارغة عند الخطأ
        }
      } catch (err) {
        console.error('خطأ في تحميل الخدمات:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل الخدمات');
        setServices([]); // تأكد من أن services هو مصفوفة فارغة عند الخطأ
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      initialize();
    }
  }, [user, isAuthenticated, authLoading, router]);

  // معالجة تغيير الحقول
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceId || !formData.description) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const requestData = {
        serviceId: parseInt(formData.serviceId),
        description: formData.description,
        budget: formData.budget !== '' ? formData.budget : undefined,
      };
      
      const response = await requestsAPI.createRequest(requestData);
      
      if (response.success && response.data) {
        setSuccess(true);
        if (response.data.id) {
          setTimeout(() => {
            router.push(`/client/requests/${response.data.id}`);
          }, 1500);
        } else {
          setTimeout(() => {
            router.push('/client/dashboard');
          }, 1500);
        }
      } else {
        setError(response.message || 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('خطأ في إنشاء الطلب:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* رأس الصفحة */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">إنشاء طلب جديد</h1>
              <p className="text-gray-600 mt-1">
                أنشئ طلب خدمة جديد للحصول على عروض من مقدمي الخدمات المحترفين
              </p>
            </div>

            {/* حالة التحميل */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">جاري التحميل...</p>
                </div>
              </div>
            ) : (
              <Card>
                {/* رسالة النجاح */}
                {success ? (
                  <div className="text-center py-8">
                    <div className="text-green-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">تم إنشاء الطلب بنجاح!</h3>
                    <p className="text-gray-600">جاري تحويلك إلى صفحة تفاصيل الطلب...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* رسالة الخطأ */}
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                        {error}
                      </div>
                    )}

                    {/* اختيار الخدمة */}
                    <div className="mb-6">
                      <label
                        htmlFor="serviceId"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        نوع الخدمة *
                      </label>
                      <select
                        id="serviceId"
                        name="serviceId"
                        value={formData.serviceId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                        required
                      >
                        {services.length === 0 ? (
                          <option value="" disabled>
                            لا توجد خدمات متاحة
                          </option>
                        ) : (
                          services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* وصف الطلب */}
                    <div className="mb-6">
                      <label
                        htmlFor="description"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        وصف الطلب *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary min-h-[150px]"
                        placeholder="اكتب وصفًا تفصيليًا للخدمة التي تريدها..."
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        يرجى تقديم وصف واضح ومفصل لما تحتاجه، وأي متطلبات أو توقعات محددة.
                      </p>
                    </div>

                    {/* الميزانية (اختياري) */}
                    <div className="mb-6">
                      <label
                        htmlFor="budget"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        الميزانية التقديرية (اختياري)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full px-4 py-3 ps-12 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                          placeholder="أدخل ميزانيتك التقديرية"
                        />
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        حدد ميزانيتك التقديرية لهذه الخدمة (اختياري)
                      </p>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={submitting}
                      >
                        إلغاء
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                        isLoading={submitting}
                      >
                        إنشاء الطلب
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 