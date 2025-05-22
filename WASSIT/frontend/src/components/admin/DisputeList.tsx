'use client';

import React, { useState } from 'react';
import { Dispute, DisputeStatus, User } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/date-utils';

interface DisputeListProps {
  disputes: Dispute[];
  isLoading: boolean;
  error: string | null;
  onViewDetails?: (disputeId: number) => void;
  onResolveDispute?: (disputeId: number) => void;
}

const DisputeList: React.FC<DisputeListProps> = ({ 
  disputes, 
  isLoading, 
  error, 
  onViewDetails,
  onResolveDispute
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // فلترة وترتيب النزاعات
  const filteredDisputes = disputes
    .filter(dispute => {
      // استخدام رقم النزاع أو سبب النزاع للبحث
      const idMatch = String(dispute.id).includes(searchTerm);
      const reasonMatch = dispute.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const clientNameMatch = dispute.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const providerNameMatch = dispute.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      // فلتر حسب الحالة
      const statusMatch = statusFilter === '' || dispute.status === statusFilter;

      return (idMatch || reasonMatch || clientNameMatch || providerNameMatch) && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'id') {
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
      } else if (sortBy === 'requestId') {
        return sortDirection === 'asc' 
          ? (a.requestId || 0) - (b.requestId || 0) 
          : (b.requestId || 0) - (a.requestId || 0);
      } else if (sortBy === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      // افتراضي: ترتيب بناءً على تاريخ الإنشاء
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

  // ترجمة حالة النزاع
  const translateStatus = (status: string): string => {
    switch(status) {
      case DisputeStatus.OPEN:
        return 'مفتوح';
      case DisputeStatus.IN_REVIEW:
        return 'قيد المراجعة';
      case DisputeStatus.RESOLVED_CLIENT:
        return 'محلول لصالح العميل';
      case DisputeStatus.RESOLVED_PROVIDER:
        return 'محلول لصالح مقدم الخدمة';
      case DisputeStatus.RESOLVED_PARTIAL:
        return 'حل جزئي';
      case DisputeStatus.CANCELED:
        return 'ملغي';
      default:
        return status;
    }
  };

  // الحصول على لون خلفية حسب الحالة
  const getStatusColor = (status: string): string => {
    switch(status) {
      case DisputeStatus.OPEN:
        return 'bg-red-100 text-red-800';
      case DisputeStatus.IN_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case DisputeStatus.RESOLVED_CLIENT:
        return 'bg-green-100 text-green-800';
      case DisputeStatus.RESOLVED_PROVIDER:
        return 'bg-green-100 text-green-800';
      case DisputeStatus.RESOLVED_PARTIAL:
        return 'bg-blue-100 text-blue-800';
      case DisputeStatus.CANCELED:
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
          <h2 className="text-lg font-semibold">قائمة النزاعات</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 md:items-center">
            <div>
              <input
                type="text"
                placeholder="بحث برقم النزاع أو اسم المستخدم"
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
                <option value={DisputeStatus.OPEN}>مفتوح</option>
                <option value={DisputeStatus.IN_REVIEW}>قيد المراجعة</option>
                <option value={DisputeStatus.RESOLVED_CLIENT}>محلول لصالح العميل</option>
                <option value={DisputeStatus.RESOLVED_PROVIDER}>محلول لصالح مقدم الخدمة</option>
                <option value={DisputeStatus.RESOLVED_PARTIAL}>حل جزئي</option>
                <option value={DisputeStatus.CANCELED}>ملغي</option>
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
                رقم النزاع {getSortIcon('id')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('requestId')}
              >
                رقم الطلب {getSortIcon('requestId')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العميل
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                مقدم الخدمة
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سبب النزاع
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
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
            {filteredDisputes.length > 0 ? (
              filteredDisputes.map((dispute) => {
                const client = dispute.client as User | undefined;
                const provider = dispute.provider as User | undefined;
                
                return (
                  <tr key={dispute.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dispute.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dispute.requestId || 'غير متوفر'}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {provider?.name ? provider.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-gray-900">
                            {provider?.name || 'غير معروف'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {dispute.reason || 'غير متوفر'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {translateStatus(dispute.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(dispute.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewDetails && onViewDetails(dispute.id)}
                        className="mr-2 py-1 px-3 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        التفاصيل
                      </button>
                      {(dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.IN_REVIEW) && (
                        <button
                          onClick={() => onResolveDispute && onResolveDispute(dispute.id)}
                          className="py-1 px-3 rounded bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          حل النزاع
                        </button>
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

export default DisputeList; 