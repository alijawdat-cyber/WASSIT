'use client';

import { useState } from 'react';
import { userAPI } from '@/lib/api';
import { ChangePasswordFormData } from '@/types';

export default function PasswordChangeForm() {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // التحقق من تطابق كلمة المرور الجديدة وتأكيدها
    if (formData.newPassword !== formData.confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      return;
    }
    
    // التحقق من أن كلمة المرور الجديدة مختلفة عن الحالية
    if (formData.currentPassword === formData.newPassword) {
      setError('يجب أن تكون كلمة المرور الجديدة مختلفة عن كلمة المرور الحالية');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await userAPI.changePassword(formData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      }
    } catch (err) {
      console.error('خطأ في تغيير كلمة المرور:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
          كلمة المرور الحالية
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          كلمة المرور الجديدة
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          required
          minLength={6}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          تأكيد كلمة المرور الجديدة
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          required
          minLength={6}
        />
      </div>

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          تم تغيير كلمة المرور بنجاح
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
        </button>
      </div>
    </form>
  );
} 