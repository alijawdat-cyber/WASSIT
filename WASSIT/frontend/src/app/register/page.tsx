'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import AppLayout from '@/components/layout/AppLayout';

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: Role.CLIENT, // افتراضي: عميل
    phone: '',
    city: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ضبط نوع المستخدم بناءً على المعلمة في رابط URL
  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'PROVIDER' || role === 'CLIENT') {
      setFormData((prev) => ({
        ...prev,
        role: role as Role,
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // التحقق من المدخلات
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('يرجى تعبئة جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
        setLoading(false);
        return;
      }

      // محاولة التسجيل
      const success = await register(formData);

      if (success) {
        // إعادة التوجيه بعد التسجيل بنجاح
        const redirectPath = formData.role === Role.CLIENT 
          ? '/client/dashboard' 
          : '/provider/dashboard';
        router.push(redirectPath);
      } else {
        // عرض رسالة الخطأ المستلمة من سياق المصادقة
        setError(authError || 'فشل التسجيل، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      console.error('حدث خطأ أثناء التسجيل:', err);
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showHeader={true} showFooter={true} containerWidth="max-w-7xl">
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h1>
                <p className="text-gray-600">
                  انضم إلى منصة وسّط اليوم واستفد من خدماتنا
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row md:gap-6">
                  <div className="mb-6 flex-1">
                    <label
                      htmlFor="name"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div className="mb-6 flex-1">
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:gap-6">
                  <div className="mb-6 flex-1">
                    <label
                      htmlFor="password"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                  </div>

                  <div className="mb-6 flex-1">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                      placeholder="أعد إدخال كلمة المرور"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:gap-6">
                  <div className="mb-6 flex-1">
                    <label
                      htmlFor="phone"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      رقم الهاتف (اختياري)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                      placeholder="مثال: +964 750 123 4567"
                    />
                  </div>

                  <div className="mb-6 flex-1">
                    <label
                      htmlFor="city"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      المدينة (اختياري)
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                      placeholder="مثال: بغداد"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="role"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    نوع الحساب
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: Role.CLIENT }))}
                      className={`px-4 py-3 rounded-lg border text-center transition-colors ${
                        formData.role === Role.CLIENT
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      عميل (أبحث عن خدمة)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: Role.PROVIDER }))}
                      className={`px-4 py-3 rounded-lg border text-center transition-colors ${
                        formData.role === Role.PROVIDER
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      مقدم خدمة (أقدم خدمة)
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      className="h-4 w-4 text-primary"
                      required
                    />
                    <label htmlFor="terms" className="ms-2 text-gray-700">
                      أوافق على{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        الشروط والأحكام
                      </Link>{' '}
                      و{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        سياسة الخصوصية
                      </Link>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-primary text-white rounded-lg font-medium transition-colors ${
                    loading
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-primary-dark'
                  }`}
                >
                  {loading ? 'جارِ إنشاء الحساب...' : 'إنشاء حساب'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  لديك حساب بالفعل؟{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 