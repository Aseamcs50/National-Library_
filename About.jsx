import { Eye, Target, ListChecks, ShieldCheck, BookOpen, Library, BadgeInfo, FileCheck, Globe, Search, Users, FileText } from 'lucide-react';

export default function About() {
  return (
    <main dir="rtl" className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with logo and official info */}
        <div className="bg-gradient-to-l from-green-50 to-white px-6 py-8 sm:px-8 sm:py-10 border-b border-green-100">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md bg-white p-2">
                <img src="/logo-library.jpeg" alt="المكتبة الوطنية السودانية" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-sm text-green-700 mb-1">جمهورية السودان</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                المكتبة الوطنية السودانية
              </h1>
              <p className="text-gray-600 max-w-xl">
                هيئة قومية مستقلة ذات شخصية اعتبارية
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <Library size={12} /> إيداع قانوني
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <Globe size={12} /> رقمنة المعرفة
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Vision & Mission side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="text-green-700" size={22} />
                <h2 className="text-xl font-bold text-gray-800">الرؤية</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                أن تكون المكتبة الوطنية السودانية مركزًا إشعاعًا للحضارة والثقافة السودانية،
                تحفظ وتوثق وتطور الإنتاج الفكري والأدبي والثقافي في السودان.
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-green-700" size={22} />
                <h2 className="text-xl font-bold text-gray-800">الرسالة</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                تقديم خدمات مكتبية ومعلوماتية متميزة، وجمع وتنظيم وحفظ الإنتاج الفكري السوداني،
                وإتاحته للباحثين والمهتمين.
              </p>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="text-green-700" size={22} />
              <h2 className="text-xl font-bold text-gray-800">الأهداف</h2>
            </div>
            <ul className="grid md:grid-cols-2 gap-3 list-disc pr-5 text-gray-700">
              <li>جمع وتنظيم وحفظ الإنتاج الفكري السوداني</li>
              <li>توفير مصادر المعلومات للباحثين</li>
              <li>الارتقاء بمستوى أداء العاملين في قطاع المكتبات</li>
            </ul>
          </div>

          {/* Competencies (اختصاصات) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-green-700" size={22} />
              <h2 className="text-xl font-bold text-gray-800">اختصاصات المكتبة الوطنية</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
              <ul className="list-disc pr-5 space-y-1">
                <li>توثيق وحفظ الإنتاج الفكري</li>
                <li>إصدار رقم الإيداع القانوني (ISBN)</li>
                <li>إصدار الرقم المعياري للدوريات (ISSN)</li>
                <li>توفير خدمات الفهرسة والتصنيف</li>
              </ul>
              <ul className="list-disc pr-5 space-y-1">
                <li>توثيق التراث الثقافي اللامادي</li>
                <li>تقديم الإعارة والاطلاع الداخلي</li>
                <li>توفير قواعد البيانات والمعلومات الرقمية</li>
                <li>التعاون مع المكتبات المحلية والدولية</li>
              </ul>
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-green-700" size={22} />
              <h2 className="text-xl font-bold text-gray-800">أهم الخدمات التي تقدمها المكتبة</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <FileCheck size={18} className="text-green-700" />
                <span className="text-sm">منح رقم الإيداع (ISBN)</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <FileText size={18} className="text-green-700" />
                <span className="text-sm">منح ISSN للدوريات</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Search size={18} className="text-green-700" />
                <span className="text-sm">البحث في قواعد البيانات</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Users size={18} className="text-green-700" />
                <span className="text-sm">إعارة واطلاع داخلي</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Globe size={18} className="text-green-700" />
                <span className="text-sm">خدمات رقمية ومعلوماتية</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Library size={18} className="text-green-700" />
                <span className="text-sm">توثيق التراث الثقافي</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
            المكتبة الوطنية السودانية – حفظ التراث، تمكين الباحثين، نشر الثقافة
          </div>
        </div>
      </div>
    </main>
  );
}