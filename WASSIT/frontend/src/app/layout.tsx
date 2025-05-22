import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

// تحميل خط تجوال لدعم اللغة العربية
const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "وسّط | Wassit - منصة الوساطة للخدمات الإبداعية",
  description: "منصة وساطة رقمية تربط بين المشاريع ومقدمي خدمات التسويق والإعلام في العراق بطريقة آمنة وشفافة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
