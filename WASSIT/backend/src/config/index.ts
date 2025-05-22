import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  isProd: env === 'production',
  isDev: env === 'development',
  
  // تكوين الخادم
  server: {
    // المنفذ الافتراضي للخادم موحد على 4000
    port: process.env.PORT || 4000,
  },
  
  // تكوين قاعدة البيانات
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // تكوين JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'wassit-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // تكوين CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  // تكوين التحميل
  upload: {
    maxSize: 1024 * 1024 * 5, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  },
  
  otp: {
    expiresIn: process.env.OTP_EXPIRES_IN || '10m',
  },
};

export default config; 