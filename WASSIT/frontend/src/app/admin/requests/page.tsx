'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Role, Request, RequestStatus } from '@/types';
import RequestList from '@/components/admin/RequestList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

export default function AdminRequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // التحقق من صلاحية المستخدم
  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // الحصول على جميع الطلبات
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAllRequests();
        
        if (response.success && response.data) {
          setRequests(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب الطلبات');
        }
      } catch (err) {
        console.error('خطأ في جلب الطلبات:', err);
        setError('حدث خطأ أثناء جلب الطلبات');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === Role.ADMIN) {
      fetchRequests();
    }
  }, [user]);

  // الموافقة على الطلب
  const handleApprove = async (requestId: number) => {
    try {
      setIsLoading(true);
      const response = await adminAPI.updateRequestStatus(requestId, 'approved');
      
      if (response.success && response.data) {
        // تحديث قائمة الطلبات
        setRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId ? { ...request, status: 'approved' } : request
          )
        );
        setSuccessMessage('تمت الموافقة على الطلب بنجاح');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'حدث خطأ أثناء الموافقة على الطلب');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('خطأ في الموافقة على الطلب:', err);
      setError('حدث خطأ أثناء الموافقة على الطلب');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // رفض الطلب
  const handleReject = async (requestId: number) => {
    try {
      setIsLoading(true);
      const response = await adminAPI.updateRequestStatus(requestId, 'rejected');
      
      if (response.success && response.data) {
        // تحديث قائمة الطلبات
        setRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId ? { ...request, status: 'rejected' } : request
          )
        );
        setSuccessMessage('تم رفض الطلب بنجاح');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'حدث خطأ أثناء رفض الطلب');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('خطأ في رفض الطلب:', err);
      setError('حدث خطأ أثناء رفض الطلب');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // عرض تفاصيل الطلب
  const handleViewDetails = (requestId: number) => {
    router.push(`/admin/requests/${requestId}`);
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

  // احتساب إحصائيات الطلبات
  const pendingCount = requests.filter(request => request.status === 'pending').length;
  const approvedCount = requests.filter(request => request.status === 'approved').length;
  const inProgressCount = requests.filter(request => request.status === 'in_progress').length;
  const completedCount = requests.filter(request => request.status === 'completed').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">قيد الانتظار</h3>
              <p className="text-xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">تمت الموافقة</h3>
              <p className="text-xl font-bold text-blue-900">{approvedCount}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">قيد التنفيذ</h3>
              <p className="text-xl font-bold text-indigo-900">{inProgressCount}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">مكتملة</h3>
              <p className="text-xl font-bold text-green-900">{completedCount}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <RequestList 
          requests={requests} 
          isLoading={isLoading} 
          error={error}
          onViewDetails={handleViewDetails}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
} 