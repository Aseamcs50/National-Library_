import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { useRoles } from './contexts/RoleContext';
import Header from './components/Header';
import NewsTicker from './components/NewsTicker';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Editor from './pages/Editor';
import About from './pages/About';
import Admin from './pages/Admin';
import CategoryPage from './pages/CategoryPage';

// Native Google Sign-In handlers
if (typeof window !== 'undefined') {
  window.onNativeGoogleSignIn = async (idToken) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) console.error('Supabase sign-in error:', error);
      else window.location.href = '/';
    } catch (err) {
      console.error('Unexpected error during sign-in:', err);
    }
  };
  window.onNativeGoogleSignInError = (errorMessage) => {
    console.error('Native Google Sign-In failed:', errorMessage);
  };
}

function ProtectedRoute({ children }) {
  const { user, isEditor, loading } = useRoles();
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center py-20">جاري التحقق من الصلاحيات...</div>;
  }

  if (!user) {
    const handleSignIn = async () => {
      if (window.AndroidBridge && window.AndroidBridge.signInWithGoogle) {
        window.AndroidBridge.signInWithGoogle();
      } else {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/` }
        });
      }
    };
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">الوصول للمحرر فقط</h2>
        <p className="text-gray-600 mb-6">يرجى تسجيل الدخول للوصول إلى لوحة التحرير.</p>
        <button onClick={handleSignIn} className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800">تسجيل الدخول بواسطة جوجل</button>
      </div>
    );
  }

  if (!isEditor) {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/');
    };
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">⚠️ غير مصرح</h2>
          <p className="text-red-600 mb-4">حسابك ({user.email}) ليس لديه صلاحية المحرر.</p>
          <p className="text-sm text-gray-600 mb-6">إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول.</p>
          <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg">تسجيل الخروج</button>
        </div>
        <a href="/" className="text-green-700 hover:underline text-sm">العودة إلى الرئيسية ←</a>
      </div>
    );
  }

  return children;
}

function ProtectedAdminRoute({ children }) {
  const { isAdmin, loading } = useRoles();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !isAdmin) navigate('/');
  }, [isAdmin, loading, navigate]);
  if (loading) return <div className="text-center py-20">جاري التحقق...</div>;
  if (!isAdmin) return null;
  return children;
}

function AppContent() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: { fontFamily: "'Cairo', sans-serif", fontSize: '14px', direction: 'rtl' },
        }}
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        <Header />
        <NewsTicker />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
            {/* Category pages */}
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}