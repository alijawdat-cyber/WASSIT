/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // إزالة إعدادات i18n غير المدعومة في App Router
  // i18n: {
  //   locales: ['ar'],
  //   defaultLocale: 'ar',
  //   localeDetection: false,
  // },
  // السماح بتحميل صور من مصادر خارجية
  images: {
    domains: ['placeholder.com', 'via.placeholder.com'],
  },
  // تكوين
  experimental: {
    // إزالة خيار optimizeCss الذي يسبب مشاكل
    // optimizeCss: true,
  },
};

export default nextConfig; 