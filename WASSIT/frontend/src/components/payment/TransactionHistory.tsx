import React, { useState } from 'react';
import { Transaction, TransactionStatus, TransactionType } from '@/types';
import { formatDate } from '@/lib/date-utils';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // فلترة المعاملات
  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = !typeFilter || transaction.type === typeFilter;
    const statusMatch = !statusFilter || transaction.status === statusFilter;
    return typeMatch && statusMatch;
  });

  // ترجمة نوع المعاملة
  const translateType = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'إيداع';
      case TransactionType.WITHDRAWAL:
        return 'سحب';
      case TransactionType.ESCROW_HOLD:
        return 'حجز مبلغ';
      case TransactionType.ESCROW_RELEASE:
        return 'إطلاق مبلغ محجوز';
      case TransactionType.ESCROW_REFUND:
        return 'إعادة مبلغ محجوز';
      case TransactionType.PLATFORM_FEE:
        return 'رسوم المنصة';
      case TransactionType.DISPUTE_REFUND:
        return 'إعادة مبلغ بعد نزاع';
      case TransactionType.DISPUTE_RELEASE:
        return 'إطلاق مبلغ بعد نزاع';
      default:
        return String(type);
    }
  };

  // ترجمة حالة المعاملة
  const translateStatus = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'معلقة';
      case TransactionStatus.COMPLETED:
        return 'مكتملة';
      case TransactionStatus.FAILED:
        return 'فاشلة';
      case TransactionStatus.CANCELED:
        return 'ملغاة';
      default:
        return String(status);
    }
  };

  // لون خلفية حسب نوع المعاملة
  const getTypeColor = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'bg-green-100 text-green-800';
      case TransactionType.WITHDRAWAL:
        return 'bg-red-100 text-red-800';
      case TransactionType.ESCROW_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionType.ESCROW_RELEASE:
        return 'bg-blue-100 text-blue-800';
      case TransactionType.ESCROW_REFUND:
        return 'bg-orange-100 text-orange-800';
      case TransactionType.PLATFORM_FEE:
        return 'bg-purple-100 text-purple-800';
      case TransactionType.DISPUTE_REFUND:
        return 'bg-red-100 text-red-800';
      case TransactionType.DISPUTE_RELEASE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // لون خلفية حسب حالة المعاملة
  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
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

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">كل أنواع المعاملات</option>
            <option value={TransactionType.DEPOSIT}>إيداع</option>
            <option value={TransactionType.WITHDRAWAL}>سحب</option>
            <option value={TransactionType.ESCROW_HOLD}>حجز مبلغ</option>
            <option value={TransactionType.ESCROW_RELEASE}>إطلاق مبلغ محجوز</option>
            <option value={TransactionType.ESCROW_REFUND}>إعادة مبلغ محجوز</option>
            <option value={TransactionType.PLATFORM_FEE}>رسوم المنصة</option>
            <option value={TransactionType.DISPUTE_REFUND}>إعادة مبلغ بعد نزاع</option>
            <option value={TransactionType.DISPUTE_RELEASE}>إطلاق مبلغ بعد نزاع</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">كل الحالات</option>
            <option value={TransactionStatus.PENDING}>معلقة</option>
            <option value={TransactionStatus.COMPLETED}>مكتملة</option>
            <option value={TransactionStatus.FAILED}>فاشلة</option>
            <option value={TransactionStatus.CANCELED}>ملغاة</option>
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          لا توجد معاملات مالية لعرضها
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع المعاملة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التفاصيل
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {translateType(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.amount.toLocaleString('ar-IQ')} د.ع
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {translateStatus(transaction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description || 'غير متوفر'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 