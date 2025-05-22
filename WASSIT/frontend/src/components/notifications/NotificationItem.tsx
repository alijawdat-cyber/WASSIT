'use client';

import React from 'react';
import { Notification } from '@/types';
import { formatDistance } from 'date-fns';
import { ar } from 'date-fns/locale';
import { notificationsAPI } from '@/lib/api';
import { Check, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NotificationItemProps {
  notification: Notification;
  onUpdate: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'REQUEST_CREATED':
      return '📋';
    case 'OFFER_RECEIVED':
      return '💼';
    case 'OFFER_ACCEPTED':
      return '✅';
    case 'OFFER_REJECTED':
      return '❌';
    case 'WORK_SUBMITTED':
      return '📤';
    case 'WORK_APPROVED':
      return '👍';
    case 'PAYMENT_RELEASED':
      return '💰';
    case 'RATING_RECEIVED':
      return '⭐';
    case 'DISPUTE_OPENED':
      return '⚠️';
    case 'DISPUTE_RESOLVED':
      return '🤝';
    case 'SYSTEM':
      return '🔔';
    default:
      return '📣';
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onUpdate 
}) => {
  const { id, title, message, type, isRead, createdAt } = notification;

  const handleMarkAsRead = async () => {
    try {
      const response = await notificationsAPI.markAsRead(id);
      if (response.success) {
        onUpdate();
      } else {
        toast.error(response.message || 'حدث خطأ أثناء تعديل حالة الإشعار');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await notificationsAPI.deleteNotification(id);
      if (response.success) {
        onUpdate();
        toast.success('تم حذف الإشعار بنجاح');
      } else {
        toast.error(response.message || 'حدث خطأ أثناء حذف الإشعار');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
      console.error(error);
    }
  };

  const timeAgo = formatDistance(new Date(createdAt), new Date(), {
    addSuffix: true,
    locale: ar
  });

  return (
    <div className={`p-4 mb-3 border rounded-lg shadow-sm ${isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-100'}`}>
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="text-2xl ml-3">{getNotificationIcon(type)}</div>
          <div>
            <h3 className="font-semibold text-md">{title}</h3>
            <p className="text-gray-700 mt-1">{message}</p>
            <p className="text-xs text-gray-500 mt-2">{timeAgo}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isRead && (
            <button
              onClick={handleMarkAsRead}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              title="وضع علامة كمقروء"
            >
              <Check size={18} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="حذف الإشعار"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem; 