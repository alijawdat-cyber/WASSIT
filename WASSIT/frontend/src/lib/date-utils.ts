import { 
  format, 
  formatDistance, 
  formatRelative, 
  isToday,
  isYesterday,
  parseISO, 
  differenceInDays 
} from 'date-fns';
import { ar } from 'date-fns/locale';

// التاريخ كاملاً (اليوم الشهر السنة) - 15 شعبان 1445 هـ
export const formatFullDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPP', { locale: ar });
};

// تنسيق التاريخ العام (استخدامه في جميع الجداول وصفحات الإدارة)
export const formatStandardDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy/MM/dd', { locale: ar });
};

// التاريخ مع الوقت - 15 شعبان 1445 هـ, 10:30 صباحًا
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPPp', { locale: ar });
};

// التاريخ النسبي (منذ 3 أيام، منذ ساعة، إلخ)
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true,
    locale: ar
  });
};

// صيغة مبسطة (اليوم، الأمس، التاريخ)
export const formatSimpleDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return 'اليوم';
  } else if (isYesterday(dateObj)) {
    return 'الأمس';
  } else if (differenceInDays(new Date(), dateObj) < 7) {
    // إذا كان خلال أسبوع، نعرض اسم اليوم
    return format(dateObj, 'EEEE', { locale: ar });
  } else {
    // وإلا نعرض التاريخ كاملاً
    return format(dateObj, 'P', { locale: ar });
  }
};

// تنسيق التاريخ حسب السياق
export const formatContextDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  return formatRelative(dateObj, new Date(), { locale: ar });
};

// تنسيق مختصر (2023/5/10)
export const formatShortDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy/MM/dd', { locale: ar });
};

// تنسيق وقت فقط (10:30 صباحاً)
export const formatTimeOnly = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'p', { locale: ar });
};

// أيام متبقية من الآن
export const getRemainingDays = (targetDate: string | Date): number => {
  const dateObj = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  return differenceInDays(dateObj, new Date());
};

// تحويل النص إلى تاريخ آمن
export const toSafeDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    const date = parseISO(dateString);
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    console.error('خطأ في تحليل التاريخ:', error);
    return null;
  }
};

/**
 * تنسيق التاريخ إلى نسخة سهلة القراءة باللغة العربية (نسخة العراق)
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  if (!date) {
    return 'غير محدد';
  }

  try {
    // تحويل إلى كائن تاريخ إذا كان نصًا
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // التحقق من صلاحية التاريخ
    if (isNaN(dateObj.getTime())) {
      return 'تاريخ غير صالح';
    }
    
    // تنسيق التاريخ باللغة العربية
    return dateObj.toLocaleDateString('ar-IQ', options);
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ:', error);
    return 'خطأ في عرض التاريخ';
  }
};

/**
 * تنسيق التاريخ إلى نص يوضح الوقت المنقضي منذ التاريخ المحدد
 */
export const timeAgo = (
  date: string | Date,
): string => {
  if (!date) {
    return '';
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // التحقق من صلاحية التاريخ
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    // لم يمر وقت بعد
    if (seconds < 0) {
      return 'الآن';
    }
    
    // منذ أقل من دقيقة
    if (seconds < 60) {
      return 'منذ لحظات';
    }
    
    // منذ أقل من ساعة
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes === 1 ? 'منذ دقيقة واحدة' : `منذ ${minutes} دقيقة`;
    }
    
    // منذ أقل من يوم
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1 ? 'منذ ساعة واحدة' : `منذ ${hours} ساعة`;
    }
    
    // منذ أقل من أسبوع
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return days === 1 ? 'منذ يوم واحد' : `منذ ${days} يوم`;
    }
    
    // منذ أقل من شهر
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return weeks === 1 ? 'منذ أسبوع واحد' : `منذ ${weeks} أسبوع`;
    }
    
    // منذ أقل من سنة
    const months = Math.floor(days / 30);
    if (months < 12) {
      return months === 1 ? 'منذ شهر واحد' : `منذ ${months} شهر`;
    }
    
    // أكثر من سنة
    const years = Math.floor(days / 365);
    return years === 1 ? 'منذ سنة واحدة' : `منذ ${years} سنة`;
    
  } catch (error) {
    console.error('خطأ في حساب الوقت المنقضي:', error);
    return '';
  }
}; 