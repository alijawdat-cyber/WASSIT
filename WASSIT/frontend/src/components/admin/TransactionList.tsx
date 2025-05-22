'use client';

import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionStatus } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/date-utils';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onViewDetails?: (transactionId: number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  isLoading, 
  error, 
  onViewDetails 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // فلترة وترتيب المعاملات
  const filteredTransactions = transactions
    .filter(transaction => {
      // تنفيذ البحث
      const idMatch = String(transaction.id).includes(searchTerm);
      const referenceMatch = transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const userNameMatch = transaction.userId ? 
        String(transaction.userId).includes(searchTerm) : false;
      
      // تطبيق فلتر النوع والحالة
      const typeMatch = typeFilter === '' || transaction.type === typeFilter;
      const statusMatch = statusFilter === '' || transaction.status === statusFilter;

      return (idMatch || referenceMatch || userNameMatch) && typeMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'id') {
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
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

  // ترجمة نوع المعاملة
  const translateType = (type: string): string => {
    switch(type) {
      case TransactionType.PAYMENT:
        return 'دفع';
      case TransactionType.REFUND:
        return 'استرجاع';
      case TransactionType.WITHDRAWAL:
        return 'سحب';
      case TransactionType.DEPOSIT:
        return 'إيداع';
      case TransactionType.COMMISSION:
        return 'عمولة';
      case TransactionType.ESCROW:
        return 'ضمان';
      default:
        return type;
    }
  };

  // ترجمة حالة المعاملة
  const translateStatus = (status: string): string => {
    switch(status) {
      case TransactionStatus.PENDING:
        return 'قيد الانتظار';
      case TransactionStatus.COMPLETED:
        return 'مكتملة';
      case TransactionStatus.FAILED:
        return 'فاشلة';
      case TransactionStatus.CANCELED:
        return 'ملغية';
      default:
        return status;
    }
  };

  // الحصول على لون خلفية حسب النوع
  const getTypeColor = (type: string): string => {
    switch(type) {
      case TransactionType.PAYMENT:
        return 'bg-blue-100 text-blue-800';
      case TransactionType.REFUND:
        return 'bg-orange-100 text-orange-800';
      case TransactionType.WITHDRAWAL:
        return 'bg-red-100 text-red-800';
      case TransactionType.DEPOSIT:
        return 'bg-green-100 text-green-800';
      case TransactionType.COMMISSION:
        return 'bg-purple-100 text-purple-800';
      case TransactionType.ESCROW:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // الحصول على لون خلفية حسب الحالة
  const getStatusColor = (status: string): string => {
    switch(status) {
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case TransactionStatus.CANCELED:
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
          <h2 className="text-lg font-semibold">قائمة المعاملات المالية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                placeholder="بحث برقم المعاملة أو المرجع"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">كل الأنواع</option>
                <option value={TransactionType.PAYMENT}>دفع</option>
                <option value={TransactionType.REFUND}>استرجاع</option>
                <option value={TransactionType.WITHDRAWAL}>سحب</option>
                <option value={TransactionType.DEPOSIT}>إيداع</option>
                <option value={TransactionType.COMMISSION}>عمولة</option>
                <option value={TransactionType.ESCROW}>ضمان</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">كل الحالات</option>
                <option value={TransactionStatus.PENDING}>قيد الانتظار</option>
                <option value={TransactionStatus.COMPLETED}>مكتملة</option>
                <option value={TransactionStatus.FAILED}>فاشلة</option>
                <option value={TransactionStatus.CANCELED}>ملغية</option>
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
                رقم المعاملة {getSortIcon('id')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المستخدم
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع المعاملة
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('amount')}
              >
                المبلغ {getSortIcon('amount')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المرجع
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
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    مستخدم #{transaction.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {translateType(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {new Intl.NumberFormat('ar-IQ').format(transaction.amount)} د.ع
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {translateStatus(transaction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">
                      {transaction.reference || 'غير متوفر'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewDetails && onViewDetails(transaction.id)}
                      className="py-1 px-3 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      التفاصيل
                    </button>
                  </td>
                </tr>
              ))
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

export default TransactionList; 