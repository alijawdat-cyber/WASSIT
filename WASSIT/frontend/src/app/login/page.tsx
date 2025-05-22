'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export default function Login() {
  const router = useRouter();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!formData.email || !formData.password) {
        setError('يرجى تعبئة جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      // محاولة تسجيل الدخول
      const success = await login(formData);

      if (success) {
        // إعادة التوجيه بعد تسجيل الدخول بنجاح
        router.push('/');
      } else {
        // عرض رسالة الخطأ المستلمة من سياق المصادقة
        setError(authError || 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      console.error('حدث خطأ أثناء تسجيل الدخول:', err);
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showHeader={true} showFooter={true} containerWidth="max-w-md">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
            <p className="text-gray-600">
              مرحبًا بعودتك! يرجى تسجيل الدخول للوصول إلى حسابك
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
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

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium"
                >
                  كلمة المرور
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-primary text-white rounded-lg font-medium transition-colors ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-primary-dark'
              }`}
            >
              {loading ? 'جارِ تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 