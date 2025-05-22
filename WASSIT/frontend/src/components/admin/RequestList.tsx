'use client';

import React, { useState } from 'react';
import { Request, RequestStatus, User, Service } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/date-utils';

interface RequestListProps {
  requests: Request[];
  isLoading: boolean;
  error: string | null;
  onViewDetails?: (requestId: number) => void;
  onApprove?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
}

const RequestList: React.FC<RequestListProps> = ({ 
  requests, 
  isLoading, 
  error, 
  onViewDetails,
  onApprove,
  onReject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // استخراج قائمة الخدمات الفريدة من الطلبات
  const uniqueServices = Array.from(new Set(
    requests
      .filter(request => request.service?.id)
      .map(request => request.service?.id)
  )).map(serviceId => {
    const serviceInfo = requests.find(request => request.service?.id === serviceId)?.service;
    return serviceInfo ? { id: serviceInfo.id, name: serviceInfo.name } : null;
  }).filter(Boolean) as { id: number; name: string }[];

  // فلترة وترتيب الطلبات
  const filteredRequests = requests
    .filter(request => {
      // تنفيذ البحث
      const idMatch = String(request.id).includes(searchTerm);
      const titleMatch = request.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const descriptionMatch = request.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const clientNameMatch = request.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

      // تطبيق فلتر الحالة والخدمة
      const statusMatch = statusFilter === '' || request.status === statusFilter;
      const serviceMatch = serviceFilter === '' || request.service?.id === parseInt(serviceFilter);

      return (idMatch || titleMatch || descriptionMatch || clientNameMatch) && statusMatch && serviceMatch;
    })
    .sort((a, b) => {
      // طرق الترتيب المختلفة
      if (sortBy === 'id') {
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
      } else if (sortBy === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'budget') {
        return sortDirection === 'asc' 
          ? (a.budget || 0) - (b.budget || 0) 
          : (b.budget || 0) - (a.budget || 0);
      }
      
      // افتراضي للترتيب
      return sortDirection === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // تغيير الترتيب
  const toggleSortDirection = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDirection('desc');
    }
  };

  // ترجمة حالة الطلب
  const translateStatus = (status: string): string => {
    switch(status) {
      case RequestStatus.PENDING:
        return 'قيد الانتظار';
      case RequestStatus.APPROVED:
        return 'تمت الموافقة';
      case RequestStatus.IN_PROGRESS:
        return 'قيد التنفيذ';
      case RequestStatus.COMPLETED:
        return 'مكتمل';
      case RequestStatus.REJECTED:
        return 'مرفوض';
      case RequestStatus.CANCELED:
        return 'ملغي';
      default:
        return status;
    }
  };

  // الحصول على لون خلفية حسب الحالة
  const getStatusColor = (status: string): string => {
    switch(status) {
      case RequestStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RequestStatus.APPROVED:
        return 'bg-blue-100 text-blue-800';
      case RequestStatus.IN_PROGRESS:
        return 'bg-indigo-100 text-indigo-800';
      case RequestStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case RequestStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case RequestStatus.CANCELED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // الترميز لأيقونات الترتيب
  const getSortIcon = (columnName: string) => {
    if (sortBy !== columnName) {
      return null;
    }
    
    return sortDirection === 'asc' 
      ? <span className="inline-block mr-1">▲</span> 
      : <span className="inline-block mr-1">▼</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold">قائمة الطلبات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                placeholder="بحث برقم الطلب أو العنوان"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">كل الحالات</option>
                <option value={RequestStatus.PENDING}>قيد الانتظار</option>
                <option value={RequestStatus.APPROVED}>تمت الموافقة</option>
                <option value={RequestStatus.IN_PROGRESS}>قيد التنفيذ</option>
                <option value={RequestStatus.COMPLETED}>مكتمل</option>
                <option value={RequestStatus.REJECTED}>مرفوض</option>
                <option value={RequestStatus.CANCELED}>ملغي</option>
              </select>
            </div>
            <div>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">كل الخدمات</option>
                {uniqueServices.map(service => (
                  <option key={service.id} value={service.id.toString()}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('id')}
              >
                رقم الطلب {getSortIcon('id')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العنوان
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العميل
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الخدمة
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('budget')}
              >
                الميزانية {getSortIcon('budget')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('createdAt')}
              >
                تاريخ الإنشاء {getSortIcon('createdAt')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => {
                const client = request.client as User | undefined;
                const service = request.service as Service | undefined;
                
                return (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {request.title || 'بلا عنوان'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {client?.name ? client.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-gray-900">
                            {client?.name || 'غير معروف'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                        {translateStatus(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.budget ? `${request.budget} د.ع` : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewDetails && onViewDetails(request.id)}
                        className="mr-2 py-1 px-3 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        التفاصيل
                      </button>
                      
                      {/* أزرار الموافقة والرفض للطلبات التي في حالة الانتظار فقط */}
                      {request.status === RequestStatus.PENDING && (
                        <>
                          <button
                            onClick={() => onApprove && onApprove(request.id)}
                            className="mr-2 py-1 px-3 rounded bg-green-50 text-green-600 hover:bg-green-100"
                          >
                            موافقة
                          </button>
                          <button
                            onClick={() => onReject && onReject(request.id)}
                            className="py-1 px-3 rounded bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            رفض
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  لا توجد نتائج مطابقة للبحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestList; 