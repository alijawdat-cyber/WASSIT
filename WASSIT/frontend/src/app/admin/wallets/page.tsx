'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Role, Wallet } from '@/types';
import WalletList from '@/components/admin/WalletList';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

export default function AdminWalletsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من صلاحية المستخدم
  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // الحصول على جميع المحفظات
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAllWallets();
        
        if (response.success && response.data) {
          setWallets(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب المحفظات');
        }
      } catch (err) {
        console.error('خطأ في جلب المحفظات:', err);
        setError('حدث خطأ أثناء جلب المحفظات');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === Role.ADMIN) {
      fetchWallets();
    }
  }, [user]);

  // عرض صفحة المعاملات لمحفظة محددة
  const handleViewTransactions = (walletId: number) => {
    router.push(`/admin/transactions?walletId=${walletId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مديرًا، لا نعرض المحتوى
  if (!user || user.role !== Role.ADMIN) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المحفظات</h1>
        <a 
          href="/admin/dashboard"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
        >
          العودة للوحة التحكم
        </a>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">إجمالي المحفظات</h3>
              <p className="text-xl font-bold text-blue-900">{wallets.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">إجمالي الأرصدة</h3>
              <p className="text-xl font-bold text-green-900">
                {new Intl.NumberFormat('ar-IQ').format(wallets.reduce((sum, wallet) => sum + wallet.balance, 0))} د.ع
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">المحفظات النشطة</h3>
              <p className="text-xl font-bold text-yellow-900">
                {wallets.filter(wallet => wallet.isActive).length} / {wallets.length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <WalletList 
        wallets={wallets} 
        isLoading={isLoading} 
        error={error}
        onViewTransaction={handleViewTransactions}
      />
    </div>
  );
} 