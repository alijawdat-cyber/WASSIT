'use client';

import React, { useState } from 'react';
import { WithdrawalRequest, User } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/date-utils';

interface WithdrawalRequestListProps {
  withdrawalRequests: WithdrawalRequest[];
  isLoading: boolean;
  error: string | null;
  onApprove?: (id: number) => void;
  onReject?: (id: number, note: string) => void;
  onViewDetails?: (id: number) => void;
}

const WithdrawalRequestList: React.FC<WithdrawalRequestListProps> = ({
  withdrawalRequests,
  isLoading,
  error,
  onApprove,
  onReject,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // فلترة وترتيب طلبات السحب
  const filteredRequests = withdrawalRequests
    .filter(request => {
      // استخدام رقم المستخدم أو حالة الطلب للبحث
      const idMatch = String(request.id).includes(searchTerm);
      const userIdMatch = String(request.userId).includes(searchTerm);
      
      // فلتر حسب الحالة
      const statusMatch = statusFilter === '' || request.status === statusFilter;

      return (idMatch || userIdMatch) && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'id') {
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
      } else if (sortBy === 'userId') {
        return sortDirection === 'asc' ? a.userId - b.userId : b.userId - a.userId;
      } else if (sortBy === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
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

  // تنسيق المبلغ
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ar-IQ').format(amount);
  };

  // ترجمة حالة الطلب
  const translateStatus = (status: string): string => {
    switch(status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      case 'processed':
        return 'تم المعالجة';
      default:
        return status;
    }
  };

  // الحصول على لون خلفية حسب الحالة
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
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
  
  // فتح مربع حوار رفض الطلب
  const openRejectDialog = (id: number) => {
    setRejectingId(id);
    setRejectionNote('');
  };
  
  // رفض الطلب مع سبب
  const handleReject = () => {
    if (rejectingId && onReject) {
      onReject(rejectingId, rejectionNote);
      setRejectingId(null);
    }
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
          <h2 className="text-lg font-semibold">قائمة طلبات السحب</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 md:items-center">
            <div>
              <input
                type="text"
                placeholder="بحث برقم الطلب أو المستخدم"
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
                <option value="pending">قيد الانتظار</option>
                <option value="approved">موافق عليه</option>
                <option value="rejected">مرفوض</option>
                <option value="processed">تم المعالجة</option>
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
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('userId')}
              >
                المستخدم {getSortIcon('userId')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('amount')}
              >
                المبلغ {getSortIcon('amount')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                طريقة الدفع
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('createdAt')}
              >
                تاريخ الطلب {getSortIcon('createdAt')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => {
                return (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(request.amount)} د.ع
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                        {translateStatus(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove && onApprove(request.id)}
                            className="mr-2 py-1 px-3 rounded bg-green-50 text-green-600 hover:bg-green-100"
                          >
                            موافقة
                          </button>
                          <button
                            onClick={() => openRejectDialog(request.id)}
                            className="mr-2 py-1 px-3 rounded bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            رفض
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onViewDetails && onViewDetails(request.id)}
                        className="py-1 px-3 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        التفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  لا توجد نتائج مطابقة للبحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة رفض الطلب */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">رفض طلب السحب</h2>
            <p className="mb-4">الرجاء إدخال سبب الرفض:</p>
            
            <div className="mb-4">
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="سبب الرفض..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRejectingId(null)}
                className="ml-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                إلغاء
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionNote.trim()}
                className={`px-4 py-2 rounded-md ${
                  rejectionNote.trim() 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-300 text-white cursor-not-allowed'
                }`}
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequestList; 