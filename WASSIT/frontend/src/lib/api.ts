import { 
  ApiResponse, 
  AuthResponse, 
  ChangePasswordFormData,
  CreateDisputeFormData,
  CreateDisputeReplyFormData,
  CreateOfferFormData, 
  CreateRatingFormData,
  CreateRequestFormData,
  CreateWithdrawalFormData,
  Dispute,
  DisputeReply,
  DisputeStatus,
  LoginFormData, 
  RegisterFormData, 
  ResolveDisputeFormData,
  Service, 
  Request,
  Offer,
  Message,
  Rating,
  Transaction,
  UpdateProfileFormData,
  User,
  Attachment,
  Notification,
  Wallet,
  WithdrawalRequest
} from '@/types';

// عنوان الـ API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// الحصول على التوكن من التخزين المحلي
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// تكوين رأس الطلب
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// وظائف المصادقة
export const authAPI = {
  // تسجيل مستخدم جديد
  async register(userData: RegisterFormData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(userData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في تسجيل المستخدم:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تسجيل الدخول
  async login(credentials: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(credentials),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // التحقق من الجلسة
  async verifyToken(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في التحقق من الجلسة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف الخدمات
export const servicesAPI = {
  // الحصول على جميع الخدمات
  async getAllServices(): Promise<ApiResponse<Service[]>> {
    try {
      const response = await fetch(`${API_URL}/services`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على الخدمات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف الطلبات
export const requestsAPI = {
  // الحصول على جميع الطلبات
  async getAllRequests(filters?: Record<string, any>): Promise<ApiResponse<Request[]>> {
    try {
      let url = `${API_URL}/requests`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على الطلبات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على طلب بواسطة المعرف
  async getRequestById(id: number): Promise<ApiResponse<Request>> {
    try {
      const response = await fetch(`${API_URL}/requests/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في الحصول على الطلب رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إنشاء طلب جديد
  async createRequest(requestData: CreateRequestFormData): Promise<ApiResponse<Request>> {
    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في إنشاء الطلب:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث حالة الطلب
  async updateRequestStatus(id: number, status: string): Promise<ApiResponse<Request>> {
    try {
      const response = await fetch(`${API_URL}/requests/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في تحديث حالة الطلب رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف العروض
export const offersAPI = {
  // الحصول على العروض لطلب معين
  async getOffersByRequestId(requestId: number): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await fetch(`${API_URL}/offers/request/${requestId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في الحصول على عروض الطلب رقم ${requestId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع العروض المقدمة من مزود الخدمة الحالي
  async getProviderOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await fetch(`${API_URL}/offers/provider`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على عروض مقدم الخدمة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إنشاء عرض جديد
  async createOffer(offerData: CreateOfferFormData): Promise<ApiResponse<Offer>> {
    try {
      const response = await fetch(`${API_URL}/offers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(offerData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في إنشاء العرض:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث حالة العرض
  async updateOfferStatus(id: number, status: string): Promise<ApiResponse<Offer>> {
    try {
      const response = await fetch(`${API_URL}/offers/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في تحديث حالة العرض رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف الرسائل
export const messagesAPI = {
  // الحصول على جميع المحادثات
  async getConversations(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/messages/conversations`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على المحادثات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على رسائل محادثة محددة
  async getMessagesByRequestId(requestId: number): Promise<ApiResponse<Message[]>> {
    try {
      const response = await fetch(`${API_URL}/messages/request/${requestId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في الحصول على رسائل الطلب رقم ${requestId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إرسال رسالة جديدة
  async sendMessage(data: { requestId: number, toUserId: number, content: string }): Promise<ApiResponse<Message>> {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف المستخدم والملف الشخصي
export const userAPI = {
  // الحصول على الملف الشخصي للمستخدم الحالي
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على الملف الشخصي:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث الملف الشخصي
  async updateProfile(profileData: UpdateProfileFormData): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تغيير كلمة المرور
  async changePassword(passwordData: ChangePasswordFormData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(passwordData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // رفع صورة شخصية
  async uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          // لا نضيف 'Content-Type' هنا لأن fetch سيضعها تلقائيًا مع multipart/form-data
        },
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في رفع الصورة الشخصية:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف وثائق مقدم الخدمة
export const providerDocAPI = {
  // الحصول على وثائق مقدم الخدمة
  async getDocuments(): Promise<ApiResponse<Attachment[]>> {
    try {
      const response = await fetch(`${API_URL}/provider-docs`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على الوثائق:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // رفع وثيقة جديدة
  async uploadDocument(file: File, documentType: string): Promise<ApiResponse<Attachment>> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      const response = await fetch(`${API_URL}/provider-docs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          // لا نضيف 'Content-Type' هنا لأن fetch سيضعها تلقائيًا مع multipart/form-data
        },
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في رفع الوثيقة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },
  
  // حذف وثيقة
  async deleteDocument(documentId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/provider-docs/${documentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في حذف الوثيقة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف التقييمات
export const ratingsAPI = {
  // الحصول على التقييمات المستلمة للمستخدم الحالي
  async getMyReceivedRatings(): Promise<ApiResponse<Rating[]>> {
    try {
      const response = await fetch(`${API_URL}/ratings/received`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على التقييمات المستلمة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على التقييمات المرسلة من المستخدم الحالي
  async getMySentRatings(): Promise<ApiResponse<Rating[]>> {
    try {
      const response = await fetch(`${API_URL}/ratings/sent`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على التقييمات المرسلة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على تقييمات مستخدم معين
  async getUserRatings(userId: number): Promise<ApiResponse<Rating[]>> {
    try {
      const response = await fetch(`${API_URL}/ratings/user/${userId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في الحصول على تقييمات المستخدم رقم ${userId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إنشاء تقييم جديد
  async createRating(ratingData: CreateRatingFormData): Promise<ApiResponse<Rating>> {
    try {
      const response = await fetch(`${API_URL}/ratings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(ratingData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في إنشاء التقييم:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // حذف تقييم
  async deleteRating(ratingId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في حذف التقييم رقم ${ratingId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف الإشعارات
export const notificationsAPI = {
  // الحصول على جميع الإشعارات
  async getAllNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على الإشعارات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على عدد الإشعارات غير المقروءة
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على عدد الإشعارات غير المقروءة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث حالة الإشعار إلى مقروء
  async markAsRead(notificationId: number): Promise<ApiResponse<Notification>> {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في تحديث حالة الإشعار رقم ${notificationId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث جميع الإشعارات إلى مقروءة
  async markAllAsRead(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في تحديث جميع الإشعارات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // حذف إشعار
  async deleteNotification(notificationId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في حذف الإشعار رقم ${notificationId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف النزاعات
export const disputesAPI = {
  // الحصول على جميع النزاعات
  async getAllDisputes(filters?: Record<string, any>): Promise<ApiResponse<Dispute[]>> {
    try {
      let url = `${API_URL}/disputes`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على النزاعات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على نزاعات العميل
  async getClientDisputes(): Promise<ApiResponse<Dispute[]>> {
    try {
      const response = await fetch(`${API_URL}/disputes/client`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على نزاعات العميل:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على نزاعات مقدم الخدمة
  async getProviderDisputes(): Promise<ApiResponse<Dispute[]>> {
    try {
      const response = await fetch(`${API_URL}/disputes/provider`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على نزاعات مقدم الخدمة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على نزاع بواسطة المعرف
  async getDisputeById(id: number): Promise<ApiResponse<Dispute>> {
    try {
      const response = await fetch(`${API_URL}/disputes/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في الحصول على النزاع رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إنشاء نزاع جديد
  async createDispute(disputeData: CreateDisputeFormData): Promise<ApiResponse<Dispute>> {
    try {
      const { attachments, ...data } = disputeData;
      
      // إذا كانت هناك مرفقات، نستخدم FormData
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        
        // إضافة بيانات النموذج
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        
        // إضافة المرفقات
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        const response = await fetch(`${API_URL}/disputes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
          body: formData,
        });
        
        return await response.json();
      } else {
        // إذا لم تكن هناك مرفقات، نستخدم JSON
        const response = await fetch(`${API_URL}/disputes`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        
        return await response.json();
      }
    } catch (error) {
      console.error('خطأ في إنشاء النزاع:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على ردود نزاع
  async getDisputeReplies(disputeId: number): Promise<ApiResponse<DisputeReply[]>> {
    try {
      const response = await fetch(`${API_URL}/disputes/${disputeId}/replies`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في الحصول على ردود النزاع رقم ${disputeId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إضافة رد على نزاع
  async addDisputeReply(replyData: CreateDisputeReplyFormData): Promise<ApiResponse<DisputeReply>> {
    try {
      const { disputeId, attachments, content } = replyData;
      
      // إذا كانت هناك مرفقات، نستخدم FormData
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        formData.append('content', content);
        
        // إضافة المرفقات
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        const response = await fetch(`${API_URL}/disputes/${disputeId}/replies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
          body: formData,
        });
        
        return await response.json();
      } else {
        // إذا لم تكن هناك مرفقات، نستخدم JSON
        const response = await fetch(`${API_URL}/disputes/${disputeId}/replies`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ content }),
        });
        
        return await response.json();
      }
    } catch (error) {
      console.error('خطأ في إضافة رد على النزاع:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // حل نزاع (للمسؤول)
  async resolveDispute(resolveData: ResolveDisputeFormData): Promise<ApiResponse<Dispute>> {
    try {
      const { disputeId, ...data } = resolveData;
      
      const response = await fetch(`${API_URL}/disputes/${disputeId}/resolve`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في حل النزاع رقم ${resolveData.disputeId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إلغاء نزاع
  async cancelDispute(disputeId: number): Promise<ApiResponse<Dispute>> {
    try {
      const response = await fetch(`${API_URL}/disputes/${disputeId}/cancel`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في إلغاء النزاع رقم ${disputeId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف المحفظة والمدفوعات
export const walletAPI = {
  // الحصول على معلومات المحفظة
  async getWallet(): Promise<ApiResponse<Wallet>> {
    try {
      const response = await fetch(`${API_URL}/wallet`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على المحفظة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على سجل المعاملات المالية
  async getTransactions(filters?: Record<string, any>): Promise<ApiResponse<Transaction[]>> {
    try {
      let url = `${API_URL}/wallet/transactions`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على المعاملات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إنشاء طلب سحب
  async createWithdrawalRequest(data: CreateWithdrawalFormData): Promise<ApiResponse<WithdrawalRequest>> {
    try {
      const response = await fetch(`${API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في إنشاء طلب سحب:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على طلبات السحب السابقة
  async getWithdrawalRequests(): Promise<ApiResponse<WithdrawalRequest[]>> {
    try {
      const response = await fetch(`${API_URL}/wallet/withdrawals`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على طلبات السحب:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إلغاء طلب سحب
  async cancelWithdrawalRequest(id: number): Promise<ApiResponse<WithdrawalRequest>> {
    try {
      const response = await fetch(`${API_URL}/wallet/withdrawals/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في إلغاء طلب سحب:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على طرق الدفع المتاحة
  async getPaymentMethods(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/payments/methods`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على طرق الدفع:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // معالجة عملية دفع لعرض
  async processPayment(offerId: number, paymentData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/payments/process/${offerId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في معالجة عملية الدفع:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
};

// وظائف الإدارة
export const adminAPI = {
  // الحصول على إحصائيات لوحة التحكم
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع المستخدمين
  async getAllUsers(filters?: Record<string, any>): Promise<ApiResponse<User[]>> {
    try {
      let url = `${API_URL}/admin/users`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على المستخدمين:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على مستخدم بواسطة المعرف
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في الحصول على المستخدم رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث حالة المستخدم (تفعيل/تعطيل)
  async updateUserStatus(id: number, isActive: boolean): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في تحديث حالة المستخدم رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع الطلبات للإدارة
  async getAllRequests(filters?: Record<string, any>): Promise<ApiResponse<Request[]>> {
    try {
      let url = `${API_URL}/admin/requests`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على الطلبات للإدارة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع العروض للإدارة
  async getAllOffers(filters?: Record<string, any>): Promise<ApiResponse<Offer[]>> {
    try {
      let url = `${API_URL}/admin/offers`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على العروض للإدارة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث هامش ربح العرض
  async updateOfferMargin(id: number, adminPrice: number): Promise<ApiResponse<Offer>> {
    try {
      const response = await fetch(`${API_URL}/admin/offers/${id}/margin`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ adminPrice }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في تحديث هامش الربح للعرض رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع النزاعات للإدارة
  async getAllDisputes(filters?: Record<string, any>): Promise<ApiResponse<Dispute[]>> {
    try {
      let url = `${API_URL}/admin/disputes`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على النزاعات للإدارة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // حل النزاع من قبل الإدارة
  async resolveDispute(resolveData: ResolveDisputeFormData): Promise<ApiResponse<Dispute>> {
    try {
      const response = await fetch(`${API_URL}/admin/disputes/${resolveData.disputeId}/resolve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resolveData),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في حل النزاع رقم ${resolveData.disputeId}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع المحافظ للإدارة
  async getAllWallets(filters?: Record<string, any>): Promise<ApiResponse<Wallet[]>> {
    try {
      let url = `${API_URL}/admin/wallets`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على المحافظ للإدارة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع طلبات السحب للإدارة
  async getAllWithdrawalRequests(filters?: Record<string, any>): Promise<ApiResponse<WithdrawalRequest[]>> {
    try {
      let url = `${API_URL}/admin/withdrawals`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على طلبات السحب للإدارة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث حالة طلب السحب
  async updateWithdrawalStatus(id: number, status: string, adminNotes?: string): Promise<ApiResponse<WithdrawalRequest>> {
    try {
      const response = await fetch(`${API_URL}/admin/withdrawals/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, adminNotes }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في تحديث حالة طلب السحب رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع المعاملات المالية للإدارة
  async getAllTransactions(filters?: Record<string, any>): Promise<ApiResponse<Transaction[]>> {
    try {
      let url = `${API_URL}/admin/transactions`;
      
      // إضافة مرشحات إذا وجدت
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على المعاملات المالية للإدارة:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع سياسات هوامش الربح
  async getMarginPolicies(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/admin/margin-policies`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على سياسات الهوامش:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // إنشاء سياسة هامش ربح جديدة
  async createMarginPolicy(policyData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/admin/margin-policies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(policyData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في إنشاء سياسة هامش:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // تحديث سياسة هامش ربح
  async updateMarginPolicy(id: number, policyData: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/admin/margin-policies/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(policyData),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في تحديث سياسة الهامش رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // حذف سياسة هامش ربح
  async deleteMarginPolicy(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/admin/margin-policies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`خطأ في حذف سياسة الهامش رقم ${id}:`, error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  },

  // الحصول على جميع الخدمات
  async getAllServices(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/admin/services`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في الحصول على الخدمات:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء الاتصال بالخادم'
      };
    }
  }
}; 