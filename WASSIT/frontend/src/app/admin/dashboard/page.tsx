'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardStats from '@/components/admin/DashboardStats';
import { Role } from '@/types';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <AppLayout requireRoles={[Role.ADMIN]} hideIfUnauthenticated={true}>
      <DashboardLayout title="لوحة تحكم الإدارة">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">الإحصائيات العامة</h2>
          <DashboardStats />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">روابط سريعة</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/users" 
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium p-3 rounded-lg text-center"
              >
                إدارة المستخدمين
              </Link>
              <Link
                href="/admin/requests" 
                className="bg-green-50 hover:bg-green-100 text-green-800 font-medium p-3 rounded-lg text-center"
              >
                إدارة الطلبات
              </Link>
              <Link
                href="/admin/offers" 
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-medium p-3 rounded-lg text-center"
              >
                إدارة العروض
              </Link>
              <Link
                href="/admin/disputes" 
                className="bg-red-50 hover:bg-red-100 text-red-800 font-medium p-3 rounded-lg text-center"
              >
                إدارة النزاعات
              </Link>
              <Link
                href="/admin/wallets" 
                className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium p-3 rounded-lg text-center"
              >
                إدارة المحافظ
              </Link>
              <Link
                href="/admin/withdrawals" 
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-medium p-3 rounded-lg text-center"
              >
                طلبات السحب
              </Link>
              <Link
                href="/admin/transactions" 
                className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-medium p-3 rounded-lg text-center"
              >
                المعاملات المالية
              </Link>
              <Link
                href="/admin/margins" 
                className="bg-orange-50 hover:bg-orange-100 text-orange-800 font-medium p-3 rounded-lg text-center"
              >
                هوامش الربح
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">أحدث التنبيهات</h3>
            <div className="space-y-3">
              <div className="border-r-4 border-yellow-500 p-3 bg-yellow-50 rounded-md">
                <p className="text-yellow-800 font-medium">طلب سحب جديد بقيمة 250,000 د.ع</p>
                <span className="text-xs text-gray-500">منذ 30 دقيقة</span>
              </div>
              <div className="border-r-4 border-red-500 p-3 bg-red-50 rounded-md">
                <p className="text-red-800 font-medium">نزاع جديد في طلب رقم 1087</p>
                <span className="text-xs text-gray-500">منذ ساعتين</span>
              </div>
              <div className="border-r-4 border-blue-500 p-3 bg-blue-50 rounded-md">
                <p className="text-blue-800 font-medium">مستخدم جديد قام بالتسجيل (مقدم خدمة)</p>
                <span className="text-xs text-gray-500">منذ 3 ساعات</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link href="/admin/notifications" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                عرض جميع التنبيهات
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">معلومات النظام</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">إصدار النظام</p>
              <p className="font-semibold text-gray-800">وسّط 1.0.0</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">آخر تحديث</p>
              <p className="font-semibold text-gray-800">20 مايو 2025</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">حالة النظام</p>
              <p className="font-semibold text-green-600">نشط</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AppLayout>
  );
} 