'use client';

import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { 
  Users, 
  FileText, 
  ShoppingBag, 
  AlertTriangle, 
  Wallet, 
  CreditCard,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface DashboardStat {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

interface DashboardStatsProps {
  className?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || 'حدث خطأ أثناء جلب الإحصائيات');
        }
      } catch (err) {
        console.error('خطأ في جلب إحصائيات لوحة التحكم:', err);
        setError('حدث خطأ أثناء جلب الإحصائيات');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ar-IQ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!stats) {
    return <div>لا توجد إحصائيات متاحة</div>;
  }

  const dashboardStats: DashboardStat[] = [
    {
      title: 'إجمالي المستخدمين',
      value: formatNumber(stats.totalUsers || 0),
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'إجمالي الطلبات',
      value: formatNumber(stats.totalRequests || 0),
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'طلبات قيد التنفيذ',
      value: formatNumber(stats.inProgressRequests || 0),
      icon: <ShoppingBag className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      title: 'النزاعات النشطة',
      value: formatNumber(stats.activeDisputes || 0),
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'bg-red-100 text-red-700'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${formatNumber(stats.totalRevenue || 0)} د.ع`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'الطلبات المكتملة',
      value: formatNumber(stats.completedRequests || 0),
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      title: 'طلبات السحب المعلقة',
      value: formatNumber(stats.pendingWithdrawals || 0),
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-700'
    },
    {
      title: 'المحفظات النشطة',
      value: formatNumber(stats.activeWallets || 0),
      icon: <Wallet className="h-6 w-6" />,
      color: 'bg-sky-100 text-sky-700'
    }
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {dashboardStats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-sm text-gray-500">آخر 30 يوم</div>
            </div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">{stat.title}</h3>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            {stat.change !== undefined && (
              <div className={`text-sm mt-1 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change >= 0 ? '+' : ''}{stat.change}% من الشهر الماضي
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats; 