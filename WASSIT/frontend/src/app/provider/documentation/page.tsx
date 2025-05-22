'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { providerDocAPI } from '@/lib/api';
import { Attachment, Role } from '@/types';
import DocumentUploader from '@/components/provider/DocumentUploader';

export default function ProviderDocumentationPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [documents, setDocuments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // التحقق من تسجيل الدخول ودور المستخدم
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!loading && user && user.role !== Role.PROVIDER) {
      router.push('/');
      return;
    }

    // استدعاء وثائق مقدم الخدمة
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await providerDocAPI.getDocuments();
        
        if (response.success && response.data) {
          // التحقق من أن response.data هو مصفوفة قبل الاستخدام
          if (Array.isArray(response.data)) {
            setDocuments(response.data);
          } else {
            console.error('البيانات المسترجعة ليست مصفوفة:', response.data);
            setDocuments([]);
          }
        } else {
          setError(response.message || 'فشل في استرجاع الوثائق');
          setDocuments([]);
        }
      } catch (err) {
        console.error('خطأ في استرجاع وثائق مقدم الخدمة:', err);
        setError('حدث خطأ أثناء الاتصال بالخادم');
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchDocuments();
    }
  }, [loading, isAuthenticated, user, router]);

  const handleDocumentUploadSuccess = (newDocument: Attachment) => {
    setDocuments(prev => [...prev, newDocument]);
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      const response = await providerDocAPI.deleteDocument(id);
      
      if (response.success) {
        // حذف المستند من المصفوفة المحلية
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      } else {
        setError(response.message || 'فشل في حذف المستند');
      }
    } catch (err) {
      console.error('خطأ في حذف المستند:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  // عرض حالة التحميل
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">توثيق الحساب</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          لإتمام عملية التحقق من حسابك كمقدم خدمة، يرجى رفع المستندات المطلوبة. سيتم مراجعة المستندات من قبل فريقنا وسيتم إعلامك بمجرد اكتمال عملية التحقق.
        </p>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* قسم رفع المستندات */}
        <div>
          <DocumentUploader onUploadSuccess={handleDocumentUploadSuccess} />
        </div>
        
        {/* قسم عرض المستندات المرفوعة */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">المستندات المرفوعة</h3>
            
            {documents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                لم يتم رفع أي مستندات بعد
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {documents.map(doc => (
                  <li key={doc.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-sm text-gray-500">
                        {doc.type && `النوع: ${doc.type}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark"
                      >
                        عرض
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
