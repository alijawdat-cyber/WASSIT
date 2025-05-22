'use client';

import { useState } from 'react';
import { Rating, User } from '@/types';
import { ratingsAPI } from '@/lib/api';

interface RatingItemProps {
  rating: Rating;
  user?: User; // الشخص الذي قام بالتقييم أو تلقى التقييم (حسب السياق)
  canDelete?: boolean;
  onDelete?: (ratingId: number) => void;
}

export default function RatingItem({ rating, user, canDelete = false, onDelete }: RatingItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // تنسيق التاريخ
  const formattedDate = new Date(rating.createdAt).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // حذف التقييم
  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await ratingsAPI.deleteRating(rating.id);
      
      if (response.success) {
        if (onDelete) {
          onDelete(rating.id);
        }
      } else {
        setError(response.message || 'فشل في حذف التقييم');
      }
    } catch (err) {
      console.error('خطأ في حذف التقييم:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setDeleting(false);
    }
  };

  // رسم النجوم
  const renderStars = (score: number) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-xl ${i <= score ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    
    return stars;
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center mb-1">
            {renderStars(rating.score)}
            <span className="mr-2 text-sm text-gray-500">{rating.score}/5</span>
          </div>
          
          {user && (
            <div className="text-gray-700 font-medium">{user.name}</div>
          )}
        </div>
        
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>
      
      {rating.comment && (
        <div className="text-gray-700 mt-2">{rating.comment}</div>
      )}
      
      {error && (
        <div className="mt-2 p-2 text-sm bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {canDelete && (
        <div className="mt-3 text-right">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-500 hover:text-red-700"
          >
            {deleting ? 'جاري الحذف...' : 'حذف التقييم'}
          </button>
        </div>
      )}
    </div>
  );
} 