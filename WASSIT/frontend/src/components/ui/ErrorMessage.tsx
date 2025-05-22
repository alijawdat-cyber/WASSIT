'use client';

import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorMessageProps {
  message: string;
  details?: string | null;
  onRetry?: () => void;
  className?: string;
  showRetry?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  details,
  onRetry,
  className = '',
  showRetry = true
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };
  
  const hasDetails = details && details.trim().length > 0;
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="text-red-600 ml-3 mt-1 flex-shrink-0" size={20} />
        <div className="flex-grow">
          <div className="text-red-700 font-medium">{message}</div>
          
          {hasDetails && (
            <div className="mt-2">
              <button
                type="button"
                onClick={toggleDetails}
                className="text-red-600 hover:text-red-800 text-sm flex items-center"
              >
                {showDetails ? (
                  <>
                    <ChevronUp size={16} className="ml-1" />
                    إخفاء التفاصيل
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="ml-1" />
                    عرض التفاصيل
                  </>
                )}
              </button>
              
              {showDetails && (
                <div className="mt-2 p-3 bg-red-100 rounded text-red-700 text-sm whitespace-pre-wrap overflow-auto">
                  {details}
                </div>
              )}
            </div>
          )}
          
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              className="mt-3 flex items-center bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              <RefreshCw size={14} className="ml-1" />
              إعادة المحاولة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 