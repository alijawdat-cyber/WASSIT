'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Role, Dispute, DisputeStatus } from '@/types';
import DisputeList from '@/components/admin/DisputeList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

export default function AdminDisputesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من صلاحية المستخدم
  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // الحصول على جميع النزاعات
  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAllDisputes();
        
        if (response.success && response.data) {
          setDisputes(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب النزاعات');
        }
      } catch (err) {
        console.error('خطأ في جلب النزاعات:', err);
        setError('حدث خطأ أثناء جلب النزاعات');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === Role.ADMIN) {
      fetchDisputes();
    }
  }, [user]);

  // عرض صفحة تفاصيل النزاع
  const handleViewDetails = (disputeId: number) => {
    router.push(`/admin/disputes/${disputeId}`);
  };

  // عرض صفحة حل النزاع
  const handleResolveDispute = (disputeId: number) => {
    router.push(`/admin/disputes/${disputeId}/resolve`);
  };

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

  // احتساب إحصائيات النزاعات
  const openCount = disputes.filter(dispute => dispute.status === DisputeStatus.OPEN).length;
  const inReviewCount = disputes.filter(dispute => dispute.status === DisputeStatus.IN_REVIEW).length;
  const resolvedCount = disputes.filter(dispute => 
    dispute.status === DisputeStatus.RESOLVED_CLIENT || 
    dispute.status === DisputeStatus.RESOLVED_PROVIDER || 
    dispute.status === DisputeStatus.RESOLVED_PARTIAL
  ).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة النزاعات</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 mb-2">نزاعات مفتوحة</h3>
              <p className="text-xl font-bold text-red-900">{openCount}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">نزاعات قيد المراجعة</h3>
              <p className="text-xl font-bold text-yellow-900">{inReviewCount}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">نزاعات تم حلها</h3>
              <p className="text-xl font-bold text-green-900">{resolvedCount}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <DisputeList 
          disputes={disputes} 
          isLoading={isLoading} 
          error={error}
          onViewDetails={handleViewDetails}
          onResolveDispute={handleResolveDispute}
        />
      </div>
    </div>
  );
} 