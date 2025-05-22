'use client';

import { useEffect, useState } from 'react';
import { disputesAPI } from '@/lib/api';
import { Dispute, DisputeStatus } from '@/types';
import DisputeItem from '@/components/disputes/DisputeItem';
import Button from '@/components/ui/Button';
import { Loader2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProviderDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  // جلب نزاعات مقدم الخدمة
  const fetchDisputes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await disputesAPI.getProviderDisputes();
      
      if (response.success && response.data) {
        setDisputes(response.data);
      } else {
        setError(response.message || 'فشل في جلب النزاعات');
      }
    } catch (err) {
      console.error('خطأ في جلب النزاعات:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // جلب النزاعات عند تحميل الصفحة
  useEffect(() => {
    fetchDisputes();
  }, []);

  // تصفية النزاعات حسب الحالة
  const filteredDisputes = filter === 'all' 
    ? disputes 
    : disputes.filter(dispute => {
        switch (filter) {
          case 'open':
            return dispute.status === DisputeStatus.OPEN;
          case 'in-review':
            return dispute.status === DisputeStatus.IN_REVIEW;
          case 'resolved':
            return dispute.status === DisputeStatus.RESOLVED_CLIENT || 
                  dispute.status === DisputeStatus.RESOLVED_PROVIDER || 
                  dispute.status === DisputeStatus.RESOLVED_PARTIAL;
          case 'canceled':
            return dispute.status === DisputeStatus.CANCELED;
          default:
            return true;
        }
      });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">النزاعات</h1>
      </div>

      {/* فلتر النزاعات */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-3">
        <div className="flex items-center ml-4">
          <Filter size={16} className="ml-1 text-gray-500" />
          <span className="text-gray-700">تصفية:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'open' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            مفتوح
          </button>
          <button
            onClick={() => setFilter('in-review')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'in-review' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            قيد المراجعة
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            تم الحل
          </button>
          <button
            onClick={() => setFilter('canceled')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'canceled' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-300'
            }`}
          >
            ملغي
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-2 text-lg">جاري تحميل النزاعات...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
          <Button
            onClick={fetchDisputes}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-lg text-gray-600">
            {filter === 'all' 
              ? 'لا توجد نزاعات مفتوحة ضدك' 
              : 'لا توجد نزاعات تطابق الفلتر المحدد'}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-4 text-blue-600 hover:underline"
            >
              عرض جميع النزاعات
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => (
            <DisputeItem
              key={dispute.id}
              dispute={dispute}
              userType="provider"
            />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800">معلومات مهمة حول النزاعات</h3>
        <ul className="mt-3 text-blue-700 list-disc pr-5">
          <li className="mb-2">في حال تم فتح نزاع عليك، سيتم إشعارك عبر البريد الإلكتروني والإشعارات داخل التطبيق.</li>
          <li className="mb-2">يمكنك الرد على النزاع وتقديم شرح لموقفك والأدلة الداعمة.</li>
          <li className="mb-2">سيقوم فريق إدارة النزاعات بمراجعة النزاع واتخاذ القرار المناسب.</li>
          <li>الالتزام بشروط الاستخدام وتقديم خدمات عالية الجودة هو أفضل طريقة لتجنب النزاعات.</li>
        </ul>
      </div>
    </div>
  );
} 