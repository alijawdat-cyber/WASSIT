'use client';

import { useState } from 'react';
import { ratingsAPI } from '@/lib/api';
import { CreateRatingFormData, Rating } from '@/types';

interface RatingFormProps {
  toUserId: number;
  requestId: number;
  onSuccess?: (rating: Rating) => void;
}

export default function RatingForm({ toUserId, requestId, onSuccess }: RatingFormProps) {
  const [formData, setFormData] = useState<CreateRatingFormData>({
    toUserId,
    requestId,
    score: 5,
    comment: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleScoreChange = (newScore: number) => {
    setFormData(prev => ({ ...prev, score: newScore }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await ratingsAPI.createRating(formData);
      
      if (response.success && response.data) {
        setSuccess(true);
        setFormData(prev => ({ ...prev, comment: '' }));
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.message || 'فشل في إنشاء التقييم');
      }
    } catch (err) {
      console.error('خطأ في إنشاء التقييم:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // رسم النجوم للاختيار
  const renderSelectableStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleScoreChange(i)}
          className={`text-2xl ${i <= formData.score ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500 focus:outline-none transition-colors`}
        >
          ★
        </button>
      );
    }
    
    return stars;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">أضف تقييمك</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          التقييم
        </label>
        <div className="flex space-x-1 space-x-reverse">
          {renderSelectableStars()}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {formData.score === 1 && 'سيء جدًا'}
          {formData.score === 2 && 'سيء'}
          {formData.score === 3 && 'متوسط'}
          {formData.score === 4 && 'جيد'}
          {formData.score === 5 && 'ممتاز'}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          تعليق (اختياري)
        </label>
        <textarea
          id="comment"
          rows={4}
          value={formData.comment}
          onChange={handleCommentChange}
          placeholder="أضف تعليقًا عن تجربتك..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          تم إضافة تقييمك بنجاح
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </div>
    </form>
  );
} 