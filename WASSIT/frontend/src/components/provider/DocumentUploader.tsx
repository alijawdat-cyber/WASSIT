'use client';

import { useState, useRef } from 'react';
import { providerDocAPI } from '@/lib/api';
import { Attachment } from '@/types';

const documentTypes = [
  { id: 'id_card', label: 'هوية شخصية' },
  { id: 'certificate', label: 'شهادة مهنية' },
  { id: 'portfolio', label: 'نماذج أعمال' },
  { id: 'other', label: 'مستند آخر' }
];

interface DocumentUploaderProps {
  onUploadSuccess?: (document: Attachment) => void;
}

export default function DocumentUploader({ onUploadSuccess }: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>(documentTypes[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocumentType(e.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('يرجى اختيار ملف للرفع');
      return;
    }

    if (!documentType) {
      setError('يرجى اختيار نوع المستند');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await providerDocAPI.uploadDocument(selectedFile, documentType);
      
      if (response.success && response.data) {
        setSuccess('تم رفع المستند بنجاح');
        setSelectedFile(null);
        
        // إعادة تعيين حقل اختيار الملف
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // استدعاء دالة التي تم تمريرها من الأب
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } else {
        setError(response.message || 'فشل في رفع المستند، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      console.error('خطأ في رفع المستند:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">رفع مستند جديد</h3>
      
      <div className="mb-4">
        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
          نوع المستند
        </label>
        <select
          id="documentType"
          value={documentType}
          onChange={handleTypeChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        >
          {documentTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="documentFile" className="block text-sm font-medium text-gray-700 mb-1">
          اختر الملف
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="documentFile"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-primary file:text-white
            hover:file:bg-primary-dark
          "
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <p className="mt-1 text-xs text-gray-500">
          الصيغ المقبولة: PDF, JPG, JPEG, PNG. الحد الأقصى للحجم: 5MB
        </p>
      </div>
      
      {selectedFile && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm">
            <span className="font-medium">الملف المختار:</span> {selectedFile.name}
          </p>
          <p className="text-xs text-gray-500">
            الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={loading || !selectedFile}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {loading ? 'جاري الرفع...' : 'رفع المستند'}
      </button>
    </div>
  );
} 