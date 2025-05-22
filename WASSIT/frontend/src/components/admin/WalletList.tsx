'use client';

import React, { useState } from 'react';
import { Wallet, User } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/date-utils';

interface WalletListProps {
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  onViewTransaction?: (walletId: number) => void;
}

const WalletList: React.FC<WalletListProps> = ({ 
  wallets, 
  isLoading, 
  error, 
  onViewTransaction 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('balance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // فلترة وترتيب المحافظ
  const filteredWallets = wallets
    .filter(wallet => {
      // استخدام الاسم أو رقم المستخدم للبحث
      const user = wallet.user as User | undefined;
      const userName = user?.name || '';
      const userId = wallet.userId.toString();

      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userId.includes(searchTerm)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'balance') {
        return sortDirection === 'asc' 
          ? a.balance - b.balance 
          : b.balance - a.balance;
      } else if (sortBy === 'userId') {
        return sortDirection === 'asc' 
          ? a.userId - b.userId 
          : b.userId - a.userId;
      } else if (sortBy === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      // افتراضي: ترتيب بناءً على الرصيد
      return sortDirection === 'asc' ? a.balance - b.balance : b.balance - a.balance;
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
          <h2 className="text-lg font-semibold">قائمة المحفظات</h2>
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="بحث باسم المستخدم أو الرقم"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                onClick={() => toggleSortDirection('userId')}
              >
                المستخدم {getSortIcon('userId')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('balance')}
              >
                الرصيد الكلي {getSortIcon('balance')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الرصيد المتاح
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العملة
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
            {filteredWallets.length > 0 ? (
              filteredWallets.map((wallet) => {
                const user = wallet.user as User | undefined;
                
                return (
                  <tr key={wallet.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user?.name ? user.name.charAt(0).toUpperCase() : wallet.userId.toString().charAt(0)}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.name || `مستخدم #${wallet.userId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            رقم المستخدم: {wallet.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(wallet.balance)} {wallet.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(wallet.availableBalance)} {wallet.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {wallet.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {wallet.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(wallet.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewTransaction && onViewTransaction(wallet.id)}
                        className="mr-2 py-1 px-3 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        المعاملات
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
    </div>
  );
};

export default WalletList; 