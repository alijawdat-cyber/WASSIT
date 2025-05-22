'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { disputesAPI } from '@/lib/api';
import { Dispute, DisputeReply, DisputeStatus } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import DisputeDetail from '@/components/disputes/DisputeDetail';
import DisputeReplyList from '@/components/disputes/DisputeReplyList';
import DisputeReplyForm from '@/components/disputes/DisputeReplyForm';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProviderDisputeDetails() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const disputeId = params.id as string;
  
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [replies, setReplies] = useState<DisputeReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // التحقق من المصادقة والتوجيه إذا لم يكن مصادقًا عليه
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // التحقق من نوع المستخدم والتوجيه إذا لم يكن مقدم خدمة
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== 'PROVIDER') {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // جلب تفاصيل النزاع
  useEffect(() => {
    if (isAuthenticated && disputeId) {
      const fetchDispute = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await disputesAPI.getDisputeById(parseInt(disputeId));
          
          if (response.success && response.data) {
            setDispute(response.data);
            
            // التحقق من أن النزاع ينتمي لمقدم الخدمة الحالي
            if (response.data.providerId !== user?.id) {
              router.push('/provider/disputes');
            }
          } else {
            setError(response.message || 'حدث خطأ أثناء جلب تفاصيل النزاع');
          }
        } catch (err) {
          console.error('خطأ في جلب تفاصيل النزاع:', err);
          setError('حدث خطأ أثناء جلب تفاصيل النزاع');
        } finally {
          setLoading(false);
        }
      };
      
      fetchDispute();
    }
  }, [disputeId, isAuthenticated, user, router]);
  
  // جلب ردود النزاع
  useEffect(() => {
    if (isAuthenticated && disputeId) {
      const fetchReplies = async () => {
        setRepliesLoading(true);
        
        try {
          const response = await disputesAPI.getDisputeReplies(parseInt(disputeId));
          
          if (response.success && Array.isArray(response.data)) {
            setReplies(response.data);
          }
        } catch (err) {
          console.error('خطأ في جلب ردود النزاع:', err);
        } finally {
          setRepliesLoading(false);
        }
      };
      
      fetchReplies();
    }
  }, [disputeId, isAuthenticated]);
  
  // تحديث الردود بعد إضافة رد جديد
  const handleReplySuccess = async () => {
    if (disputeId) {
      try {
        const response = await disputesAPI.getDisputeReplies(parseInt(disputeId));
        
        if (response.success && Array.isArray(response.data)) {
          setReplies(response.data);
        }
      } catch (err) {
        console.error('خطأ في تحديث ردود النزاع:', err);
      }
    }
  };
  
  // عرض شاشة التحميل
  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }
  
  // عرض رسالة الخطأ
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }
  
  // عرض محتوى الصفحة
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">تفاصيل النزاع</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/provider/disputes')}
            >
              العودة للنزاعات
            </Button>
          </div>
        </div>
        
        {dispute && (
          <>
            <DisputeDetail dispute={dispute} currentUser={user || undefined} />
            
            {/* قائمة الردود */}
            {repliesLoading ? (
              <div className="my-4 text-center">
                <LoadingSpinner size="sm" />
                <p className="mt-2 text-gray-500">جارِ تحميل الردود...</p>
              </div>
            ) : (
              <DisputeReplyList replies={replies} currentUser={user || undefined} />
            )}
            
            {/* نموذج إضافة رد */}
            {dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.IN_REVIEW ? (
              <DisputeReplyForm 
                disputeId={dispute.id} 
                onSuccess={handleReplySuccess} 
              />
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                تم إغلاق النزاع ولا يمكن إضافة المزيد من الردود
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
} 