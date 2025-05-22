# قائمة المهام والتطوير لمشروع "وسّط" WASSIT

## المكونات التي تم تطويرها
- [x] صفحة إدارة المستخدمين (UserList) - admin/users/page.tsx
- [x] صفحة إدارة الطلبات (RequestList) - admin/requests/page.tsx  
- [x] صفحة إدارة العروض (OfferList) - admin/offers/page.tsx
- [x] صفحة إدارة هوامش الربح (MarginManager) - admin/margins/page.tsx
- [x] صفحة إدارة طلبات السحب (WithdrawalRequestList) - admin/withdrawals/page.tsx
- [x] صفحة إدارة النزاعات (DisputeList) - admin/disputes/page.tsx
- [x] صفحة إدارة المعاملات المالية (TransactionList) - admin/transactions/page.tsx
- [x] مكون عرض رصيد المحفظة (WalletBalance) - components/payment/WalletBalance.tsx
- [x] مكون عرض سجل المعاملات (TransactionHistory) - components/payment/TransactionHistory.tsx
- [x] مكون نموذج طلب السحب (WithdrawalForm) - components/payment/WithdrawalForm.tsx
- [x] مكون نموذج الدفع (PaymentForm) - components/payment/PaymentForm.tsx
- [x] صفحة المحفظة الشخصية (wallet/page.tsx)
- [x] صفحة طلب سحب رصيد (wallet/withdraw/page.tsx)
- [x] صفحة الدفع لقبول عرض (offers/[id]/payment/page.tsx)
- [x] وظائف API للمدفوعات والمحفظة (lib/api.ts)
- [x] مساعد تنسيق التواريخ (lib/date-utils.ts)
- [x] تحسين توافقية مكونات التخطيط واستخدام AppLayout و DashboardLayout بشكل موحد

## المكونات المطلوب تطويرها
- [ ] صفحة إنشاء طلب خدمة (requests/new/page.tsx)
- [ ] صفحة تفاصيل طلب (requests/[id]/page.tsx)
- [ ] نموذج إنشاء عرض (components/offers/CreateOfferForm.tsx)
- [ ] مكون المحادثة بين الأطراف (components/chat/ChatInterface.tsx)
- [ ] مكون عرض سجل الأنشطة (components/activity/ActivityLog.tsx)
- [ ] مكون رفع وعرض الملفات (components/files/FileUploader.tsx)
- [ ] صفحة الملف الشخصي مع إمكانية التعديل (profile/page.tsx)
- [ ] صفحة إعدادات التطبيق (settings/page.tsx)
- [ ] صفحة تفاصيل النزاع (disputes/[id]/page.tsx)
- [ ] مكون الإشعارات (components/notifications/NotificationsPanel.tsx)
- [ ] مراجعة وتحسين أداء مكونات التخطيط
- [ ] تطوير نظام مكونات موحد للتعامل مع حالات التحميل والأخطاء

## تحسينات النظام المستقبلية
- [ ] تكامل بوابات الدفع المحلية
- [ ] نظام تقارير متقدم
- [ ] نظام الإشعارات الفورية
- [ ] واجهة تطبيق جوال متجاوبة
- [ ] تحسين أداء النظام وتقليل وقت التحميل
- [ ] تطوير API ذو أداء عالي
- [ ] تحسين تجربة المستخدم وسهولة التنقل
- [ ] تحسين الأنماط المشتركة (common patterns) للمكونات المتشابهة

## الأولويات الحالية
1. إنهاء تطوير جميع واجهات الإدارة والمستخدم الأساسية
2. التأكد من سلامة الأمان وإدارة المستخدمين
3. اختبار الوظائف الرئيسية والتأكد من اكتمالها
4. تحسين الأداء والذاكرة للمكونات الحالية
5. مواصلة تحسين توافقية مكونات التخطيط والصفحات

## ملاحظات المطور
- يجب الالتزام بنمط المكونات وهيكلة الملفات المتبعة
- استخدام Context API لإدارة الحالة العامة في التطبيق
- التأكد من دعم اللغة العربية في جميع الواجهات والتصميم من اليمين لليسار
- جميع النصوص يجب أن تكون باللغة العربية (اللهجة العراقية)
- استخدام AppLayout لإدارة التحقق من صلاحيات المستخدم موحد في جميع الصفحات
- استخدام DashboardLayout بشكل موحد في لوحات التحكم المختلفة

تم تحديث: 15/7/2025 