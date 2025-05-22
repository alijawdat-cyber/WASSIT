import React from 'react';
import { DisputeReply, User } from '@/types';
import { formatSimpleDate, formatRelativeTime } from '@/lib/date-utils';

interface DisputeReplyItemProps {
  reply: DisputeReply;
  currentUser?: User;
}

const DisputeReplyItem: React.FC<DisputeReplyItemProps> = ({ reply, currentUser }) => {
  // تحديد إذا كان المستخدم الحالي هو كاتب الرد
  const isCurrentUserReply = currentUser?.id === reply.userId;
  
  // ترتيب عرض الرد على حسب مالك الرد
  const alignmentClass = isCurrentUserReply ? 'mr-auto' : 'ml-auto'; 
  const bgColorClass = isCurrentUserReply ? 'bg-primary-light/10' : 'bg-gray-100';
  
  return (
    <div 
      className={`rounded-lg p-4 mb-4 max-w-[80%] ${alignmentClass} ${bgColorClass}`}
      dir="rtl"
    >
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold">
          {reply.user?.name?.charAt(0) || '?'}
        </div>
        <div className="mr-2">
          <div className="font-medium text-sm">{reply.user?.name || 'مستخدم'}</div>
          <div className="text-xs text-gray-500" title={formatSimpleDate(reply.createdAt)}>
            {formatRelativeTime(reply.createdAt)}
          </div>
        </div>
      </div>
      
      <div className="text-sm whitespace-pre-line">
        {reply.content}
      </div>
    </div>
  );
};

export default DisputeReplyItem; 