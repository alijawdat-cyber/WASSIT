'use client';

import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

export default function Home() {
  return (
    <AppLayout showHeader={true} showFooter={true} containerWidth="max-w-full" className="p-0">
      <div className="bg-gradient-to-s from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">منصة الوساطة للخدمات الإبداعية</h1>
            <p className="text-lg mb-8">
              وسّط هي المنصة الرائدة التي تربط بين أصحاب المشاريع ومقدمي الخدمات التسويقية والإبداعية في العراق
              بطريقة آمنة وشفافة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register?role=CLIENT" className="px-6 py-3 bg-secondary text-gray-900 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all text-center">
                احتاج خدمة
              </Link>
              <Link href="/register?role=PROVIDER" className="px-6 py-3 bg-white text-primary rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all text-center">
                أقدم خدمة
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center items-center">
            <div className="w-full max-w-md h-80 rounded-lg bg-white bg-opacity-20 relative overflow-hidden">
              {/* هنا يمكن إضافة صورة توضيحية أو رسوم متحركة */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl font-bold opacity-50">وسّط</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مميزات المنصة */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار وسّط؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">ضمان الثقة</h3>
              <p className="text-gray-600">
                نظام الحجز المالي (Escrow) يضمن حقوق الطرفين وعدم تحويل الأموال إلا بعد التسليم الناجح للخدمة.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">سهولة العملية</h3>
              <p className="text-gray-600">
                واجهة سهلة الاستخدام تمكنك من طلب الخدمة أو تقديم العروض ومتابعة حالة التنفيذ بشكل سلس ومباشر.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">وسيط محترف</h3>
              <p className="text-gray-600">
                فريق إداري محترف يشرف على المعاملات ويضمن التواصل الفعال بين الطرفين وحل أي خلافات قد تنشأ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* كيف يعمل */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">كيف يعمل وسّط؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">أنشئ طلبك</h3>
              <p className="text-gray-600">سجل حسابًا وأنشئ طلب خدمة مع وصف تفصيلي لاحتياجاتك</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">اختر أفضل عرض</h3>
              <p className="text-gray-600">استلم عروض من مقدمي الخدمات واختر الأنسب لميزانيتك</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">تابع العمل</h3>
              <p className="text-gray-600">تواصل مع مقدم الخدمة وتابع مراحل التنفيذ حتى الانتهاء</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">4</div>
              <h3 className="text-xl font-bold mb-2">استلم واقيّم</h3>
              <p className="text-gray-600">استلم العمل النهائي وقيّم مقدم الخدمة لمساعدة الآخرين</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              اعرف المزيد عن كيفية عمل المنصة
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* دعوة للتسجيل */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">ابدأ الآن مع وسّط</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            سواء كنت صاحب مشروع يبحث عن خدمات إبداعية أو كنت مقدم خدمة محترف، انضم إلينا الآن وابدأ تجربة مختلفة!
          </p>
          <Link href="/register" className="px-8 py-4 bg-secondary text-gray-900 rounded-lg text-xl font-bold hover:bg-opacity-90 transition-all inline-block">
            سجل مجانًا
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
