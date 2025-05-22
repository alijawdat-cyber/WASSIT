import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: number;
  otherUserName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  requestId: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: number;
}

export default function ConversationList({ conversations, selectedId }: ConversationListProps) {
  const router = useRouter();
  
  // تنسيق الوقت
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // إذا كان اليوم نفسه
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
    }
    
    // إذا كان بالأمس
    if (date.toDateString() === yesterday.toDateString()) {
      return 'الأمس';
    }
    
    // غير ذلك، عرض التاريخ
    return date.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'numeric' });
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white p-4 rounded-lg border text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-2 0c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6zm-3-5a1 1 0 100 2 1 1 0 000-2zm-2 7a1 1 0 112 0 1 1 0 01-2 0zm-1-4a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">لا توجد محادثات</h3>
        <p className="text-gray-500 mt-2">عند بدء محادثة جديدة ستظهر هنا</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <Link
            href={`/messages/${conversation.id}`}
            key={conversation.id}
            className={`block p-4 hover:bg-gray-50 transition-colors ${selectedId === conversation.id ? 'bg-gray-100' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                  {conversation.otherUserName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{conversation.otherUserName}</div>
                  <div className="text-gray-500 text-sm mt-1 max-w-xs truncate">
                    {conversation.lastMessage}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</div>
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <div className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              طلب #{conversation.requestId}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 