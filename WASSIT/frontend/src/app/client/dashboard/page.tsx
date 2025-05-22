'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { requestsAPI } from '@/lib/api';
import { Request, RequestStatus, Role } from '@/types';
import RequestStatusBadge from '@/components/ui/RequestStatusBadge';
import AppLayout from '@/components/layout/AppLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface RequestsResponse {
  requests: Request[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');

  // تحميل الطلبات
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await requestsAPI.getAllRequests();
        
        if (response.success && response.data) {
          // التأكد من أن البيانات مصفوفة
          if (Array.isArray(response.data)) {
            setRequests(response.data);
          } else if (response.data && typeof response.data === 'object') {
            // التحقق إذا كان هيكل البيانات يحتوي على حقل 'requests'
            const data = response.data as unknown as RequestsResponse;
            if (data.requests && Array.isArray(data.requests)) {
              setRequests(data.requests);
            } else {
              setRequests([]);
            }
          } else {
            setRequests([]);
          }
        } else {
          setError(response.message || 'حدث خطأ أثناء تحميل الطلبات');
        }
      } catch (err) {
        console.error('خطأ في تحميل الطلبات:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل الطلبات');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // تنسيق التاريخ بالعربية
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // تصفية الطلبات حسب التبويب النشط
  const filteredRequests = requests.filter((request) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return request.status === RequestStatus.OPEN;
    if (activeTab === 'in_progress') return request.status === RequestStatus.IN_PROGRESS;
    if (activeTab === 'completed') return request.status === RequestStatus.COMPLETED;
    return true;
  });

  return (
    <AppLayout requireRoles={[Role.CLIENT]} hideIfUnauthenticated={true}>
      <DashboardLayout title="لوحة تحكم العميل">
        <div className="mb-8">
          {/* شريط التبويبات */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8 rtl:space-x-reverse">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                جميع الطلبات
              </button>
              <button
                onClick={() => setActiveTab('open')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'open'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مفتوحة
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'in_progress'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                قيد التنفيذ
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مكتملة
              </button>
            </nav>
          </div>
        </div>

        {/* إضافة زر للطلب الجديد */}
        <div className="mb-4 flex justify-end">
          <Link 
            href="/client/requests/new" 
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg inline-flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ms-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            طلب خدمة جديدة
          </Link>
        </div>

        {/* عرض الطلبات */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">جاري تحميل الطلبات...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center border">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">لا توجد طلبات</h3>
            <p className="mt-2 text-gray-600">
              {activeTab === 'all' ? 'لم تقم بإنشاء أي طلبات بعد' : `لا توجد طلبات ${activeTab === 'open' ? 'مفتوحة' : activeTab === 'in_progress' ? 'قيد التنفيذ' : 'مكتملة'} حاليًا`}
            </p>
            <div className="mt-6">
              <Link
                href="/client/requests/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
              >
                إنشاء طلب جديد
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Link
                href={`/client/requests/${request.id}`}
                key={request.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold ml-2">
                        {request.service?.name || 'خدمة غير محددة'}
                      </h3>
                      <RequestStatusBadge status={request.status as RequestStatus} />
                    </div>
                    <p className="text-gray-600 line-clamp-2 mb-2">
                      {request.description.length > 100
                        ? `${request.description.substring(0, 100)}...`
                        : request.description}
                    </p>
                    <div className="text-gray-500 text-sm">
                      رقم الطلب: #{request.id} • تاريخ الإنشاء: {formatDate(request.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {request.budget && (
                      <div className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-sm">
                        <span className="font-medium">{request.budget}</span>
                      </div>
                    )}
                    {request.offers && (
                      <div className="bg-primary bg-opacity-10 text-primary py-1 px-2 rounded-full text-sm">
                        <span>{request.offers.length} عرض</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DashboardLayout>
    </AppLayout>
  );
} 