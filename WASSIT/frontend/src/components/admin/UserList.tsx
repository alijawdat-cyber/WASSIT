'use client';

import React, { useState } from 'react';
import { User, Role } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/date-utils';
import { MailIcon, PhoneIcon, CheckIcon, XIcon } from 'lucide-react';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onViewDetails?: (userId: number) => void;
  onToggleStatus?: (userId: number, isActive: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  isLoading, 
  error, 
  onViewDetails,
  onToggleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // فلترة وترتيب المستخدمين
  const filteredUsers = users
    .filter(user => {
      // تنفيذ البحث
      const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const phoneMatch = user.phone?.includes(searchTerm) || false;
      
      // تطبيق فلتر الدور والحالة
      const roleMatch = roleFilter === '' || user.role === roleFilter;
      const statusMatch = statusFilter === '' || 
        (statusFilter === 'active' && user.isActive) || 
        (statusFilter === 'inactive' && !user.isActive);

      return (nameMatch || emailMatch || phoneMatch) && roleMatch && statusMatch;
    })
    .sort((a, b) => {
      // طرق الترتيب المختلفة
      if (sortBy === 'id') {
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
      } else if (sortBy === 'name') {
        if (!a.name) return sortDirection === 'asc' ? -1 : 1;
        if (!b.name) return sortDirection === 'asc' ? 1 : -1;
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name, 'ar') 
          : b.name.localeCompare(a.name, 'ar');
      } else if (sortBy === 'email') {
        if (!a.email) return sortDirection === 'asc' ? -1 : 1;
        if (!b.email) return sortDirection === 'asc' ? 1 : -1;
        return sortDirection === 'asc' 
          ? a.email.localeCompare(b.email) 
          : b.email.localeCompare(a.email);
      } else if (sortBy === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      // افتراضي للترتيب
      return sortDirection === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // تغيير الترتيب
  const toggleSortDirection = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDirection('desc');
    }
  };

  // ترجمة دور المستخدم
  const translateRole = (role: string): string => {
    switch(role) {
      case Role.ADMIN:
        return 'مدير النظام';
      case Role.CLIENT:
        return 'عميل';
      case Role.PROVIDER:
        return 'مقدم خدمة';
      default:
        return role;
    }
  };

  // الحصول على لون الدور
  const getRoleColor = (role: string): string => {
    switch(role) {
      case Role.ADMIN:
        return 'bg-red-100 text-red-800';
      case Role.CLIENT:
        return 'bg-blue-100 text-blue-800';
      case Role.PROVIDER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // الترميز لأيقونات الترتيب
  const getSortIcon = (columnName: string) => {
    if (sortBy !== columnName) {
      return null;
    }
    
    return sortDirection === 'asc' 
      ? <span className="inline-block mr-1">▲</span> 
      : <span className="inline-block mr-1">▼</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold">قائمة المستخدمين</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                placeholder="بحث بالاسم أو البريد أو الهاتف"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">كل الأدوار</option>
                <option value={Role.ADMIN}>مدير النظام</option>
                <option value={Role.CLIENT}>عميل</option>
                <option value={Role.PROVIDER}>مقدم خدمة</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">كل الحالات</option>
                <option value="active">مفعّل</option>
                <option value="inactive">معطّل</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('id')}
              >
                الرقم التعريفي {getSortIcon('id')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('name')}
              >
                الاسم {getSortIcon('name')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('email')}
              >
                البريد الإلكتروني {getSortIcon('email')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الهاتف
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الدور
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSortDirection('createdAt')}
              >
                تاريخ التسجيل {getSortIcon('createdAt')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        )}
                      </div>
                      <div className="mr-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'لا يوجد اسم'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <MailIcon className="ml-1 w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="ml-1 w-4 h-4" />
                      <span>{user.phone || 'غير متوفر'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                      {translateRole(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'مفعّل' : 'معطّل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-1 space-x-reverse">
                    <button
                      onClick={() => onViewDetails && onViewDetails(user.id)}
                      className="mr-2 py-1 px-3 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      التفاصيل
                    </button>
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(user.id, !user.isActive)}
                      className={`py-1 px-3 rounded flex items-center ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {user.isActive ? (
                        <>
                          <XIcon size={14} className="ml-1" />
                          تعطيل
                        </>
                      ) : (
                        <>
                          <CheckIcon size={14} className="ml-1" />
                          تفعيل
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  لا توجد نتائج مطابقة للبحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList; 