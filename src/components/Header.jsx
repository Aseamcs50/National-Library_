import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, LogIn, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useRoles } from '../contexts/RoleContext';
import { clearEditorCache } from '../lib/editorCheck';

const baseNavLinks = [
  { label: 'الرئيسية', to: '/' },
  { label: 'من نحن', to: '/about' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { isEditor, isAdmin, loading: rolesLoading } = useRoles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const dynamicNavLinks = [...baseNavLinks];
  if (!rolesLoading && isEditor) dynamicNavLinks.push({ label: 'المحرر', to: '/editor' });
  if (!rolesLoading && isAdmin) dynamicNavLinks.push({ label: 'المدير', to: '/admin' });

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
    setMenuOpen(false);
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
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-md">
              <img src="/logo-library-small.jpeg" alt="المكتبة الوطنية السودانية" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <span className="block text-lg font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Cairo', serif" }}>
                المكتبة الوطنية السودانية
              </span>
              <span className="block text-xs text-green-700 font-medium tracking-widest uppercase -mt-0.5">المعرفة للجميع</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {dynamicNavLinks.map(({ label, to }) => {
              const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
              return (
                <Link key={to} to={to} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-green-50 text-green-800 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                  {label}
                </Link>
              );
            })}
            {isLoggedIn ? (
              <button onClick={handleLogout} disabled={authLoading} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                <span>تسجيل الخروج</span>
              </button>
            ) : (
              <button onClick={handleLogin} disabled={authLoading} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-green-700 border border-green-700 hover:bg-green-50 transition-colors disabled:opacity-50">
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                <span>تسجيل الدخول</span>
              </button>
            )}
          </nav>

          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100" onClick={() => setMenuOpen(v => !v)} aria-label="القائمة">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1">
          {dynamicNavLinks.map(({ label, to }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={`block px-4 py-2.5 rounded-md text-sm font-medium ${active ? 'bg-green-50 text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                {label}
              </Link>
            );
          })}
          {isLoggedIn ? (
            <button onClick={handleLogout} disabled={authLoading} className="flex items-center gap-2 w-full text-right px-4 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              <span>تسجيل الخروج</span>
            </button>
          ) : (
            <button onClick={handleLogin} disabled={authLoading} className="flex items-center gap-2 w-full text-right px-4 py-2.5 rounded-md text-sm font-medium text-green-700 border border-green-700 hover:bg-green-50 transition-colors disabled:opacity-50">
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}