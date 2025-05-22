'use client';

import { useState } from 'react';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';
import AppLayout from '@/components/layout/AppLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  return (
    <AppLayout hideIfUnauthenticated={true}>
      <DashboardLayout title="الملف الشخصي">
        {/* شريط التبويب */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            معلومات الحساب
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'password'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('password')}
          >
            تغيير كلمة المرور
          </button>
        </div>

        {/* محتوى التبويب */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {activeTab === 'profile' ? (
            <ProfileForm user={user!} />
          ) : (
            <PasswordChangeForm />
          )}
        </div>
      </DashboardLayout>
    </AppLayout>
  );
} 