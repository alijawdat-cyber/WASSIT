import React, { useState } from 'react';
import { CreateDisputeReplyFormData } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { disputesAPI } from '@/lib/api';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface DisputeReplyFormProps {
  disputeId: number;
  onSuccess?: () => void;
}

const DisputeReplyForm: React.FC<DisputeReplyFormProps> = ({ disputeId, onSuccess }) => {
  const [formData, setFormData] = useState<{
    content: string;
    attachments?: File[];
  }>({
    content: '',
    attachments: undefined,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // إعادة تعيين رسائل الخطأ عند تغيير البيانات
    if (error) setError(null);
    if (success) setSuccess(false);
  };
  
  // معالجة تحميل المرفقات (لا تعمل حاليًا - تحتاج إضافة الوظيفة لاحقًا)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        attachments: Array.from(e.target.files),
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من البيانات
    if (!formData.content.trim()) {
      setError('يرجى إدخال محتوى الرد');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // إنشاء بيانات النموذج للإرسال
      const replyData: CreateDisputeReplyFormData = {
        disputeId,
        content: formData.content.trim(),
      };
      
      // إرسال الرد
      const response = await disputesAPI.addDisputeReply(replyData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({ content: '', attachments: undefined });
        
        // استدعاء دالة النجاح إذا كانت متوفرة
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || 'حدث خطأ أثناء إرسال الرد');
      }
    } catch (err) {
      console.error('خطأ في إرسال الرد:', err);
      setError('حدث خطأ أثناء إرسال الرد');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card 
      title="إضافة رد" 
      className="mt-4"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}
        
        {success && (
          <div className="mb-4 p-2 bg-green-50 text-green-700 rounded-md">
            تم إرسال الرد بنجاح
          </div>
        )}
        
        <div className="mb-4">
          <label 
            htmlFor="content" 
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            محتوى الرد
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            value={formData.content}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="اكتب ردك هنا..."
            dir="rtl"
          />
        </div>
        
        {/* قسم المرفقات - يمكن إضافته لاحقًا */}
        {/*
        <div className="mb-4">
          <label 
            htmlFor="attachments" 
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            المرفقات (اختياري)
          </label>
          <input
            id="attachments"
            name="attachments"
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">
            يمكنك إرفاق ملفات داعمة للرد (الحد الأقصى: 5 ملفات، 2MB لكل ملف)
          </p>
        </div>
        */}
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={loading || !formData.content.trim()}
          >
            {loading ? 'جارِ الإرسال...' : 'إرسال الرد'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DisputeReplyForm; 