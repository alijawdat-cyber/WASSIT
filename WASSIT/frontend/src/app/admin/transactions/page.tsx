'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Role, Transaction, TransactionStatus, TransactionType } from '@/types';
import TransactionList from '@/components/admin/TransactionList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';

export default function AdminTransactionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من صلاحية المستخدم
  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // الحصول على جميع المعاملات
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAllTransactions();
        
        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب المعاملات المالية');
        }
      } catch (err) {
        console.error('خطأ في جلب المعاملات المالية:', err);
        setError('حدث خطأ أثناء جلب المعاملات المالية');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === Role.ADMIN) {
      fetchTransactions();
    }
  }, [user]);

  // عرض تفاصيل المعاملة
  const handleViewDetails = (transactionId: number) => {
    router.push(`/admin/transactions/${transactionId}`);
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

  // حساب إحصائيات المعاملات المالية
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const escrowAmount = transactions
    .filter(transaction => transaction.type === 'escrow' && transaction.status === 'pending')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const paymentsCount = transactions.filter(transaction => transaction.type === 'payment').length;
  const withdrawalsCount = transactions.filter(transaction => transaction.type === 'withdrawal').length;
  const commissionsAmount = transactions
    .filter(transaction => transaction.type === 'commission')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المعاملات المالية</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">إجمالي المعاملات</h3>
              <p className="text-xl font-bold text-blue-900">{transactions.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">إجمالي العمولات</h3>
              <p className="text-xl font-bold text-green-900">{commissionsAmount.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">المبالغ المحتجزة (Escrow)</h3>
              <p className="text-xl font-bold text-yellow-900">{escrowAmount.toLocaleString('ar-IQ')} د.ع</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">معدل العمولات</h3>
              <div className="flex items-baseline">
                <p className="text-xl font-bold text-indigo-900">
                  {transactions.length > 0 
                    ? (commissionsAmount / totalAmount * 100).toFixed(1) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <TransactionList 
          transactions={transactions} 
          isLoading={isLoading} 
          error={error}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
} 