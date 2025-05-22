'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role, LoginFormData, RegisterFormData } from '@/types';
import { authAPI } from '@/lib/api';

// تعريف نوع سياق المصادقة
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginFormData) => Promise<boolean>;
  register: (userData: RegisterFormData) => Promise<boolean>;
  logout: () => void;
}

// إنشاء سياق المصادقة
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// مزود سياق المصادقة
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // تحميل الجلسة الحالية من التخزين المحلي إذا كانت موجودة
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // محاولة استرداد التوكن من التخزين المحلي
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          setToken(storedToken);
          
          // التحقق من صلاحية التوكن
          const response = await authAPI.verifyToken();
          
          if (response.success && response.data) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // إذا كان التوكن غير صالح، قم بتسجيل الخروج
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('حدث خطأ أثناء تهيئة المصادقة:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // تسجيل الدخول
  const login = async (credentials: LoginFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        // حفظ بيانات المستخدم والتوكن
        setUser(response.data.user);
        setToken(response.data.token);
        setIsAuthenticated(true);
        
        // حفظ التوكن في التخزين المحلي
        localStorage.setItem('token', response.data.token);
        
        return true;
      } else {
        // حدث خطأ في تسجيل الدخول
        setError(response.message || 'فشل تسجيل الدخول، يرجى التحقق من بيانات الاعتماد الخاصة بك');
        return false;
      }
    } catch (err) {
      console.error('حدث خطأ أثناء تسجيل الدخول:', err);
      setError('حدث خطأ غير متوقع أثناء تسجيل الدخول');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // تسجيل مستخدم جديد
  const register = async (userData: RegisterFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        // حفظ بيانات المستخدم والتوكن
        setUser(response.data.user);
        setToken(response.data.token);
        setIsAuthenticated(true);
        
        // حفظ التوكن في التخزين المحلي
        localStorage.setItem('token', response.data.token);
        
        return true;
      } else {
        // حدث خطأ في التسجيل
        setError(response.message || 'فشل التسجيل، يرجى المحاولة مرة أخرى');
        return false;
      }
    } catch (err) {
      console.error('حدث خطأ أثناء التسجيل:', err);
      setError('حدث خطأ غير متوقع أثناء التسجيل');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // تسجيل الخروج
  const logout = () => {
    // مسح بيانات المستخدم والتوكن
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // مسح التوكن من التخزين المحلي
    localStorage.removeItem('token');
    
    // توجيه المستخدم إلى الصفحة الرئيسية
    router.push('/');
  };
  
  // القيمة التي سيتم توفيرها للمكونات المستهلكة
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// هوك لاستخدام سياق المصادقة
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth يجب استخدامه داخل AuthProvider');
  }
  
  return context;
}; 