'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { walletAPI } from '@/lib/api';
import { Wallet } from '@/types';

interface WalletNotificationProps {
  className?: string;
}

const WalletNotification: React.FC<WalletNotificationProps> = ({ className = '' }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const response = await walletAPI.getWallet();
        if (response.success && response.data) {
          setWallet(response.data);
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات المحفظة:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const handleClick = () => {
    router.push('/wallet');
  };

  if (loading || !wallet) {
    return null;
  }

  return (
    <button 
      onClick={handleClick}
      className={`relative flex items-center bg-blue-50 text-blue-800 rounded-full px-3 py-1 text-sm font-medium ${className}`}
    >
      <span className="mr-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      </span>
      <span className="ltr:ml-1 rtl:mr-1">{wallet.availableBalance.toLocaleString('ar-IQ')} د.ع</span>
    </button>
  );
};

export default WalletNotification; 