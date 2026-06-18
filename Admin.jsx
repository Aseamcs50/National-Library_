import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getAllEditors, addEditor, deleteEditor, toggleAdminStatus } from '../lib/editorCheck';
import { useRoles } from '../contexts/RoleContext';
import { Trash2, Shield, ShieldOff, UserPlus, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Admin() {
  const { refreshRoles } = useRoles();
  const [editors, setEditors] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [isNewAdmin, setIsNewAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const openConfirmModal = (title, message, onConfirm) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const loadEditors = async () => {
    try {
      const data = await getAllEditors();
      setEditors(data);
    } catch (err) {
      toast.error('فشل تحميل قائمة المحررين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEditors();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('الرجاء إدخال بريد إلكتروني');
      return;
    }
    setSubmitting(true);
    try {
      await addEditor(newEmail.trim().toLowerCase(), isNewAdmin);
      toast.success('تم إضافة المحرر بنجاح');
      setNewEmail('');
      setIsNewAdmin(false);
      await loadEditors();
      await refreshRoles();
    } catch (err) {
      toast.error(err.message || 'فشل إضافة المحرر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (email) => {
    openConfirmModal(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف ${email}؟`,
      async () => {
        try {
          await deleteEditor(email);
          toast.success('تم حذف المحرر');
          await loadEditors();
          await refreshRoles();
        } catch (err) {
          toast.error('فشل الحذف');
        }
      }
    );
  };

  const handleToggleAdmin = async (email, currentIsAdmin) => {
    const newIsAdmin = !currentIsAdmin;
    const actionText = newIsAdmin ? 'ترقية إلى مدير' : 'إزالة صلاحية المدير';
    openConfirmModal(
      'تأكيد تغيير الصلاحية',
      `هل أنت متأكد من ${actionText} للمستخدم ${email}؟`,
      async () => {
        try {
          await toggleAdminStatus(email, newIsAdmin);
          toast.success(`تم ${newIsAdmin ? 'ترقية' : 'إزالة'} صلاحية المدير`);
          await loadEditors();
          await refreshRoles();
        } catch (err) {
          toast.error('فشل تغيير الصلاحية');
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="animate-spin inline-block text-primary-dark" size={32} />
      </div>
    );
  }

  return (
    <main dir="rtl" className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-primary-dark px-6 py-4">
          <h1 className="text-xl font-bold text-white">لوحة تحكم المدير</h1>
          <p className="text-primary-light text-sm">إدارة قائمة المحررين والصلاحيات</p>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus size={18} />
            إضافة محرر جديد
          </h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-dark focus:border-transparent"
              required
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isNewAdmin}
                onChange={(e) => setIsNewAdmin(e.target.checked)}
                className="accent-primary-dark"
              />
              مدير (يمكنه إدارة المحررين)
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-dark hover:bg-primary-dark text-white px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              إضافة
            </button>
          </form>
        </div>

        <div className="p-6">
          <h2 className="font-semibold text-gray-800 mb-4">قائمة المحررين الحاليين</h2>
          {editors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا يوجد محررون حتى الآن</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-700 text-sm">
                  <tr>
                    <th className="px-4 py-3">البريد الإلكتروني</th>
                    <th className="px-4 py-3">الصلاحية</th>
                    <th className="px-4 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {editors.map((editor) => (
                    <tr key={editor.email}>
                      <td className="px-4 py-3 text-sm">{editor.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${editor.is_admin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {editor.is_admin ? 'مدير' : 'محرر'}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleToggleAdmin(editor.email, editor.is_admin)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          title={editor.is_admin ? 'إزالة صلاحية المدير' : 'ترقية إلى مدير'}
                        >
                          {editor.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(editor.email)}
                          className="text-sm text-red-600 hover:text-red-800"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        type="confirm"
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        confirmText="نعم"
        cancelText="إلغاء"
      />
    </main>
  );
}