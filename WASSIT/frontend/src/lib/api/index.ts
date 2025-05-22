import { ApiResponse, User, Role, Request, Offer, Service } from '@/types';

// نوع بيانات تسجيل الدخول
export interface LoginFormData {
  email: string;
  password: string;
}

// نوع بيانات التسجيل
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  city?: string;
  phone?: string;
}

// نوع بيانات إنشاء طلب جديد
export interface CreateRequestFormData {
  serviceId: number;
  description: string;
  budget?: string;
}

// نوع بيانات إنشاء عرض جديد
export interface CreateOfferFormData {
  requestId: number;
  proposedPrice: number;
  proposedDays: number;
  message?: string;
  description?: string;
}

// محاكاة لواجهة برمجة التطبيقات للتعامل مع المصادقة
export const authAPI = {
  // تسجيل الدخول
  async login(credentials: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    // محاكاة طلب تسجيل الدخول
    return new Promise((resolve) => {
      setTimeout(() => {
        // في الإصدار التجريبي، نعيد بيانات مستخدم وهمي
        resolve({
          success: true,
          data: {
            user: {
              id: 1,
              name: 'مستخدم تجريبي',
              email: credentials.email,
              role: credentials.email.includes('provider') ? 'PROVIDER' : 'CLIENT',
              city: 'بغداد',
            },
            token: 'token_وهمي_للاختبار',
          },
        });
      }, 800);
    });
  },

  // تسجيل مستخدم جديد
  async register(userData: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    // محاكاة طلب التسجيل
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            user: {
              id: 2,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              city: userData.city,
            },
            token: 'token_وهمي_للتسجيل_الجديد',
          },
        });
      }, 800);
    });
  },

  // التحقق من التوكن
  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    // محاكاة التحقق من التوكن
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          resolve({
            success: true,
            data: {
              user: JSON.parse(storedUser),
            },
          });
        } else {
          resolve({
            success: false,
            message: 'التوكن غير صالح أو منتهي الصلاحية',
          });
        }
      }, 500);
    });
  },
};

// محاكاة لواجهة برمجة التطبيقات للتعامل مع الخدمات
export const servicesAPI = {
  // الحصول على جميع الخدمات
  async getAllServices(): Promise<ApiResponse<Service[]>> {
    // محاكاة طلب الحصول على الخدمات
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: 1, name: 'تصوير', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 2, name: 'تصميم جرافيك', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 3, name: 'كتابة محتوى', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 4, name: 'إدارة سوشيال ميديا', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        });
      }, 800);
    });
  },
};

// محاكاة لواجهة برمجة التطبيقات للتعامل مع الطلبات
export const requestsAPI = {
  // الحصول على جميع الطلبات
  async getAllRequests(): Promise<ApiResponse<Request[]>> {
    // محاكاة طلب الحصول على الطلبات
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 1,
              clientId: 1,
              serviceId: 1,
              service: { id: 1, name: 'تصوير', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              description: 'أحتاج إلى تصوير منتجات لمتجر إلكتروني',
              status: 'OPEN',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              offers: [
                { id: 1, requestId: 1, providerId: 2, status: 'PENDING', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              ],
            },
            {
              id: 2,
              clientId: 1,
              serviceId: 2,
              service: { id: 2, name: 'تصميم جرافيك', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              description: 'تصميم شعار وهوية بصرية لمشروع جديد',
              status: 'IN_PROGRESS',
              createdAt: new Date(Date.now() - 86400000).toISOString(), // يوم واحد قبل الآن
              updatedAt: new Date().toISOString(),
              offers: [
                { id: 2, requestId: 2, providerId: 3, status: 'ACCEPTED', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
              ],
            },
            {
              id: 3,
              clientId: 1,
              serviceId: 3,
              service: { id: 3, name: 'كتابة محتوى', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              description: 'كتابة محتوى لموقع إلكتروني (5 صفحات)',
              status: 'COMPLETED',
              createdAt: new Date(Date.now() - 172800000).toISOString(), // يومان قبل الآن
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
              offers: [
                { id: 3, requestId: 3, providerId: 4, status: 'ACCEPTED', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString() },
              ],
            },
          ],
        });
      }, 800);
    });
  },

  // الحصول على طلب بواسطة المعرف
  async getRequestById(id: number): Promise<ApiResponse<Request>> {
    // محاكاة طلب الحصول على طلب معين
    return new Promise((resolve) => {
      setTimeout(() => {
        // التحقق من صحة المعرف
        if (!id || isNaN(id) || id <= 0) {
          resolve({
            success: false,
            message: 'معرّف الطلب غير صالح',
          });
          return;
        }
        
        if (id === 1) {
          resolve({
            success: true,
            data: {
              id: 1,
              clientId: 1,
              serviceId: 1,
              service: { id: 1, name: 'تصوير', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              description: 'أحتاج إلى تصوير منتجات لمتجر إلكتروني. يجب أن تكون الصور عالية الجودة وبخلفية بيضاء.',
              budget: '150',
              status: 'OPEN',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        } else if (id === 2) {
          resolve({
            success: true,
            data: {
              id: 2,
              clientId: 1,
              serviceId: 2,
              service: { id: 2, name: 'تصميم جرافيك', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              description: 'تصميم شعار وهوية بصرية لمشروع جديد في مجال التكنولوجيا.',
              budget: '200',
              status: 'IN_PROGRESS',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        } else {
          resolve({
            success: false,
            message: 'لم يتم العثور على الطلب',
          });
        }
      }, 800);
    });
  },

  // إنشاء طلب جديد
  async createRequest(requestData: CreateRequestFormData): Promise<ApiResponse<Request>> {
    // محاكاة إنشاء طلب جديد
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: Math.floor(Math.random() * 1000) + 10,
            clientId: 1,
            serviceId: requestData.serviceId,
            description: requestData.description,
            budget: requestData.budget,
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }, 800);
    });
  },

  // تحديث حالة الطلب
  async updateRequestStatus(id: number, status: string): Promise<ApiResponse<Request>> {
    // محاكاة تحديث حالة الطلب
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id,
            clientId: 1,
            serviceId: 1,
            description: 'وصف الطلب',
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }, 800);
    });
  },
};

