'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { requestsAPI } from '@/lib/api';
import { Request, RequestStatus, Role } from '@/types';
import RequestStatusBadge from '@/components/ui/RequestStatusBadge';

export default function ClientRequestsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // التحقق من تسجيل الدخول ودور المستخدم
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && user && user.role !== Role.CLIENT) {
      router.push('/');
      return;
    }

    // استدعاء طلبات العميل
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await requestsAPI.getAllRequests();
        
        if (response.success && response.data) {
          // التحقق من أن response.data هو مصفوفة قبل استخدام map
          if (Array.isArray(response.data)) {
            setRequests(response.data);
          } else {
            console.error('البيانات المسترجعة ليست مصفوفة:', response.data);
            setRequests([]);
          }
        } else {
          setError(response.message || 'فشل في استرجاع الطلبات');
          setRequests([]);
        }
      } catch (err) {
        console.error('خطأ في استرجاع طلبات العميل:', err);
        setError('حدث خطأ أثناء الاتصال بالخادم');
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchRequests();
    }
  }, [loading, isAuthenticated, user, router]);

  // عرض حالة التحميل
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">طلباتي</h1>
        <Link
          href="/client/requests/new"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          طلب جديد +
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">لا توجد طلبات بعد. قم بإنشاء طلب جديد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Link href={`/client/requests/${request.id}`} key={request.id}>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">
                    {request.service?.name || 'خدمة غير معروفة'}
                  </h3>
                  <RequestStatusBadge status={request.status as RequestStatus} />
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {new Date(request.createdAt).toLocaleDateString('ar-IQ')}
                  </span>
                  {request.budget && <span>الميزانية: {request.budget}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 