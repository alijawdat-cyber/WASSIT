'use client';

import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Role, User } from '@/types';
import UserList from '@/components/admin/UserList';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';
import AppLayout from '@/components/layout/AppLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // الحصول على جميع المستخدمين
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAllUsers();
        
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب المستخدمين');
        }
      } catch (err) {
        console.error('خطأ في جلب المستخدمين:', err);
        setError('حدث خطأ أثناء جلب المستخدمين');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // تفعيل/تعطيل المستخدم
  const handleToggleStatus = async (userId: number, isActive: boolean) => {
    try {
      setIsLoading(true);
      const response = await adminAPI.updateUserStatus(userId, isActive);
      
      if (response.success && response.data) {
        // تحديث قائمة المستخدمين
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, isActive } : u
          )
        );
        setSuccessMessage(`تم ${isActive ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || `حدث خطأ أثناء ${isActive ? 'تفعيل' : 'تعطيل'} المستخدم`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(`خطأ في ${isActive ? 'تفعيل' : 'تعطيل'} المستخدم:`, err);
      setError(`حدث خطأ أثناء ${isActive ? 'تفعيل' : 'تعطيل'} المستخدم`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // عرض تفاصيل المستخدم
  const handleViewDetails = (userId: number) => {
    window.location.href = `/admin/users/${userId}`;
  };

  // احتساب إحصائيات المستخدمين
  const totalUsers = users.length;
  const clientCount = users.filter(u => u.role === Role.CLIENT).length;
  const providerCount = users.filter(u => u.role === Role.PROVIDER).length;
  const adminCount = users.filter(u => u.role === Role.ADMIN).length;
  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  
  // نسبة المستخدمين النشطين
  const activePercentage = totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0;

  return (
    <AppLayout requireRoles={[Role.ADMIN]} hideIfUnauthenticated={true}>
      <DashboardLayout title="إدارة المستخدمين">
        {error && <ErrorMessage message={error} className="mb-4" />}
        
        {successMessage && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md border border-green-200">
            {successMessage}
          </div>
        )}

        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">مستخدمين عملاء</h3>
                <p className="text-xl font-bold text-blue-900">{clientCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">مزودي خدمات</h3>
                <p className="text-xl font-bold text-green-900">{providerCount}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-800 mb-2">مستخدمين نشطين</h3>
                <div className="flex items-baseline">
                  <p className="text-xl font-bold text-indigo-900">{activeCount}</p>
                  <p className="mr-2 text-sm text-indigo-700">({activePercentage}%)</p>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${activePercentage}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <UserList 
            users={users} 
            isLoading={isLoading} 
            error={error}
            onViewDetails={handleViewDetails}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </DashboardLayout>
    </AppLayout>
  );
} 