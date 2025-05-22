'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Role, WithdrawalRequest } from '@/types';
import WithdrawalRequestList from '@/components/admin/WithdrawalRequestList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

export default function AdminWithdrawalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // التحقق من صلاحية المستخدم
  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // الحصول على جميع طلبات السحب
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAllWithdrawalRequests();
        
        if (response.success && response.data) {
          setWithdrawalRequests(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب طلبات السحب');
        }
      } catch (err) {
        console.error('خطأ في جلب طلبات السحب:', err);
        setError('حدث خطأ أثناء جلب طلبات السحب');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === Role.ADMIN) {
      fetchWithdrawalRequests();
    }
  }, [user]);

  // الموافقة على طلب السحب
  const handleApprove = async (requestId: number) => {
    try {
      setIsLoading(true);
      const response = await adminAPI.updateWithdrawalStatus(requestId, 'approved');
      
      if (response.success && response.data) {
        setWithdrawalRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId ? { ...request, status: 'approved' } : request
          )
        );
        setSuccessMessage('تمت الموافقة على طلب السحب بنجاح');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'حدث خطأ أثناء الموافقة على طلب السحب');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('خطأ في الموافقة على طلب السحب:', err);
      setError('حدث خطأ أثناء الموافقة على طلب السحب');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // رفض طلب السحب
  const handleReject = async (requestId: number, note: string) => {
    try {
      setIsLoading(true);
      const response = await adminAPI.updateWithdrawalStatus(requestId, 'rejected', note);
      
      if (response.success && response.data) {
        setWithdrawalRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId ? { ...request, status: 'rejected', adminNotes: note } : request
          )
        );
        setSuccessMessage('تم رفض طلب السحب بنجاح');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'حدث خطأ أثناء رفض طلب السحب');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('خطأ في رفض طلب السحب:', err);
      setError('حدث خطأ أثناء رفض طلب السحب');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // عرض تفاصيل طلب السحب
  const handleViewDetails = (requestId: number) => {
    // في الإصدار الأولي يمكن عرض تفاصيل في نفس الصفحة
    // يمكن تعديلها لاحقًا للانتقال إلى صفحة تفاصيل منفصلة
    router.push(`/admin/withdrawals/${requestId}`);
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

  // احتساب إحصائيات العروض
  const pendingCount = withdrawalRequests.filter(request => request.status === 'pending').length;
  const approvedCount = withdrawalRequests.filter(request => request.status === 'approved').length;
  const rejectedCount = withdrawalRequests.filter(request => request.status === 'rejected').length;
  const processedCount = withdrawalRequests.filter(request => request.status === 'processed').length;

  // حساب إجمالي المبالغ المطلوبة
  const totalAmount = withdrawalRequests.reduce((sum, request) => sum + request.amount, 0);
  const pendingAmount = withdrawalRequests
    .filter(request => request.status === 'pending')
    .reduce((sum, request) => sum + request.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة طلبات السحب</h1>
        <a 
          href="/admin/dashboard"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
        >
          العودة للوحة التحكم
        </a>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md border border-green-200">
          {successMessage}
        </div>
      )}

      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">طلبات قيد الانتظار</h3>
              <p className="text-xl font-bold text-yellow-900">{pendingCount}</p>
              <p className="text-sm text-yellow-800">بقيمة {new Intl.NumberFormat('ar-IQ').format(pendingAmount)} د.ع</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">طلبات تمت معالجتها</h3>
              <p className="text-xl font-bold text-green-900">{processedCount}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">إجمالي المبالغ المطلوبة</h3>
              <p className="text-xl font-bold text-blue-900">{new Intl.NumberFormat('ar-IQ').format(totalAmount)} د.ع</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <WithdrawalRequestList 
          withdrawalRequests={withdrawalRequests} 
          isLoading={isLoading} 
          error={error}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
} 