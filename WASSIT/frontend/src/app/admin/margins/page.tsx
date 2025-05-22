'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Role } from '@/types';
import MarginManager from '@/components/admin/MarginManager';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

interface MarginPolicy {
  id?: number;
  serviceId: number;
  serviceName?: string;
  minAmount: number;
  maxAmount: number | null;
  marginType: 'percentage' | 'fixed';
  marginValue: number;
  active: boolean;
}

interface Service {
  id: number;
  name: string;
}

export default function AdminMarginsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [marginPolicies, setMarginPolicies] = useState<MarginPolicy[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من صلاحية المستخدم
  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // الحصول على سياسات الهوامش والخدمات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // الحصول على سياسات الهوامش
        const policiesResponse = await adminAPI.getMarginPolicies();
        
        // الحصول على الخدمات
        const servicesResponse = await adminAPI.getAllServices();
        
        if (policiesResponse.success && policiesResponse.data) {
          setMarginPolicies(policiesResponse.data);
        } else {
          setError(policiesResponse.message || 'حدث خطأ أثناء جلب سياسات الهوامش');
        }
        
        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
        }
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
        setError('حدث خطأ أثناء جلب البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === Role.ADMIN) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مديرًا، لا نعرض المحتوى
  if (!user || user.role !== Role.ADMIN) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة هوامش الربح</h1>
        <a 
          href="/admin/dashboard"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
        >
          العودة للوحة التحكم
        </a>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">معلومات حول هوامش الربح</h2>
          <div className="prose max-w-none text-gray-600">
            <p>هوامش الربح هي المبالغ المضافة على سعر مقدم الخدمة والتي تشكل إيرادات المنصة. يمكنك تحديد سياسات مختلفة لاحتساب هوامش الربح بناءً على:</p>
            <ul className="list-disc list-inside mb-4">
              <li>نوع الخدمة المقدمة</li>
              <li>نطاق المبلغ (من قيمة معينة إلى قيمة أخرى)</li>
              <li>نوع الهامش (نسبة مئوية أو مبلغ ثابت)</li>
            </ul>
            <p>عند تقديم عرض جديد، سيتم تطبيق سياسة الهامش المناسبة تلقائيًا وإضافة الهامش لتحديد السعر النهائي للعميل.</p>
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-lg shadow p-6">
        <MarginManager
          initialPolicies={marginPolicies}
          services={services}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
} 