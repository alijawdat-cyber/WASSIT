'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ConversationList from '@/components/chat/ConversationList';
import { messagesAPI } from '@/lib/api';

// واجهة المحادثة
interface Conversation {
  id: number;
  otherUserName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  requestId: number;
}

export default function MessagesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من المصادقة وتحميل البيانات
  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // جلب المحادثات
        const response = await messagesAPI.getConversations();
        
        if (response.success && response.data) {
          setConversations(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب المحادثات');
        }
      } catch (err) {
        console.error('خطأ في تحميل المحادثات:', err);
        setError('حدث خطأ غير متوقع أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, isAuthenticated, authLoading, router]);

  return (
    <MainLayout>
      <div className="bg-background min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">المحادثات</h1>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">جاري تحميل المحادثات...</p>
                </div>
              </div>
            ) : error ? (
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
            ) : (
              <ConversationList conversations={conversations} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 