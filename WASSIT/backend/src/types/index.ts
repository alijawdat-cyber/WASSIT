// نحتاج إلى تعريف التعدادات (Enums) هنا بدلاً من استيرادها من @prisma/client
// لتجنب مشاكل التوافق مع TypeScript

export enum Role {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export enum RequestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  DISPUTE = 'DISPUTE'
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED_CLIENT = 'RESOLVED_CLIENT',
  RESOLVED_PROVIDER = 'RESOLVED_PROVIDER',
  RESOLVED_PARTIAL = 'RESOLVED_PARTIAL',
  CANCELED = 'CANCELED'
}

export enum NotificationType {
  REQUEST_CREATED = 'REQUEST_CREATED',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  WORK_SUBMITTED = 'WORK_SUBMITTED',
  WORK_APPROVED = 'WORK_APPROVED',
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  RATING_RECEIVED = 'RATING_RECEIVED',
  NEW_RATING = 'NEW_RATING',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  DISPUTE_REPLY = 'DISPUTE_REPLY',
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  SYSTEM = 'SYSTEM'
}

// إضافة تعدادات للمعاملات المالية
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  ESCROW_HOLD = 'ESCROW_HOLD',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  ESCROW_REFUND = 'ESCROW_REFUND',
  PLATFORM_FEE = 'PLATFORM_FEE',
  DISPUTE_REFUND = 'DISPUTE_REFUND',
  DISPUTE_RELEASE = 'DISPUTE_RELEASE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED'
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED'
}

// DTO للمستخدمين
export interface UserDTO {
  id: number;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  city?: string;
}

// DTO للخدمات
export interface ServiceDTO {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO للطلبات
export interface RequestDTO {
  id: number;
  clientId: number;
  client?: UserDTO;
  serviceId: number;
  service?: ServiceDTO;
  description: string;
  budget?: string | number; // لتتوافق مع Decimal في Prisma
  status: RequestStatus;
  escrowAmount?: string | number; // لتتوافق مع Decimal في Prisma
  createdAt: Date;
  updatedAt: Date;
  offers?: OfferDTO[];
}

export interface RequestCreateDTO {
  clientId: number;
  serviceId: number;
  description: string;
  budget?: string | number; // لتتوافق مع Decimal في Prisma
}

// DTO للعروض
export interface OfferDTO {
  id: number;
  requestId: number;
  request?: RequestDTO;
  providerId: number;
  provider?: UserDTO;
  proposedPrice?: string | number; // لتتوافق مع Decimal في Prisma
  finalPrice?: string | number; // لتتوافق مع Decimal في Prisma
  proposedDays?: number;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferCreateDTO {
  requestId: number;
  providerId: number;
  proposedPrice?: string | number; // لتتوافق مع Decimal في Prisma
  proposedDays?: number;
}

// DTO للرسائل
export interface MessageDTO {
  id: number;
  requestId: number;
  fromUserId: number;
  fromUser?: UserDTO;
  toUserId: number;
  toUser?: UserDTO;
  content: string;
  createdAt: Date;
}

export interface MessageCreateDTO {
  requestId: number;
  fromUserId: number;
  toUserId: number;
  content: string;
}

// DTO للتقييمات
export interface RatingDTO {
  id: number;
  fromUserId: number;
  fromUser?: UserDTO;
  toUserId: number;
  toUser?: UserDTO;
  requestId: number;
  request?: RequestDTO;
  score: number;
  comment?: string;
  createdAt: Date;
}

export interface RatingCreateDTO {
  fromUserId: number;
  toUserId: number;
  requestId: number;
  score: number;
  comment?: string;
}

// DTO للنزاعات
export interface DisputeDTO {
  id: number;
  requestId: number;
  request?: RequestDTO;
  clientId: number;
  client?: UserDTO;
  providerId: number;
  provider?: UserDTO;
  reason: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: DisputeReplyDTO[];
}

export interface DisputeCreateDTO {
  requestId: number;
  clientId: number;
  providerId: number;
  reason: string;
}

// DTO لردود النزاعات
export interface DisputeReplyDTO {
  id: number;
  disputeId: number;
  dispute?: DisputeDTO;
  userId: number;
  user?: UserDTO;
  content: string;
  attachments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeReplyCreateDTO {
  disputeId: number;
  userId: number;
  content: string;
  attachments?: string;
}

// DTO لوثائق مقدمي الخدمة
export interface ProviderDocDTO {
  id: number;
  userId: number;
  user?: UserDTO;
  docURL: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderDocCreateDTO {
  userId: number;
  docURL: string;
}

// أنواع الاستجابة
export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// أنواع لأغراض الأمان
export interface JwtPayload {
  userId: number;
  role: Role;
  email: string;
}

// أنواع للبحث والترشيح
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RequestFilterParams extends PaginationParams {
  status?: RequestStatus;
  serviceId?: number;
  city?: string;
}

// DTO للإشعارات
export interface NotificationDTO {
  id: number;
  userId: number;
  user?: UserDTO;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: number;
  relatedType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCreateDTO {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
}

// أنواع للبحث والترشيح
export interface NotificationFilterParams extends PaginationParams {
  isRead?: boolean;
  type?: NotificationType;
}

// DTO للمحفظة
export interface WalletDTO {
  id: number;
  userId: number;
  user?: UserDTO;
  balance: string | number;
  availableBalance: string | number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO للمعاملات
export interface TransactionDTO {
  id: number;
  userId: number;
  user?: UserDTO;
  walletId: number;
  wallet?: WalletDTO;
  type: TransactionType;
  amount: string | number;
  status: TransactionStatus;
  reference?: string;
  requestId?: number;
  request?: RequestDTO;
  offerId?: number;
  offer?: OfferDTO;
  disputeId?: number;
  dispute?: DisputeDTO;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCreateDTO {
  userId: number;
  walletId: number;
  type: TransactionType;
  amount: string | number;
  status?: TransactionStatus;
  reference?: string;
  requestId?: number;
  offerId?: number;
  disputeId?: number;
  description?: string;
  metadata?: any;
}

// DTO لطلب السحب
export interface WithdrawalRequestDTO {
  id: number;
  userId: number;
  user?: UserDTO;
  amount: string | number;
  status: WithdrawalStatus;
  paymentMethod: string;
  paymentDetails: any;
  notes?: string;
  adminNotes?: string;
  transactionId?: number;
  transaction?: TransactionDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithdrawalRequestCreateDTO {
  userId: number;
  amount: string | number;
  paymentMethod: string;
  paymentDetails: any;
  notes?: string;
}

// أنواع للبحث والترشيح
export interface TransactionFilterParams extends PaginationParams {
  userId?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface WithdrawalFilterParams extends PaginationParams {
  userId?: number;
  status?: WithdrawalStatus;
  startDate?: Date;
  endDate?: Date;
} 