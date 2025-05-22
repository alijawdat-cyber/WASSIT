'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, walletAPI } from '@/lib/api';
import { Transaction, Wallet } from '@/types';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import WalletBalance from '@/components/payment/WalletBalance';
import TransactionHistory from '@/components/payment/TransactionHistory';

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        // جلب بيانات المحفظة
        const walletResponse = await walletAPI.getWallet();
        if (walletResponse.success && walletResponse.data) {
          setWallet(walletResponse.data);
        } else {
          setError(walletResponse.message || 'حدث خطأ أثناء جلب بيانات المحفظة');
        }

        // جلب المعاملات
        const transactionsResponse = await walletAPI.getTransactions();
        if (transactionsResponse.success && transactionsResponse.data) {
          setTransactions(transactionsResponse.data);
        } else {
          setError(transactionsResponse.message || 'حدث خطأ أثناء جلب سجل المعاملات');
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات المحفظة:', err);
        setError('حدث خطأ أثناء الاتصال بالخادم');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, [user, router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">محفظتي</h1>
        <button
          onClick={() => router.push('/wallet/withdraw')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          طلب سحب رصيد
        </button>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <WalletBalance wallet={wallet} />
          </div>
          <div className="md:col-span-8">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">سجل المعاملات</h2>
                <TransactionHistory transactions={transactions} />
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 