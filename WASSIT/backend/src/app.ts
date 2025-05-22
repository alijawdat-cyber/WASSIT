import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// استيراد المسارات
import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import offerRoutes from './routes/offer.routes';
import adminRoutes from './routes/admin.routes';
import disputeRoutes from './routes/dispute.routes';
import disputeReplyRoutes from './routes/dispute-reply.routes';
import messageRoutes from './routes/message.routes';
import ratingRoutes from './routes/rating.routes';
import serviceRoutes from './routes/service.routes';
import providerDocRoutes from './routes/provider-doc.routes';
import notificationRoutes from './routes/notification.routes';
import walletRoutes from './routes/wallet.routes';
import withdrawalRoutes from './routes/withdrawal.routes';

// تهيئة متغيرات البيئة
dotenv.config();

// تهيئة Express
const app = express();
const port = process.env.PORT || 4000;
const prisma = new PrismaClient();

// الإعدادات الوسيطة (Middleware)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// تكوين CORS للسماح باتصالات من أي منفذ في localhost
app.use(cors({
  origin: (origin, callback) => {
    // السماح بالطلبات من أي منفذ في localhost والطلبات بدون origin
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('غير مسموح بالوصول بسبب سياسة CORS'));
    }
  },
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));

// المسارات الرئيسية
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/dispute-replies', disputeReplyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/provider-docs', providerDocRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

// مسار الاختبار
app.get('/', (req, res) => {
  res.json({
    message: 'مرحباً بك في API تطبيق وسّط!',
    status: 'تعمل بنجاح',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// التعامل مع المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود',
    data: null,
    errors: {
      path: req.path,
      method: req.method,
    },
  });
});

// التعامل مع الأخطاء
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('خطأ في الخادم:', err.stack);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
    data: null,
    errors: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${port}`);
  console.log(`🔗 رابط الوصول: http://localhost:${port}`);
  console.log(`🛢️  قاعدة البيانات متصلة`);
});

// التعامل مع إنهاء التطبيق
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('تم إغلاق اتصال قاعدة البيانات');
  process.exit(0);
});