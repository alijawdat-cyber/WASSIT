'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ratingsAPI } from '@/lib/api';
import { Rating } from '@/types';
import RatingItem from '@/components/ratings/RatingItem';

export default function RatingsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRatings, setReceivedRatings] = useState<Rating[]>([]);
  const [sentRatings, setSentRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // التحقق من تسجيل الدخول
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // استدعاء التقييمات
    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // استدعاء التقييمات المستلمة
        const receivedResponse = await ratingsAPI.getMyReceivedRatings();
        
        if (receivedResponse.success && receivedResponse.data) {
          if (Array.isArray(receivedResponse.data)) {
            setReceivedRatings(receivedResponse.data);
          } else {
            console.error('البيانات المسترجعة للتقييمات المستلمة ليست مصفوفة:', receivedResponse.data);
            setReceivedRatings([]);
          }
        } else {
          console.error('فشل في استرجاع التقييمات المستلمة:', receivedResponse.message);
          setReceivedRatings([]);
        }
        
        // استدعاء التقييمات المرسلة
        const sentResponse = await ratingsAPI.getMySentRatings();
        
        if (sentResponse.success && sentResponse.data) {
          if (Array.isArray(sentResponse.data)) {
            setSentRatings(sentResponse.data);
          } else {
            console.error('البيانات المسترجعة للتقييمات المرسلة ليست مصفوفة:', sentResponse.data);
            setSentRatings([]);
          }
        } else {
          console.error('فشل في استرجاع التقييمات المرسلة:', sentResponse.message);
          setSentRatings([]);
        }
      } catch (err) {
        console.error('خطأ في استرجاع التقييمات:', err);
        setError('حدث خطأ أثناء الاتصال بالخادم');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchRatings();
    }
  }, [loading, isAuthenticated, router]);

  const handleDeleteRating = (ratingId: number) => {
    setSentRatings(prev => prev.filter(rating => rating.id !== ratingId));
  };

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
      <h1 className="text-2xl font-bold mb-6">التقييمات</h1>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* تبويبات التقييمات */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex -mb-px">
          <button
            onClick={() => setActiveTab('received')}
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
              activeTab === 'received'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            التقييمات المستلمة ({receivedRatings.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
              activeTab === 'sent'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            التقييمات المرسلة ({sentRatings.length})
          </button>
        </div>
      </div>
      
      {/* عرض التقييمات حسب التبويب النشط */}
      <div>
        {activeTab === 'received' && (
          <div>
            {receivedRatings.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">لم تستلم أي تقييمات بعد.</p>
              </div>
            ) : (
              <div>
                {receivedRatings.map(rating => (
                  <RatingItem
                    key={rating.id}
                    rating={rating}
                    // لو كان لدينا معلومات عن المستخدم الذي أرسل التقييم
                    // يمكننا تمريرها هنا كـ user={rating.fromUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'sent' && (
          <div>
            {sentRatings.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">لم ترسل أي تقييمات بعد.</p>
              </div>
            ) : (
              <div>
                {sentRatings.map(rating => (
                  <RatingItem
                    key={rating.id}
                    rating={rating}
                    // لو كان لدينا معلومات عن المستخدم الذي استلم التقييم
                    // يمكننا تمريرها هنا كـ user={rating.toUser}
                    canDelete={true}
                    onDelete={handleDeleteRating}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 