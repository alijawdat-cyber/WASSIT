import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('بدء عملية زرع البيانات الأولية...');
  
  // مسح البيانات الموجودة (اختياري)
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.withdrawalRequest.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.disputeReply.deleteMany(),
    prisma.providerDoc.deleteMany(),
    prisma.rating.deleteMany(),
    prisma.message.deleteMany(),
    prisma.dispute.deleteMany(),
    prisma.offer.deleteMany(),
    prisma.request.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  
  console.log('إنشاء الخدمات...');
  
  // إنشاء الخدمات المتاحة
  const services = await Promise.all([
    prisma.service.create({
      data: { name: 'تصوير فوتوغرافي' },
    }),
    prisma.service.create({
      data: { name: 'تصوير فيديو' },
    }),
    prisma.service.create({
      data: { name: 'تصميم جرافيك' },
    }),
    prisma.service.create({
      data: { name: 'كتابة محتوى' },
    }),
    prisma.service.create({
      data: { name: 'إدارة سوشيال ميديا' },
    }),
    prisma.service.create({
      data: { name: 'تصميم هوية بصرية' },
    }),
    prisma.service.create({
      data: { name: 'برمجة وتطوير مواقع' },
    }),
  ]);
  
  console.log(`تم إنشاء ${services.length} خدمات`);
  
  console.log('إنشاء المستخدمين...');
  
  // كلمة المرور الموحدة للجميع: Password123
  const hashedPassword = await bcrypt.hash('Password123', 10);
  
  // إنشاء حساب المشرف
  const admin = await prisma.user.create({
    data: {
      name: 'أحمد المشرف',
      email: 'admin@wassit.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '07700000001',
      city: 'بغداد',
    },
  });
  
  // إنشاء حسابات العملاء
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        name: 'مطعم بيت الملوك',
        email: 'kings@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        phone: '07700000002',
        city: 'بغداد',
      },
    }),
    prisma.user.create({
      data: {
        name: 'صالون ليالي',
        email: 'layali@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        phone: '07700000003',
        city: 'بغداد',
      },
    }),
    prisma.user.create({
      data: {
        name: 'مكتبة دجلة',
        email: 'dijla@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        phone: '07700000004',
        city: 'البصرة',
      },
    }),
    prisma.user.create({
      data: {
        name: 'صيدلية الشفاء',
        email: 'shifa@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        phone: '07700000005',
        city: 'الموصل',
      },
    }),
    prisma.user.create({
      data: {
        name: 'كافيه النخيل',
        email: 'nakheel@example.com',
        password: hashedPassword,
        role: 'CLIENT',
        phone: '07700000006',
        city: 'أربيل',
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${clients.length} عملاء`);
  
  // إنشاء حسابات مقدمي الخدمات
  const providers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'علي المصور',
        email: 'ali@example.com',
        password: hashedPassword,
        role: 'PROVIDER',
        phone: '07700000007',
        city: 'بغداد',
      },
    }),
    prisma.user.create({
      data: {
        name: 'فاطمة المصممة',
        email: 'fatima@example.com',
        password: hashedPassword,
        role: 'PROVIDER',
        phone: '07700000008',
        city: 'بغداد',
      },
    }),
    prisma.user.create({
      data: {
        name: 'حسين كاتب المحتوى',
        email: 'hussein@example.com',
        password: hashedPassword,
        role: 'PROVIDER',
        phone: '07700000009',
        city: 'البصرة',
      },
    }),
    prisma.user.create({
      data: {
        name: 'زينب مديرة السوشيال ميديا',
        email: 'zainab@example.com',
        password: hashedPassword,
        role: 'PROVIDER',
        phone: '07700000010',
        city: 'النجف',
      },
    }),
    prisma.user.create({
      data: {
        name: 'محمد المبرمج',
        email: 'mohammed@example.com',
        password: hashedPassword,
        role: 'PROVIDER',
        phone: '07700000011',
        city: 'كربلاء',
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${providers.length} مقدمي خدمة`);
  
  // إضافة وثائق لمقدمي الخدمات
  const providerDocs = await Promise.all([
    prisma.providerDoc.create({
      data: {
        userId: providers[0].id,
        docURL: 'https://example.com/docs/ali-portfolio.pdf',
        verified: true,
      },
    }),
    prisma.providerDoc.create({
      data: {
        userId: providers[1].id,
        docURL: 'https://example.com/docs/fatima-portfolio.pdf',
        verified: true,
      },
    }),
    prisma.providerDoc.create({
      data: {
        userId: providers[2].id,
        docURL: 'https://example.com/docs/hussein-samples.pdf',
        verified: true,
      },
    }),
    prisma.providerDoc.create({
      data: {
        userId: providers[3].id,
        docURL: 'https://example.com/docs/zainab-portfolio.pdf',
        verified: true,
      },
    }),
    prisma.providerDoc.create({
      data: {
        userId: providers[4].id,
        docURL: 'https://example.com/docs/mohammed-projects.pdf',
        verified: true,
      },
    }),
  ]);
  
  console.log(`تم إضافة ${providerDocs.length} وثائق لمقدمي الخدمة`);
  
  // إنشاء طلبات من العملاء
  const requests = await Promise.all([
    prisma.request.create({
      data: {
        clientId: clients[0].id,
        serviceId: services[0].id, // تصوير فوتوغرافي
        description: 'نحتاج إلى تصوير فوتوغرافي احترافي لقائمة طعام مطعمنا الجديدة مع التركيز على الأطباق العراقية التقليدية. نريد صور عالية الجودة تظهر تفاصيل الطعام بشكل جذاب.',
        budget: 150.00,
        status: 'OPEN',
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[1].id,
        serviceId: services[2].id, // تصميم جرافيك
        description: 'مطلوب تصميم شعار جديد لصالون التجميل الخاص بنا مع هوية بصرية كاملة تشمل بطاقات العمل والأوراق الرسمية. نريد تصميم عصري يعكس الذوق العراقي الأصيل.',
        budget: 200.00,
        status: 'OPEN',
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[2].id,
        serviceId: services[3].id, // كتابة محتوى
        description: 'نحتاج إلى كتابة محتوى لموقعنا الإلكتروني الجديد لمكتبة دجلة. المحتوى يشمل صفحة عن تاريخ المكتبة وأقسامها المختلفة والخدمات التي نقدمها للقراء والباحثين.',
        budget: 120.00,
        status: 'OPEN',
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[3].id,
        serviceId: services[4].id, // إدارة سوشيال ميديا
        description: 'تبحث صيدلية الشفاء عن شخص لإدارة حساباتنا على منصات التواصل الاجتماعي (فيسبوك وانستغرام) لمدة شهر كامل. المطلوب نشر محتوى توعوي صحي يومي وإدارة التعليقات والرسائل.',
        budget: 300.00,
        status: 'IN_PROGRESS',
        escrowAmount: 280.00,
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[4].id,
        serviceId: services[1].id, // تصوير فيديو
        description: 'نحتاج إلى تصوير فيديو قصير ترويجي لكافيه النخيل يظهر أجواء المكان والمشروبات المميزة التي نقدمها. مدة الفيديو المطلوبة حوالي دقيقة واحدة مناسبة للنشر على انستغرام.',
        budget: 250.00,
        status: 'COMPLETED',
        escrowAmount: 240.00,
      },
    }),
    prisma.request.create({
      data: {
        clientId: clients[1].id,
        serviceId: services[6].id, // برمجة وتطوير مواقع
        description: 'نحتاج إلى تطوير موقع إلكتروني بسيط لصالون التجميل الخاص بنا. يجب أن يكون الموقع متوافقًا مع الهواتف المحمولة ويحتوي على صفحة رئيسية وصفحة خدمات وصفحة اتصل بنا.',
        budget: 500.00,
        status: 'DISPUTE',
        escrowAmount: 450.00,
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${requests.length} طلبات`);
  
  // إنشاء عروض من مقدمي الخدمات
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        requestId: requests[0].id,
        providerId: providers[0].id, // علي المصور
        proposedPrice: 130.00,
        proposedDays: 3,
        status: 'PENDING',
      },
    }),
    prisma.offer.create({
      data: {
        requestId: requests[1].id,
        providerId: providers[1].id, // فاطمة المصممة
        proposedPrice: 180.00,
        proposedDays: 5,
        status: 'PENDING',
      },
    }),
    prisma.offer.create({
      data: {
        requestId: requests[2].id,
        providerId: providers[2].id, // حسين كاتب المحتوى
        proposedPrice: 100.00,
        proposedDays: 4,
        status: 'PENDING',
      },
    }),
    prisma.offer.create({
      data: {
        requestId: requests[3].id,
        providerId: providers[3].id, // زينب مديرة السوشيال ميديا
        proposedPrice: 280.00,
        finalPrice: 300.00,
        proposedDays: 30,
        status: 'ACCEPTED',
      },
    }),
    prisma.offer.create({
      data: {
        requestId: requests[4].id,
        providerId: providers[0].id, // علي المصور (للفيديو)
        proposedPrice: 240.00,
        finalPrice: 250.00,
        proposedDays: 7,
        status: 'ACCEPTED',
      },
    }),
    prisma.offer.create({
      data: {
        requestId: requests[5].id,
        providerId: providers[4].id, // محمد المبرمج
        proposedPrice: 450.00,
        finalPrice: 500.00,
        proposedDays: 15,
        status: 'ACCEPTED',
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${offers.length} عروض`);
  
  // إنشاء بعض الرسائل بين العملاء ومقدمي الخدمات
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        requestId: requests[0].id,
        fromUserId: providers[0].id,
        toUserId: clients[0].id,
        content: 'مرحباً، أنا مهتم بتنفيذ مشروع التصوير لمطعمكم. هل يمكن أن تخبرني المزيد عن عدد الأطباق التي تريدون تصويرها؟',
      },
    }),
    prisma.message.create({
      data: {
        requestId: requests[0].id,
        fromUserId: clients[0].id,
        toUserId: providers[0].id,
        content: 'أهلاً، نحن لدينا حوالي 15 طبق رئيسي و10 أطباق جانبية و8 حلويات نريد تصويرها جميعاً بجودة عالية.',
      },
    }),
    prisma.message.create({
      data: {
        requestId: requests[1].id,
        fromUserId: providers[1].id,
        toUserId: clients[1].id,
        content: 'مرحباً، شكراً لاهتمامكم بخدماتي. هل لديكم أي ألوان محددة أو أفكار أولية للشعار ترغبون في رؤيتها في التصميم؟',
      },
    }),
    prisma.message.create({
      data: {
        requestId: requests[1].id,
        fromUserId: clients[1].id,
        toUserId: providers[1].id,
        content: 'نعم، نفضل استخدام ألوان الذهبي والأرجواني لأنها تعكس فخامة صالوننا، ونود أن يكون الشعار بتصميم دائري يحتوي على اسم الصالون بالخط العربي الديواني.',
      },
    }),
    prisma.message.create({
      data: {
        requestId: requests[5].id,
        fromUserId: providers[4].id,
        toUserId: clients[1].id,
        content: 'لقد قمت بتطوير الصفحة الرئيسية للموقع وفق المتطلبات. هل يمكنك الاطلاع عليها وإبداء ملاحظاتك؟',
      },
    }),
    prisma.message.create({
      data: {
        requestId: requests[5].id,
        fromUserId: clients[1].id,
        toUserId: providers[4].id,
        content: 'لقد اطلعت على الصفحة ولكن أرى أن التصميم لا يتطابق مع ما اتفقنا عليه من ناحية الألوان. كما أن هناك مشكلة في عرض الصور على الموبايل.',
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${messages.length} رسائل`);
  
  // إنشاء تقييمات متبادلة بين العملاء ومقدمي الخدمات
  const ratings = await Promise.all([
    // تقييم العميل لمقدم الخدمة (مشروع تصوير فيديو مكتمل)
    prisma.rating.create({
      data: {
        fromUserId: clients[4].id, // كافيه النخيل
        toUserId: providers[0].id, // علي المصور
        requestId: requests[4].id, // طلب تصوير فيديو
        score: 5,
        comment: 'ممتاز جداً! علي قام بتصوير فيديو احترافي وبجودة عالية، وكان التعامل معه رائعاً ومريحاً. سأتعامل معه مرة أخرى بالتأكيد.',
      },
    }),
    // تقييم مقدم الخدمة للعميل (مشروع تصوير فيديو مكتمل)
    prisma.rating.create({
      data: {
        fromUserId: providers[0].id, // علي المصور
        toUserId: clients[4].id, // كافيه النخيل
        requestId: requests[4].id, // طلب تصوير فيديو
        score: 4,
        comment: 'كان التعامل مع كافيه النخيل جيداً، وقدموا التسهيلات المطلوبة للتصوير. المتطلبات كانت واضحة والدفع تم في الوقت المناسب.',
      },
    }),
    // تقييم العميل لمقدم الخدمة (مشروع إدارة السوشيال ميديا - جاري التنفيذ)
    prisma.rating.create({
      data: {
        fromUserId: clients[3].id, // صيدلية الشفاء
        toUserId: providers[3].id, // زينب مديرة السوشيال ميديا
        requestId: requests[3].id, // طلب إدارة السوشيال ميديا
        score: 4,
        comment: 'زينب تقوم بعمل ممتاز في إدارة صفحاتنا على السوشيال ميديا، المنشورات التوعوية التي تقدمها محترفة وتفاعل الجمهور معها جيد.',
      },
    }),
    // تقييم لمشروع سابق لمقدم الخدمة حسين
    prisma.rating.create({
      data: {
        fromUserId: clients[2].id, // مكتبة دجلة
        toUserId: providers[2].id, // حسين كاتب المحتوى
        requestId: requests[2].id, // طلب كتابة محتوى
        score: 3,
        comment: 'المحتوى الذي قدمه حسين كان جيداً ولكن تأخر قليلاً في التسليم. هناك بعض الملاحظات البسيطة على جودة المحتوى ولكنه بشكل عام مقبول.',
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${ratings.length} تقييمات`);
  
  // إنشاء نزاع متعلق بطلب تطوير موقع إلكتروني
  const disputes = await Promise.all([
    prisma.dispute.create({
      data: {
        requestId: requests[5].id, // طلب تطوير موقع إلكتروني لصالون ليالي
        clientId: clients[1].id, // صالون ليالي
        providerId: providers[4].id, // محمد المبرمج
        reason: 'المطور لم يلتزم بالمواصفات المتفق عليها في التصميم، وهناك مشكلات في توافق الموقع مع الأجهزة المحمولة. كما أن التسليم تأخر عن الموعد المحدد بأسبوع كامل.',
        status: 'OPEN',
      },
    }),
    prisma.dispute.create({
      data: {
        requestId: requests[3].id, // طلب إدارة السوشيال ميديا
        clientId: clients[3].id, // صيدلية الشفاء
        providerId: providers[3].id, // زينب مديرة السوشيال ميديا
        reason: 'مديرة السوشيال ميديا لم تنشر المحتوى اليومي خلال الأسبوع الماضي كما هو متفق عليه، وهناك تأخير كبير في الرد على تعليقات الزبائن.',
        status: 'IN_REVIEW',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // قبل 5 أيام
      },
    }),
    prisma.dispute.create({
      data: {
        requestId: requests[4].id, // طلب تصوير فيديو
        clientId: clients[4].id, // كافيه النخيل
        providerId: providers[0].id, // علي المصور
        reason: 'جودة الفيديو المسلم أقل من المتوقع وهناك مشاكل في الصوت، نحتاج إلى تحسينات إضافية.',
        status: 'RESOLVED_PROVIDER',
        resolution: 'بعد مراجعة الفيديو، تبين أن جودة العمل تتوافق مع المعايير المتفق عليها، وأن مشكلة الصوت كانت بسبب الأجهزة المستخدمة من قبل العميل.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // قبل 10 أيام
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // تم الحل قبل 7 أيام
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${disputes.length} نزاعات`);
  
  // إضافة ردود على النزاعات
  const disputeReplies = await Promise.all([
    // ردود على النزاع الأول (تطوير موقع إلكتروني)
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[0].id,
        userId: providers[4].id, // محمد المبرمج
        content: 'أود توضيح أن التأخير كان بسبب التغييرات المتكررة في المتطلبات من قبل العميل. وفيما يتعلق بمشكلة توافق الموقع، فأنا على استعداد لإصلاحها خلال يومين.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // قبل يوم
      },
    }),
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[0].id,
        userId: clients[1].id, // صالون ليالي
        content: 'لم يكن هناك أي تغيير في المتطلبات منذ البداية، وقد تم الاتفاق بوضوح على أن يكون الموقع متوافقًا مع الأجهزة المحمولة. هذه مشكلة أساسية وليست ثانوية.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // قبل 12 ساعة
      },
    }),
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[0].id,
        userId: admin.id, // المشرف
        content: 'بعد الاطلاع على المحادثات والمتطلبات المتفق عليها، أقترح منح المطور فرصة 3 أيام لإصلاح مشكلة التوافق مع الأجهزة المحمولة. سنعيد تقييم الموقع بعد ذلك.',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // قبل 6 ساعات
      },
    }),
    
    // ردود على النزاع الثاني (إدارة السوشيال ميديا)
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[1].id,
        userId: providers[3].id, // زينب مديرة السوشيال ميديا
        content: 'أعتذر عن التأخير، لقد مررت بظروف صحية خلال الأسبوع الماضي وقد أرسلت إشعارًا بذلك. أنا الآن على استعداد لتعويض المحتوى المتأخر وزيادة عدد المنشورات الأسبوعية.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // قبل 4 أيام
      },
    }),
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[1].id,
        userId: admin.id, // المشرف
        content: 'تم التحقق من الإشعار المرسل، وبالفعل كان هناك إبلاغ بالتأخير. سنقوم بمتابعة الأداء خلال الأسبوع القادم وتقييم التعويض المقترح من مديرة السوشيال ميديا.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // قبل 3 أيام
      },
    }),
    
    // ردود على النزاع الثالث (تصوير فيديو)
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[2].id,
        userId: providers[0].id, // علي المصور
        content: 'جودة الفيديو تتوافق تمامًا مع المعايير المتفق عليها، والمشكلة في الصوت ناتجة عن مشكلة في أجهزة العرض المستخدمة. يمكنني التحقق من ذلك عبر مقارنة الملف الأصلي.',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // قبل 9 أيام
      },
    }),
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[2].id,
        userId: clients[4].id, // كافيه النخيل
        content: 'بعد مراجعة الفيديو على أجهزة أخرى، تبين أن المشكلة فعلاً في جهاز العرض لدينا وليس في الفيديو نفسه. نعتذر عن الخطأ ونقبل تسليم العمل بالجودة الحالية.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // قبل 8 أيام
      },
    }),
    prisma.disputeReply.create({
      data: {
        disputeId: disputes[2].id,
        userId: admin.id, // المشرف
        content: 'بناءً على الاتفاق بين الطرفين، تم حل النزاع لصالح مقدم الخدمة. سيتم تحرير المبلغ المحجوز لمقدم الخدمة وإغلاق الطلب بحالة "مكتمل".',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // قبل 7 أيام
      },
    }),
  ]);
  
  console.log(`تم إنشاء ${disputeReplies.length} ردود على النزاعات`);
  
  // إنشاء محفظات للمستخدمين
  console.log('إنشاء محفظات للمستخدمين...');
  
  // إنشاء محفظة للمشرف
  const adminWallet = await prisma.wallet.create({
    data: {
      userId: admin.id,
      balance: 10000.00,
      availableBalance: 10000.00,
      currency: 'IQD',
      isActive: true,
    },
  });
  
  // إنشاء محفظات للعملاء
  const clientWallets = await Promise.all(
    clients.map(client => 
      prisma.wallet.create({
        data: {
          userId: client.id,
          balance: 1000.00,
          availableBalance: 1000.00,
          currency: 'IQD',
          isActive: true,
        },
      })
    )
  );
  
  // إنشاء محفظات لمقدمي الخدمات
  const providerWallets = await Promise.all(
    providers.map(provider => 
      prisma.wallet.create({
        data: {
          userId: provider.id,
          balance: 500.00,
          availableBalance: 500.00,
          currency: 'IQD',
          isActive: true,
        },
      })
    )
  );
  
  console.log(`تم إنشاء ${1 + clientWallets.length + providerWallets.length} محفظة`);
  
  // إنشاء بعض المعاملات المالية
  console.log('إنشاء معاملات مالية...');
  
  // معاملات إيداع للمستخدمين
  const transactions = [];
  
  // إيداعات للعملاء
  for (let i = 0; i < clients.length; i++) {
    transactions.push(
      await prisma.transaction.create({
        data: {
          userId: clients[i].id,
          walletId: clientWallets[i].id,
          type: 'DEPOSIT',
          amount: 1000.00,
          status: 'COMPLETED',
          description: 'إيداع أولي',
          reference: `DEP-${Date.now()}-${i}`,
        },
      })
    );
  }
  
  // إيداعات لمقدمي الخدمات
  for (let i = 0; i < providers.length; i++) {
    transactions.push(
      await prisma.transaction.create({
        data: {
          userId: providers[i].id,
          walletId: providerWallets[i].id,
          type: 'DEPOSIT',
          amount: 500.00,
          status: 'COMPLETED',
          description: 'إيداع أولي',
          reference: `DEP-${Date.now()}-${i+clients.length}`,
        },
      })
    );
  }
  
  // معاملات للطلبات النشطة
  // معاملة حجز لطلب إدارة السوشيال ميديا (IN_PROGRESS)
  transactions.push(
    await prisma.transaction.create({
      data: {
        userId: clients[3].id,
        walletId: clientWallets[3].id,
        type: 'ESCROW_HOLD',
        amount: 280.00,
        status: 'COMPLETED',
        requestId: requests[3].id,
        description: 'حجز مبلغ لطلب إدارة السوشيال ميديا',
        reference: `ESCROW-${Date.now()}-1`,
      },
    })
  );
  
  // معاملة تحرير لطلب تصوير فيديو (COMPLETED)
  transactions.push(
    await prisma.transaction.create({
      data: {
        userId: providers[0].id,
        walletId: providerWallets[0].id,
        type: 'ESCROW_RELEASE',
        amount: 240.00,
        status: 'COMPLETED',
        requestId: requests[4].id,
        offerId: offers[4].id,
        description: 'تحرير مبلغ لطلب تصوير فيديو',
        reference: `RELEASE-${Date.now()}-1`,
      },
    })
  );
  
  console.log(`تم إنشاء ${transactions.length} معاملة مالية`);
  
  // إنشاء طلب سحب واحد
  console.log('إنشاء طلبات سحب...');
  
  const withdrawalRequest = await prisma.withdrawalRequest.create({
    data: {
      userId: providers[0].id,
      amount: 100.00,
      status: 'PENDING',
      paymentMethod: 'زين كاش',
      paymentDetails: JSON.stringify({
        phoneNumber: '07700000007',
        name: 'علي المصور'
      }),
      notes: 'أول طلب سحب',
    },
  });
  
  console.log(`تم إنشاء ${1} طلب سحب`);
  
  // إنشاء إشعارات
  console.log('إنشاء إشعارات...');
  
  const notifications = [];
  
  // إشعارات للعملاء
  for (let i = 0; i < 3; i++) {
    notifications.push(
      await prisma.notification.create({
        data: {
          userId: clients[i].id,
          type: 'REQUEST_CREATED',
          title: 'تم إنشاء طلب جديد',
          message: `تم إنشاء طلبك بنجاح وهو متاح الآن لمقدمي الخدمات للاطلاع عليه.`,
          isRead: false,
          relatedId: requests[i].id,
          relatedType: 'request',
        },
      })
    );
  }
  
  // إشعارات لطلب إدارة السوشيال ميديا
  notifications.push(
    await prisma.notification.create({
      data: {
        userId: clients[3].id,
        type: 'OFFER_ACCEPTED',
        title: 'تم قبول العرض',
        message: `تم قبول عرض زينب مديرة السوشيال ميديا لطلبك.`,
        isRead: true,
        relatedId: offers[3].id,
        relatedType: 'offer',
      },
    })
  );
  
  notifications.push(
    await prisma.notification.create({
      data: {
        userId: providers[3].id,
        type: 'OFFER_ACCEPTED',
        title: 'تم قبول عرضك',
        message: `تم قبول عرضك من قِبل صيدلية الشفاء.`,
        isRead: true,
        relatedId: offers[3].id,
        relatedType: 'offer',
      },
    })
  );
  
  // إشعار للنزاع
  notifications.push(
    await prisma.notification.create({
      data: {
        userId: providers[4].id,
        type: 'DISPUTE_OPENED',
        title: 'تم فتح نزاع',
        message: `قام العميل بفتح نزاع في الطلب الخاص بتطوير موقع إلكتروني.`,
        isRead: false,
        relatedId: disputes[0].id,
        relatedType: 'dispute',
      },
    })
  );
  
  notifications.push(
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'DISPUTE_OPENED',
        title: 'تم فتح نزاع جديد',
        message: `تم فتح نزاع جديد بين صالون ليالي ومحمد المبرمج.`,
        isRead: false,
        relatedId: disputes[0].id,
        relatedType: 'dispute',
      },
    })
  );
  
  console.log(`تم إنشاء ${notifications.length} إشعار`);
  
  console.log('تم الانتهاء من زرع البيانات بنجاح!');
}

main()
  .catch((error) => {
    console.error('حدث خطأ أثناء زرع البيانات:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 