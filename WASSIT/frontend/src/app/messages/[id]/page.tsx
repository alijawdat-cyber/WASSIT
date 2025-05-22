'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import { messagesAPI } from '@/lib/api';
import { Message } from '@/types';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const requestId = parseInt(params.id, 10);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // التمرير إلى أسفل عند وصول رسائل جديدة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // التحقق من المصادقة وتحميل البيانات
  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (isNaN(requestId)) {
        router.push('/messages');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // جلب الرسائل
        const response = await messagesAPI.getMessagesByRequestId(requestId);
        
        if (response.success && response.data) {
          setMessages(response.data);
          
          // نقوم بتحديد المستخدم الآخر من أول رسالة إذا كانت موجودة
          if (response.data.length > 0 && user) {
            const firstMsg = response.data[0];
            const otherUserId = firstMsg.fromUserId === user.id ? firstMsg.toUserId : firstMsg.fromUserId;
            // في سيناريو حقيقي يجب استدعاء API منفصل للحصول على اسم المستخدم
            // هنا نضع مثال للتوضيح فقط
            setOtherUser({
              id: otherUserId,
              name: `مستخدم #${otherUserId}`
            });
          }
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب الرسائل');
        }
      } catch (err) {
        console.error('خطأ في تحميل الرسائل:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [requestId, user, isAuthenticated, authLoading, router]);

  // التمرير لأسفل بعد تحميل الرسائل
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // إرسال رسالة جديدة
  const handleSendMessage = async (content: string) => {
    if (!user || !otherUser) return;
    
    try {
      setSending(true);
      
      const newMessage = {
        requestId,
        toUserId: otherUser.id,
        content
      };
      
      const response = await messagesAPI.sendMessage(newMessage);
      
      if (response.success && response.data) {
        // إضافة الرسالة المرسلة إلى القائمة
        setMessages(prev => [...prev, response.data as Message]);
      } else {
        alert(response.message || 'حدث خطأ أثناء إرسال الرسالة');
      }
    } catch (err) {
      console.error('خطأ في إرسال الرسالة:', err);
      alert('حدث خطأ غير متوقع أثناء إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-background min-h-screen py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* رأس المحادثة */}
            <div className="bg-white rounded-t-lg shadow-sm border p-4 flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Link href="/messages" className="me-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl font-bold">
                    {otherUser ? otherUser.name : 'المحادثة'}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    طلب #{requestId}
                  </p>
                </div>
              </div>
              <Link 
                href={`/client/requests/${requestId}`} 
                className="text-primary text-sm hover:underline"
              >
                عرض تفاصيل الطلب
              </Link>
            </div>
            
            {/* جسم المحادثة */}
            <div className="bg-white rounded-b-lg shadow-sm border overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">جاري تحميل الرسائل...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ms-3">
                        <h3 className="text-sm font-medium text-red-800">حدث خطأ</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* قائمة الرسائل */}
                  <div className="p-4 h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zM7 8a1 1 0 100 2 1 1 0 000-2zm5-1a1 1 0 110 2 1 1 0 010-2zm-3 5a3 3 0 016 0H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">لا توجد رسائل بعد</h3>
                        <p className="text-gray-500 mt-2">ابدأ محادثتك الأولى مع {otherUser?.name}</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          content={message.content}
                          isOutgoing={message.fromUserId === user?.id}
                          timestamp={message.createdAt}
                          senderName={message.fromUserId !== user?.id ? otherUser?.name : undefined}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* مدخل الرسائل */}
                  <MessageInput 
                    onSendMessage={handleSendMessage} 
                    disabled={sending}
                    placeholder={sending ? 'جاري الإرسال...' : 'اكتب رسالتك هنا...'}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 