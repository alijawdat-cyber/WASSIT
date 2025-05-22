'use client';

import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

interface StatsLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  cards?: StatsCardProps[];
  filterComponent?: ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-5 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
        </div>
        {icon && (
          <div className="bg-primary bg-opacity-10 p-3 rounded-full text-primary">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <span className="text-green-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {trendValue}
            </span>
          ) : trend === 'down' ? (
            <span className="text-red-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {trendValue}
            </span>
          ) : (
            <span className="text-gray-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const StatsLayout: React.FC<StatsLayoutProps> = ({
  children,
  title,
  subtitle,
  cards = [],
  filterComponent,
}) => {
  return (
    <DashboardLayout title={title}>
      <div className="space-y-6">
        {subtitle && (
          <div className="border-b pb-3">
            <p className="text-gray-600">{subtitle}</p>
          </div>
        )}
        
        {filterComponent && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            {filterComponent}
          </div>
        )}
        
        {cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
              <StatsCard key={index} {...card} />
            ))}
          </div>
        )}
        
        <div>{children}</div>
      </div>
    </DashboardLayout>
  );
};

export default StatsLayout; 