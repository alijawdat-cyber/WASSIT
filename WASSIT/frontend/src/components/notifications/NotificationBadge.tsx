'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notificationsAPI } from '@/lib/api';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const response = await notificationsAPI.getUnreadCount();
        if (response.success && response.data) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error('خطأ في جلب عدد الإشعارات غير المقروءة:', error);
      } finally {
        setLoading(false);
      }
    };

    // جلب العدد مباشرة عند تحميل المكون
    fetchUnreadCount();

    // تحديث عدد الإشعارات كل 60 ثانية
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    router.push('/notifications');
  };

  if (loading) {
    return (
      <button
        className={`relative inline-flex items-center text-gray-400 hover:text-gray-500 ${className}`}
        disabled
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`relative inline-flex items-center text-gray-500 hover:text-gray-700 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge; 