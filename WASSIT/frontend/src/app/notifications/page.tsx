'use client';

import { useEffect, useState } from 'react';
import { notificationsAPI } from '@/lib/api';
import { Notification } from '@/types';
import NotificationItem from '@/components/notifications/NotificationItem';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // جلب الإشعارات
  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await notificationsAPI.getAllNotifications();
      
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        setError(response.message || 'فشل في جلب الإشعارات');
      }
    } catch (err) {
      console.error('خطأ في جلب الإشعارات:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // وضع علامة مقروء للجميع
  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    
    try {
      const response = await notificationsAPI.markAllAsRead();
      
      if (response.success) {
        fetchNotifications();
        toast.success('تم وضع علامة مقروء لجميع الإشعارات');
      } else {
        toast.error(response.message || 'فشل في تحديث الإشعارات');
      }
    } catch (err) {
      console.error('خطأ في تحديث الإشعارات:', err);
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setMarkingAllRead(false);
    }
  };

  // جلب الإشعارات عند تحميل الصفحة
  useEffect(() => {
    fetchNotifications();
  }, []);

  // حساب عدد الإشعارات غير المقروءة
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {markingAllRead ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>وضع الكل كمقروء ({unreadCount})</>
            )}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-2 text-lg">جاري تحميل الإشعارات...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
          <Button
            onClick={fetchNotifications}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-lg text-gray-600">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onUpdate={fetchNotifications}
            />
          ))}
        </div>
      )}
    </div>
  );
} 