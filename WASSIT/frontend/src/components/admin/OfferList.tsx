'use client';

import React, { useState } from 'react';
import { Offer, OfferStatus, User } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/date-utils';

interface OfferListProps {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  onUpdateMargin?: (offerId: number, currentPrice: number) => void;
  onViewDetails?: (offerId: number) => void;
}

const OfferList: React.FC<OfferListProps> = ({ 
  offers, 
  isLoading, 
  error, 
  onUpdateMargin,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // فلترة وترتيب العروض
  const filteredOffers = offers
    .filter(offer => {
      // استخدام رقم الطلب أو وصف العرض للبحث
      const offerIdMatch = String(offer.id).includes(searchTerm);
      const requestIdMatch = String(offer.requestId).includes(searchTerm);
      const messageMatch = offer.message?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      // فلتر حسب الحالة
      const statusMatch = statusFilter === '' || offer.status === statusFilter;

      return (offerIdMatch || requestIdMatch || messageMatch) && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'id') {
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
      } else if (sortBy === 'requestId') {
        return sortDirection === 'asc' ? a.requestId - b.requestId : b.requestId - a.requestId;
      } else if (sortBy === 'proposedPrice') {
        const priceA = a.proposedPrice || 0;
        const priceB = b.proposedPrice || 0;
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      } else if (sortBy === 'finalPrice') {
        const finalPriceA = a.finalPrice || 0;
        const finalPriceB = b.finalPrice || 0;
        return sortDirection === 'asc' ? finalPriceA - finalPriceB : finalPriceB - finalPriceA;
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
  const formatAmount = (amount: number | undefined): string => {
    if (amount === undefined) return 'غير محدد';
    return new Intl.NumberFormat('ar-IQ').format(amount);
  };

  // ترجمة حالة العرض
  const translateStatus = (status: string): string => {
    switch(status) {
      case OfferStatus.PENDING:
        return 'قيد الانتظار';
      case OfferStatus.ACCEPTED:
        return 'مقبول';
      case OfferStatus.REJECTED:
        return 'مرفوض';
      default:
        return status;
    }
  };

  // الحصول على لون خلفية حسب الحالة
  const getStatusColor = (status: string): string => {
    switch(status) {
      case OfferStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OfferStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case OfferStatus.REJECTED:
        return 'bg-red-100 text-red-800';
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
          <h2 className="text-lg font-semibold">قائمة العروض</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 md:items-center">
            <div>
              <input
                type="text"
                placeholder="بحث برقم العرض أو الطلب"
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
                <option value={OfferStatus.PENDING}>قيد الانتظار</option>
                <option value={OfferStatus.ACCEPTED}>مقبول</option>
                <option value={OfferStatus.REJECTED}>مرفوض</option>
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
                رقم العرض {getSortIcon('id')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('requestId')}
              >
                رقم الطلب {getSortIcon('requestId')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                مقدم الخدمة
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('proposedPrice')}
              >
                السعر المقترح {getSortIcon('proposedPrice')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('finalPrice')}
              >
                السعر النهائي {getSortIcon('finalPrice')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المدة المقترحة (أيام)
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
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => {
                const provider = offer.provider as User | undefined;
                const margin = offer.finalPrice && offer.proposedPrice 
                  ? offer.finalPrice - offer.proposedPrice
                  : 0;
                
                return (
                  <tr key={offer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {offer.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {offer.requestId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {provider?.name ? provider.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-gray-900">
                            {provider?.name || `مقدم خدمة #${offer.providerId}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(offer.proposedPrice)} د.ع
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatAmount(offer.finalPrice)} د.ع
                      {margin > 0 && (
                        <span className="mr-2 text-xs text-green-600">
                          (هامش: {formatAmount(margin)} د.ع)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {offer.proposedDays || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(offer.status)}`}>
                        {translateStatus(offer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(offer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onUpdateMargin && onUpdateMargin(offer.id, offer.proposedPrice || 0)}
                        className="mr-2 py-1 px-3 rounded bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        تحديث الهامش
                      </button>
                      <button
                        onClick={() => onViewDetails && onViewDetails(offer.id)}
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
                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
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

export default OfferList; 