'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function AboutPage() {
  // فريق العمل
  const team = [
    {
      name: 'محمد العراقي',
      role: 'مؤسس ومدير تنفيذي',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'زينب الموسوي',
      role: 'مديرة المشاريع',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'أحمد الحسن',
      role: 'مدير التكنولوجيا',
      image: 'https://randomuser.me/api/portraits/men/46.jpg',
    },
    {
      name: 'فاطمة عبد الله',
      role: 'مديرة التسويق',
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-background">
        {/* قسم الترويسة */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">من نحن</h1>
            <p className="max-w-3xl mx-auto text-xl opacity-90">
              منصة وسّط هي منصة وساطة رقمية متخصصة في ربط أصحاب المشاريع مع مقدمي الخدمات الإبداعية والتسويقية في العراق
            </p>
          </div>
        </section>

        {/* قسم القصة */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold mb-4">قصتنا</h2>
                <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              </div>

              <div className="prose prose-lg max-w-none">
                <p>
                  بدأت فكرة منصة "وسّط" في عام 2023، عندما لاحظنا وجود فجوة كبيرة في السوق العراقي بين أصحاب المشاريع الباحثين عن خدمات إبداعية وتسويقية عالية الجودة، ومقدمي هذه الخدمات الذين يبحثون عن فرص عمل مستقرة.
                </p>
                <p>
                  كانت المشكلة الأساسية التي واجهناها هي انعدام الثقة بين الطرفين، وصعوبة إيجاد الخدمة المناسبة بالسعر المناسب، بالإضافة إلى عدم وجود ضمانات كافية لكلا الطرفين.
                </p>
                <p>
                  من هنا انطلقت فكرة "وسّط" كنظام وساطة مبتكر يضمن حقوق جميع الأطراف، ويوفر بيئة آمنة للتعامل، مع الحفاظ على خصوصية التواصل والأسعار.
                </p>
                <p>
                  اليوم، نفخر بأن منصة "وسّط" أصبحت الوجهة المفضلة للعديد من الشركات والمشاريع العراقية للحصول على خدمات التصوير والتصميم وكتابة المحتوى وإدارة وسائل التواصل الاجتماعي بطريقة محترفة وآمنة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* قسم الرؤية والقيم */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold mb-4">رؤيتنا</h2>
                <div className="w-16 h-1 bg-primary mb-6"></div>
                <p className="text-gray-700 mb-6">
                  نطمح أن تصبح منصة "وسّط" المنصة الرائدة في مجال الوساطة الرقمية للخدمات الإبداعية والتسويقية في العراق والمنطقة، وأن نساهم في بناء سوق عمل حر ومنظم يعتمد على الكفاءة والجودة.
                </p>
                <p className="text-gray-700">
                  نسعى لخلق فرص عمل جديدة للشباب العراقي المبدع، وتوفير خدمات احترافية للشركات والمشاريع الناشئة بأسعار منافسة وجودة عالية.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">قيمنا</h2>
                <div className="w-16 h-1 bg-primary mb-6"></div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mt-0.5 me-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold">الشفافية والأمانة</h3>
                      <p className="text-gray-700">نؤمن بتقديم خدماتنا بشفافية مطلقة وأمانة تامة لضمان الثقة المتبادلة بين جميع الأطراف.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mt-0.5 me-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold">الجودة والاحترافية</h3>
                      <p className="text-gray-700">نسعى دائماً لضمان أعلى معايير الجودة في الخدمات المقدمة عبر منصتنا.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mt-0.5 me-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold">الإبداع والابتكار</h3>
                      <p className="text-gray-700">نؤمن بأهمية الإبداع والابتكار في تقديم حلول فريدة ومبتكرة للتحديات المختلفة.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mt-0.5 me-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold">المسؤولية والالتزام</h3>
                      <p className="text-gray-700">نلتزم بمسؤوليتنا تجاه جميع الأطراف، ونسعى دائماً لتقديم أفضل تجربة ممكنة.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* قسم فريق العمل */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">فريق العمل</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                نضم فريقاً من المحترفين ذوي الخبرة في مجالات متعددة لضمان تقديم أفضل خدمة ممكنة
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-primary">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* قسم اتصل بنا */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">تواصل معنا</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                نحن هنا للإجابة على استفساراتك ومساعدتك في الحصول على أفضل تجربة ممكنة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-primary mb-4 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
                <p className="text-gray-600">info@wassit.com</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-primary mb-4 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">الهاتف</h3>
                <p className="text-gray-600">+964 750 123 4567</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-primary mb-4 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">العنوان</h3>
                <p className="text-gray-600">بغداد، العراق</p>
              </div>
            </div>
          </div>
        </section>

        {/* قسم الاشتراك */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">انضم إلينا اليوم</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              سجل الآن واستفد من منصة وسّط لإيجاد أفضل الخدمات أو للوصول إلى عملاء جدد
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
                سجل الآن
              </Link>
              <Link href="/how-it-works" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary px-6 py-3 rounded-lg font-medium transition-colors">
                تعرف على المزيد
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
} 