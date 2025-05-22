'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  printMode?: boolean;
  stickyHeader?: boolean;
  className?: string;
  isTransparent?: boolean;
  withContainer?: boolean;
  containerClass?: string;
}

/**
 * المكون الرئيسي للتخطيط العام بالتطبيق
 * يدعم عدة أوضاع: الطباعة، شريط علوي ثابت، شفافية، إلخ
 */
const MainLayout = ({
  children,
  showFooter = true,
  printMode = false,
  stickyHeader = false,
  className = '',
  isTransparent = false,
  withContainer = false,
  containerClass = 'max-w-7xl',
}: MainLayoutProps) => {
  const [scrolled, setScrolled] = useState(false);

  // إضافة مستمع لحدث التمرير إذا كان شريط التنقل ثابتًا
  useEffect(() => {
    if (stickyHeader) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };

      window.addEventListener('scroll', handleScroll);
      
      // تنظيف المستمع عند تفكيك المكون
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [stickyHeader]);

  return (
    <div className={`flex flex-col min-h-screen ${className} ${printMode ? 'print:bg-white print:max-w-full' : ''}`}>
      {/* شريط التنقل العلوي */}
      {!printMode && (
        <div className={`${stickyHeader ? 'sticky top-0 z-50' : ''} ${
          scrolled ? 'shadow-md bg-white text-gray-900' : isTransparent ? 'bg-transparent' : ''
        } transition-all duration-300`}>
          <Navbar />
        </div>
      )}
      
      {/* المحتوى الرئيسي */}
      <main className={`flex-grow ${printMode ? 'print:p-0' : ''}`}>
        {withContainer ? (
          <div className={`container mx-auto px-4 ${containerClass}`}>
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      
      {/* تذييل الصفحة */}
      {showFooter && !printMode && <Footer />}
    </div>
  );
};

export default MainLayout; 