// محاكاة لواجهة برمجة التطبيقات للتعامل مع العروض
export const offersAPI = {
  // الحصول على العروض المرتبطة بطلب معين
  async getOffersByRequestId(requestId: number): Promise<ApiResponse<Offer[]>> {
    // محاكاة طلب الحصول على العروض
    return new Promise((resolve) => {
      setTimeout(() => {
        if (requestId === 1) {
          resolve({
            success: true,
            data: [
              {
                id: 1,
                requestId: 1,
                providerId: 2,
                provider: { id: 2, name: 'مقدم خدمة 1', email: 'provider1@example.com', role: 'PROVIDER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                proposedPrice: 120,
                proposedDays: 3,
                status: 'PENDING',
                message: 'يمكنني تصوير المنتجات بجودة عالية وخلفية بيضاء نقية',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 2,
                requestId: 1,
                providerId: 3,
                provider: { id: 3, name: 'مقدم خدمة 2', email: 'provider2@example.com', role: 'PROVIDER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                proposedPrice: 150,
                proposedDays: 2,
                status: 'PENDING',
                message: 'عندي استوديو متكامل لتصوير المنتجات مع إمكانية التعديل',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          });
        } else if (requestId === 2) {
          resolve({
            success: true,
            data: [
              {
                id: 3,
                requestId: 2,
                providerId: 4,
                provider: { id: 4, name: 'مقدم خدمة 3', email: 'provider3@example.com', role: 'PROVIDER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                proposedPrice: 180,
                proposedDays: 5,
                status: 'ACCEPTED',
                message: 'سأقوم بتصميم شعار مميز مع هوية بصرية متكاملة',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date().toISOString(),
                workSubmitted: false,
              },
            ],
          });
        } else {
          resolve({
            success: true,
            data: [],
          });
        }
      }, 800);
    });
  },

  // الحصول على عروضي المقدمة كمزود خدمة
  async getProviderOffers(): Promise<ApiResponse<Offer[]>> {
    // محاكاة طلب الحصول على عروض مقدم الخدمة
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              id: 4,
              requestId: 1,
              providerId: 5,
              proposedPrice: 130,
              proposedDays: 4,
              status: 'PENDING',
              message: 'أنا مصور محترف وسأقدم لك صور عالية الجودة',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 5,
              requestId: 2,
              providerId: 5,
              proposedPrice: 190,
              proposedDays: 6,
              status: 'REJECTED',
              message: 'يمكنني تقديم تصميم احترافي لمشروعك',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        });
      }, 800);
    });
  },

  // الحصول على عرضي لطلب معين
  async getMyOfferForRequest(requestId: number): Promise<ApiResponse<Offer>> {
    // محاكاة طلب الحصول على عرضي
    return new Promise((resolve) => {
      setTimeout(() => {
        if (requestId === 1) {
          resolve({
            success: true,
            data: {
              id: 4,
              requestId: 1,
              providerId: 5,
              proposedPrice: 130,
              proposedDays: 4,
              status: 'PENDING',
              message: 'أنا مصور محترف وسأقدم لك صور عالية الجودة',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        } else if (requestId === 2) {
          resolve({
            success: true,
            data: {
              id: 5,
              requestId: 2,
              providerId: 5,
              proposedPrice: 190,
              proposedDays: 6,
              status: 'REJECTED',
              message: 'يمكنني تقديم تصميم احترافي لمشروعك',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        } else {
          resolve({
            success: false,
            message: 'لم تقم بتقديم عرض على هذا الطلب',
          });
        }
      }, 800);
    });
  },

  // إنشاء عرض جديد
  async createOffer(offerData: CreateOfferFormData): Promise<ApiResponse<Offer>> {
    // محاكاة إنشاء عرض جديد
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: Math.floor(Math.random() * 1000) + 10,
            requestId: offerData.requestId,
            providerId: 5,
            proposedPrice: typeof offerData.proposedPrice === 'string' ? parseFloat(offerData.proposedPrice) : offerData.proposedPrice,
            proposedDays: offerData.proposedDays,
            status: 'PENDING',
            message: offerData.message || offerData.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }, 800);
    });
  },

  // تحديث حالة العرض
  async updateOfferStatus(id: number, status: string): Promise<ApiResponse<Offer>> {
    // محاكاة تحديث حالة العرض
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id,
            requestId: 1,
            providerId: 2,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }, 800);
    });
  },

  // تحديث حالة العمل إلى مكتمل
  async markWorkAsCompleted(offerId: number): Promise<ApiResponse<Offer>> {
    // محاكاة تحديث حالة العمل
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: offerId,
            requestId: 2,
            providerId: 5,
            status: 'ACCEPTED',
            workSubmitted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }, 800);
    });
  },
}; 