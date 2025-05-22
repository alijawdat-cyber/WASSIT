'use client';

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';
import { Service } from '@/types';
import MainLayout from '@/components/layout/MainLayout';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await servicesAPI.getAllServices();
        
        if (response.success && response.data) {
          const servicesArray = Array.isArray(response.data) ? response.data : [];
          setServices(servicesArray);
        } else {
          setError(response.message || 'حدث خطأ أثناء تحميل الخدمات');
        }
      } catch (err) {
        console.error('خطأ في تحميل الخدمات:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل الخدمات');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // قائمة الخدمات بأيقونات وشرح مبسط
  const serviceDetails = [
    {
      id: 1,
      name: 'التصوير الفوتوغرافي',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'خدمات التصوير الاحترافي للمنتجات والمشاريع والفعاليات بأحدث المعدات وأفضل جودة',
    },
    {
      id: 2,
      name: 'التصميم الجرافيكي',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'تصميم هويات بصرية متكاملة، شعارات، منشورات وسائل التواصل، وتصميمات مخصصة لمختلف الاحتياجات',
    },
    {
      id: 3,
      name: 'كتابة المحتوى',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      description: 'كتابة محتوى إبداعي واحترافي للمواقع والمدونات ووسائل التواصل، وصياغة نصوص تسويقية مؤثرة',
    },
    {
      id: 4,
      name: 'إدارة وسائل التواصل',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      description: 'إدارة حسابات وسائل التواصل الاجتماعي، تخطيط المحتوى ونشره، وتحليل الأداء وتقديم تقارير دورية',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-background py-16">
        <div className="container mx-auto px-4">
          {/* ترويسة الصفحة */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا</h1>
            <p className="text-xl text-gray-600">
              نقدم مجموعة متنوعة من الخدمات الإبداعية والتسويقية عالية الجودة لتلبية احتياجات مشروعك
            </p>
          </div>

          {/* عرض الخدمات */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">جاري تحميل الخدمات...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {serviceDetails.map((service) => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-primary">{service.icon}</div>
                    <div className="ms-5">
                      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* قسم إضافي - كيفية الطلب */}
          <div className="mt-16 max-w-4xl mx-auto bg-primary bg-opacity-5 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">كيف تطلب خدمة؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">أنشئ طلب خدمة</h3>
                <p className="text-gray-600 text-sm">
                  اختر نوع الخدمة المطلوبة وقدم وصفاً تفصيلياً لاحتياجاتك
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">استلم العروض</h3>
                <p className="text-gray-600 text-sm">
                  سيقدم مزودو الخدمة عروضهم وأسعارهم ويمكنك اختيار المناسب
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">تسليم النتائج</h3>
                <p className="text-gray-600 text-sm">
                  يقوم مزود الخدمة بالعمل على طلبك وتسليم النتائج وفق الاتفاق
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 