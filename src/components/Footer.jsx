import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useRoles } from '../contexts/RoleContext';
import { clearEditorCache } from '../lib/editorCheck';
import { LogOut, LogIn, Loader2, Phone, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const { isEditor, isAdmin } = useRoles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearEditorCache();
      navigate('/');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تسجيل الخروج. حاول مرة أخرى.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      if (window.AndroidBridge && window.AndroidBridge.signInWithGoogle) {
        window.AndroidBridge.signInWithGoogle();
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/` }
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      toast.error('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setAuthLoading(false);
    }
  };

  const getNavLinks = () => [
    { label: 'الرئيسية', to: '/' },
    { label: 'من نحن', to: '/about' },
  ];

  const libraryCategories = [
    { name: 'كتب مختارة', slug: 'selected-books' },
    { name: 'إصدارات جديدة', slug: 'new-releases' },
    { name: 'أنشطة ثقافية', slug: 'cultural-activities' },
    { name: 'زيارات', slug: 'visits' },
    { name: 'منتديات', slug: 'forums' },
    { name: 'ورش', slug: 'workshops' },
  ];

  return (
    <footer className="bg-green-700 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-white p-0.5">
                <img src="/logo-library-small.jpeg" alt="المكتبة الوطنية السودانية" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-base">المكتبة الوطنية السودانية</span>
            </div>
            <p className="text-xs text-green-100 leading-relaxed">حفظ التراث، تمكين الباحثين، نشر الثقافة.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-1 text-sm">
              {getNavLinks().map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-green-100 hover:text-white transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider">الأقسام</h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {libraryCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="bg-green-600 text-white px-2 py-0.5 rounded-full hover:bg-green-500 transition-colors text-xs"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider">تواصل معنا</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-green-300" />
                <span className="text-green-100 text-xs">الأمين العام: 0912624069</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-green-300" />
                <a href="mailto:Natlib10@hotmail.com" className="text-green-100 hover:text-white transition-colors text-xs">Natlib10@hotmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <User size={12} className="text-green-300" />
                <span className="text-green-100 text-xs">مسؤول الإعلام: 0126973785</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-green-600 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-200">
          <span>© 2026 المكتبة الوطنية السودانية</span>
          <span className="text-green-300">إصدار 3.0</span>
        </div>

        <div className="mt-4 pt-4 border-t border-green-600 md:hidden">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              disabled={authLoading}
              className="flex items-center justify-center gap-2 w-full py-1.5 rounded-md text-sm font-medium text-red-200 border border-red-400/50 hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {authLoading ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              <span>تسجيل الخروج</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="flex items-center justify-center gap-2 w-full py-1.5 rounded-md text-sm font-medium bg-white text-green-800 hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {authLoading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}