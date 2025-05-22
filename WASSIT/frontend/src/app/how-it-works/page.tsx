'use client';

import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function HowItWorksPage() {
  // خطوات عمل المنصة
  const steps = [
    {
      title: 'إنشاء حساب',
      description: 'سجّل في المنصة كعميل إذا كنت تبحث عن خدمات، أو كمقدم خدمة إذا كنت ترغب بتقديم خدماتك',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: 'إنشاء طلب خدمة',
      description: 'العميل يحدد نوع الخدمة المطلوبة ويقدم وصفاً تفصيلياً واضحاً مع ميزانية تقديرية اختيارية',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'تقديم العروض',
      description: 'يقوم مقدمو الخدمة بمراجعة الطلب وتقديم عروضهم مع السعر ومدة التنفيذ والتفاصيل',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'نظام الوساطة',
      description: 'المشرف يراجع العروض ويضيف هامش الربح قبل عرضها للعميل لضمان عدم كشف تفاصيل مالية',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'اختيار العرض',
      description: 'العميل يختار العرض المناسب ويدفع المبلغ الذي يتم حجزه مؤقتاً في نظام الـEscrow',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      title: 'تنفيذ الخدمة',
      description: 'مقدم الخدمة ينفذ العمل المطلوب ويتواصل مع العميل عبر المنصة لمناقشة التفاصيل',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'تسليم واستلام',
      description: 'بعد تسليم العمل النهائي، يقوم العميل بمراجعته وتأكيد الاستلام ليتم تحرير المبلغ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
    {
      title: 'التقييم المتبادل',
      description: 'العميل ومقدم الخدمة يقومان بتقييم بعضهما البعض لبناء سجل سمعة موثوق به',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  // مميزات المنصة
  const features = [
    {
      title: 'الوساطة المالية المأمونة',
      description: 'نظام Escrow يضمن حفظ حقوق الطرفين وعدم تسليم المبالغ إلا بعد إتمام الخدمة بنجاح',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'خصوصية أسعار الخدمات',
      description: 'لا يرى مقدم الخدمة المبلغ الذي دفعه العميل، ولا يرى العميل المبلغ الذي حصل عليه مقدم الخدمة',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: 'خصوصية التواصل',
      description: 'التواصل يتم داخل المنصة فقط، دون مشاركة معلومات الاتصال الشخصية بين العميل ومقدم الخدمة',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: 'نظام تقييم موثوق',
      description: 'نظام تقييم متبادل يسمح ببناء سمعة رقمية موثوقة لكل من العملاء ومقدمي الخدمات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="bg-background">
        {/* قسم الترويسة */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">كيف يعمل وسّط؟</h1>
            <p className="max-w-3xl mx-auto text-xl opacity-90">
              نظام وساطة مبتكر يربط بين أصحاب المشاريع ومقدمي الخدمات التسويقية والإعلامية في العراق بطريقة آمنة وشفافة
            </p>
          </div>
        </section>

        {/* خطوات العمل */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">خطوات استخدام المنصة</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                نظام سهل ومباشر يساعدك على إتمام العمل بشكل احترافي
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="relative flex mb-10">
                  {/* رقم الخطوة والخط الواصل */}
                  <div className="flex flex-col items-center me-6">
                    <div className="bg-primary text-white rounded-full p-3 z-10">
                      {step.icon}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="h-full border-l-2 border-primary border-dashed absolute top-14 bottom-0 left-5"></div>
                    )}
                  </div>

                  {/* محتوى الخطوة */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* مميزات المنصة */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">مميزات منصة وسّط</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                تم تصميم النظام بعناية لضمان تجربة آمنة وممتعة لجميع المستخدمين
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 me-4">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* دعوة للبدء */}
        <section className="py-16 bg-secondary bg-opacity-10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">مستعد للبدء؟</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              سجل الآن وابدأ بالاستفادة من منصة وسّط لإيجاد أفضل مقدمي الخدمات أو للحصول على عملاء جدد
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=CLIENT" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                سجل كعميل
              </Link>
              <Link href="/register?role=PROVIDER" className="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                سجل كمقدم خدمة
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
} 