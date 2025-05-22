// نوع الاستجابة العامة من API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// أدوار المستخدم
export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER'
}

// حالة الطلب
export enum RequestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  DISPUTE = 'DISPUTE'
}

// حالة العرض
export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

// أنواع الإشعارات
export enum NotificationType {
  REQUEST_CREATED = 'REQUEST_CREATED',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  WORK_SUBMITTED = 'WORK_SUBMITTED',
  WORK_APPROVED = 'WORK_APPROVED',
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  RATING_RECEIVED = 'RATING_RECEIVED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  SYSTEM = 'SYSTEM'
}

// حالة النزاع
export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED_CLIENT = 'RESOLVED_CLIENT', // الحكم لصالح العميل
  RESOLVED_PROVIDER = 'RESOLVED_PROVIDER', // الحكم لصالح مقدم الخدمة
  RESOLVED_PARTIAL = 'RESOLVED_PARTIAL', // تقسيم المبلغ
  CANCELED = 'CANCELED' // إلغاء النزاع
}

// نوع المعاملة
export enum TransactionType {
  DEPOSIT = 'DEPOSIT', // إيداع
  WITHDRAWAL = 'WITHDRAWAL', // سحب
  ESCROW_HOLD = 'ESCROW_HOLD', // حجز مبلغ
  ESCROW_RELEASE = 'ESCROW_RELEASE', // إطلاق مبلغ محجوز
  ESCROW_REFUND = 'ESCROW_REFUND', // إعادة مبلغ محجوز
  PLATFORM_FEE = 'PLATFORM_FEE', // رسوم المنصة
  DISPUTE_REFUND = 'DISPUTE_REFUND', // إعادة مبلغ بعد نزاع
  DISPUTE_RELEASE = 'DISPUTE_RELEASE' // إطلاق مبلغ بعد نزاع
}

// حالة المعاملة
export enum TransactionStatus {
  PENDING = 'PENDING', // معلقة
  COMPLETED = 'COMPLETED', // مكتملة
  FAILED = 'FAILED', // فاشلة
  CANCELED = 'CANCELED' // ملغاة
}

// نموذج المستخدم
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  city?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: Date;
}

// نموذج الخدمة
export interface Service {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// نموذج الطلب
export interface Request {
  id: number;
  clientId: number;
  serviceId: number;
  service?: Service;
  description: string;
  budget?: string;
  status: RequestStatus | string;
  escrowAmount?: string;
  createdAt: string;
  updatedAt: string;
  offers?: Offer[];
}

// نموذج العرض
export interface Offer {
  id: number;
  requestId: number;
  providerId: number;
  provider?: User;
  proposedPrice?: number;
  finalPrice?: number;
  proposedDays?: number;
  status: OfferStatus | string;
  message?: string;
  workSubmitted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// نموذج الرسالة
export interface Message {
  id: number;
  requestId: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: string;
}

// نموذج التقييم
export interface Rating {
  id: number;
  fromUserId: number;
  toUserId: number;
  requestId: number;
  score: number;
  comment?: string;
  createdAt: string;
}

// نموذج الإشعار
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  relatedId?: string;
  relatedType?: 'REQUEST' | 'OFFER' | 'DISPUTE' | 'TRANSACTION' | 'WITHDRAWAL';
  createdAt: Date;
}

// نموذج النزاع
export interface Dispute {
  id: number;
  requestId: number;
  offerId: number;
  clientId: number;
  providerId: number;
  initiatedBy: number; // معرف المستخدم الذي بدأ النزاع
  reason: string;
  status: DisputeStatus;
  adminNote?: string;
  resolution?: string;
  refundAmount?: number;
  refundPercentage?: number;
  createdAt: string;
  updatedAt: string;
  request?: Request;
  offer?: Offer;
  client?: User;
  provider?: User;
}

// نموذج رد على النزاع
export interface DisputeReply {
  id: number;
  disputeId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: User;
}

// نموذج المحفظة
export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalIncome: number;
  totalWithdrawn: number;
  updatedAt: Date;
}

// نموذج المعاملة
export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'COMMISSION';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  description: string;
  reference?: string;
  createdAt: Date;
}

// نموذج طلب سحب
export interface WithdrawalRequest {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'ZAIN_CASH' | 'CASH_PICKUP';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    phoneNumber?: string;
    address?: string;
  };
  createdAt: Date;
  processedAt?: Date;
}

// نوع استجابة تسجيل الدخول
export interface AuthResponse {
  user: User;
  token: string;
}

// نوع المرفقات
export interface Attachment {
  id: number;
  name: string;
  url: string;
  type?: string;
  size?: number;
}

// نوع بيانات التسجيل
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  phone?: string;
  city?: string;
}

// نوع بيانات تسجيل الدخول
export interface LoginFormData {
  email: string;
  password: string;
}

// نوع بيانات إنشاء طلب
export interface CreateRequestFormData {
  serviceId: number;
  description: string;
  budget?: string | number;
}

// نوع بيانات إنشاء عرض
export interface CreateOfferFormData {
  requestId: number;
  proposedPrice: string | number;
  proposedDays: number;
  message?: string;
  description?: string;
}

// نوع بيانات تحديث الملف الشخصي
export interface UpdateProfileFormData {
  name?: string;
  phone?: string;
  city?: string;
  email?: string;
}

// نوع بيانات تغيير كلمة المرور
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// نوع بيانات إنشاء تقييم
export interface CreateRatingFormData {
  toUserId: number;
  requestId: number;
  score: number; // 1-5
  comment?: string;
}

// نوع بيانات إنشاء نزاع
export interface CreateDisputeFormData {
  requestId: number;
  offerId: number;
  reason: string;
  attachments?: File[];
}

// نوع بيانات إضافة رد على نزاع
export interface CreateDisputeReplyFormData {
  disputeId: number;
  content: string;
  attachments?: File[];
}

// نوع بيانات قرار النزاع (للإدارة)
export interface ResolveDisputeFormData {
  disputeId: number;
  status: DisputeStatus;
  resolution: string;
  refundAmount?: number;
  refundPercentage?: number;
  adminNote?: string;
}

// نوع بيانات طلب السحب
export interface CreateWithdrawalFormData {
  amount: number;
  paymentMethod: string;
  paymentDetails: Record<string, any>;
  notes?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pageInfo: PageInfo;
} 