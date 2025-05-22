'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import WalletNotification from '@/components/payment/WalletNotification';
import NotificationBadge from '@/components/notifications/NotificationBadge';
import { Role } from '@/types';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // إغلاق القائمة عند التنقل (باستخدام useCallback لتحسين الأداء)
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  
  // التحقق إذا كان المسار الحالي هو الصفحة الرئيسية (باستخدام useMemo لتحسين الأداء)
  const isHomePage = useMemo(() => pathname === '/', [pathname]);

  // دالة للتحقق من حالة النشط للروابط (باستخدام useCallback لتحسين الأداء)
  const isActive = useCallback((path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  }, [pathname]);
  
  // تحديد مسار لوحة التحكم بناءً على دور المستخدم
  const dashboardPath = useMemo(() => {
    if (!user) return '/login';
    
    switch (user.role) {
      case Role.ADMIN:
        return '/admin/dashboard';
      case Role.CLIENT:
        return '/client/dashboard';
      case Role.PROVIDER:
        return '/provider/dashboard';
      default:
        return '/dashboard';
    }
  }, [user]);
  
  // قائمة الروابط الرئيسية
  const mainLinks = useMemo(() => [
    { href: '/services', label: 'الخدمات' },
    { href: '/how-it-works', label: 'كيف يعمل' },
    { href: '/about', label: 'من نحن' },
  ], []);
  
  // قائمة الروابط للمستخدم المسجل
  const userLinks = useMemo(() => [
    { href: '/profile', label: 'الملف الشخصي' },
    { href: '/wallet', label: 'المحفظة' },
    { href: '/messages', label: 'الرسائل' },
    { href: '/notifications', label: 'الإشعارات' },
  ], []);
  
  return (
    <header className={`shadow-md ${isHomePage ? 'bg-primary text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* الشعار */}
          <Link href="/" className="text-2xl font-bold">
            وسّط
          </Link>
          
          {/* قائمة التنقل للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center gap-6">
            {mainLinks.map(link => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-colors ${
                  isActive(link.href) 
                    ? 'text-secondary font-bold' 
                    : 'hover:text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                {/* عناصر إضافية للمستخدمين المسجلين */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <WalletNotification className="ml-4" />
                  <NotificationBadge className="ml-2" />
                </div>
                
                {/* رابط لوحة التحكم */}
                <Link 
                  href={dashboardPath}
                  className={`transition-colors ${
                    isActive('/admin') || isActive('/client') || isActive('/provider')
                      ? 'text-secondary font-bold' 
                      : 'hover:text-secondary'
                  }`}
                >
                  لوحة التحكم
                </Link>
                
                {/* قائمة المستخدم المنسدلة */}
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-secondary transition-colors">
                    <span>{user?.name || 'المستخدم'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute z-10 start-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {userLinks.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenu}
                          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive(link.href) ? 'bg-gray-100 font-semibold' : ''}`}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          closeMenu();
                          logout();
                        }}
                        className="block w-full text-end px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* روابط للزوار */}
                <Link 
                  href="/login" 
                  className={`px-4 py-2 ${
                    isHomePage 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : isActive('/login')
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-gray-100 text-gray-900'
                  } rounded-lg hover:bg-opacity-90 transition-all`}
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/register" 
                  className={`px-4 py-2 ${
                    isActive('/register') 
                      ? 'bg-secondary-dark' 
                      : 'bg-secondary'
                  } text-white rounded-lg hover:bg-opacity-90 transition-all`}
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </nav>
          
          {/* زر القائمة للشاشات الصغيرة */}
          <div className="md:hidden flex items-center space-x-3 rtl:space-x-reverse">
            {isAuthenticated && (
              <>
                <WalletNotification />
                <NotificationBadge />
              </>
            )}
            <button
              className="focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* قائمة منسدلة للشاشات الصغيرة */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col gap-4">
              {mainLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`transition-colors ${isActive(link.href) ? 'text-secondary font-bold' : 'hover:text-secondary'}`}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    href={dashboardPath}
                    onClick={closeMenu}
                    className={`transition-colors ${
                      isActive('/admin') || isActive('/client') || isActive('/provider')
                        ? 'text-secondary font-bold' 
                        : 'hover:text-secondary'
                    }`}
                  >
                    لوحة التحكم
                  </Link>
                  
                  {userLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`transition-colors ${isActive(link.href) ? 'text-secondary font-bold' : 'hover:text-secondary'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="text-red-600 text-end hover:text-red-800 transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className={`px-4 py-2 ${
                      isHomePage 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : isActive('/login')
                          ? 'bg-gray-200 text-gray-900'
                          : 'bg-gray-100 text-gray-900'
                    } rounded-lg text-center hover:bg-opacity-90 transition-all`}
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className={`px-4 py-2 ${
                      isActive('/register') 
                        ? 'bg-secondary-dark' 
                        : 'bg-secondary'
                    } text-white rounded-lg text-center hover:bg-opacity-90 transition-all`}
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 