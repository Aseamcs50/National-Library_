import { useState, useEffect } from 'react';
import { Pencil, Trash2, PenLine, Eye, Save, Send, Plus, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import { useRoles } from '../contexts/RoleContext';

// Updated categories for library
const CATEGORIES = [
  'كتب مختارة',
  'إصدارات جديدة',
  'أنشطة ثقافية',
  'زيارات',
  'منتديات',
  'ورش'
];

const emptyForm = {
  title: '',
  content: '',
  excerpt: '',
  category: 'كتب مختارة', // default to first category
  status: 'draft',
  image_url: '',
  featured: false,
};

function formatDate(dateStr) {
  if (!dateStr) return 'غير محدد';
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const SkeletonArticleRow = () => (
  <div className="px-5 py-4 flex items-center gap-3 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded w-14" />
        <div className="h-5 bg-gray-200 rounded w-14" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

export default function Editor() {
  const [form, setForm] = useState(emptyForm);
  const [articles, setArticles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [originalPublishDate, setOriginalPublishDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const ARTICLES_PER_PAGE = 10;

  const [showAllArticles, setShowAllArticles] = useState(false);
  const { isAdmin } = useRoles();

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null,
    inputFields: [],
  });

  const [linkData, setLinkData] = useState({ url: '', text: '' });

  const openModal = ({ type, title, message, onConfirm, inputFields = [] }) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setModal(prev => ({ ...prev, isOpen: false }));
      },
      inputFields,
    });
  };

  const fetchArticles = async (uid, page = 1, search = '', all = false) => {
    if (!all && !uid) return;
    setLoading(true);

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' });

    if (!all) {
      query = query.eq('author_id', uid);
    }

    if (search.trim()) {
      query = query.ilike('title', `%${search}%`);
    }

    const from = (page - 1) * ARTICLES_PER_PAGE;
    const to = from + ARTICLES_PER_PAGE - 1;

    const { data, error, count } = await query
      .order('publish_date', { ascending: false, nullsFirst: false })
      .range(from, to);

    if (!error && data) {
      setArticles(data);
      setTotalArticles(count || 0);
    } else if (error) {
      console.error('Error fetching articles:', error);
      toast.error('فشل تحميل المقالات');
    }
    setLoading(false);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (showAllArticles) {
      fetchArticles(null, currentPage, searchTerm, true);
    } else if (userId) {
      fetchArticles(userId, currentPage, searchTerm, false);
    }
  }, [userId, currentPage, searchTerm, showAllArticles]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'العنوان مطلوب';
    if (!form.content.trim()) e.content = 'المحتوى مطلوب';
    if (!form.excerpt) e.excerpt = 'الملخص مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedImageTypes.includes(file.type)) {
      toast.error('نوع الصورة غير مدعوم. يرجى رفع JPG, PNG, أو WebP فقط.');
      return;
    }

    if (file.size > maxSizeBytes) {
      toast.error(`حجم الصورة يتجاوز ${maxSizeMB} MB. الرجاء اختيار صورة أصغر.`);
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `article-images/${fileName}`;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      toast.error('فشل رفع الصورة');
    } else {
      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      setForm(prev => ({ ...prev, image_url: publicUrl.publicUrl }));
    }
    setUploading(false);
  };

  const saveArticle = async (status) => {
    if (!validate()) return;

    const articleData = {
      title: form.title,
      content: form.content,
      excerpt: form.excerpt || form.content.slice(0, 160) + '...',
      category: form.category,
      status: status,
      image_url: form.image_url || null,
      featured: form.featured || false,
    };

    let result;
    if (editingId) {
      result = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editingId);
    } else {
      result = await supabase
        .from('articles')
        .insert([articleData]);
    }

    if (result.error) {
      console.error(result.error);
      toast.error('خطأ في حفظ المقال');
    } else {
      toast.success(`تم ${editingId ? 'تحديث' : 'إنشاء'} المقال بنجاح`);
      setForm(emptyForm);
      setEditingId(null);
      setOriginalPublishDate(null);
      if (showAllArticles) {
        fetchArticles(null, currentPage, searchTerm, true);
      } else if (userId) {
        fetchArticles(userId, currentPage, searchTerm, false);
      }
    }
  };

  const handleDelete = (article) => {
    openModal({
      type: 'confirm',
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف المقال "${article.title}"؟`,
      onConfirm: async () => {
        const { error } = await supabase.from('articles').delete().eq('id', article.id);
        if (error) toast.error('فشل الحذف');
        else {
          toast.success('تم حذف المقال');
          if (showAllArticles) {
            fetchArticles(null, currentPage, searchTerm, true);
          } else if (userId) {
            fetchArticles(userId, currentPage, searchTerm, false);
          }
        }
      },
    });
  };

  const handleInsertLink = () => {
    setLinkData({ url: '', text: '' });
    openModal({
      type: 'prompt',
      title: 'إدراج رابط',
      message: 'أدخل رابط URL والنص الذي سيظهر.',
      inputFields: [
        {
          label: 'رابط URL',
          placeholder: 'https://example.com',
          value: linkData.url,
          onChange: (val) => setLinkData(prev => ({ ...prev, url: val })),
        },
        {
          label: 'النص المعروض (اختياري)',
          placeholder: 'انقر هنا',
          value: linkData.text,
          onChange: (val) => setLinkData(prev => ({ ...prev, text: val })),
        },
      ],
      onConfirm: () => {
        if (!linkData.url) {
          toast.error('الرجاء إدخال رابط URL');
          return;
        }
        const linkText = linkData.text.trim() || linkData.url;
        const markdownLink = `[${linkText}](${linkData.url})`;
        const textarea = document.getElementById('article-content');
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = textarea.value.substring(0, start) + markdownLink + textarea.value.substring(end);
          setForm(prev => ({ ...prev, content: newContent }));
          setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + markdownLink.length;
          }, 0);
        }
      },
    });
  };

  const handleInsertHashtag = () => {
    const tag = prompt('أدخل الهاشتاج (بدون #):');
    if (!tag) return;
    const textarea = document.getElementById('article-content');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = textarea.value.substring(0, start) + `#${tag}` + textarea.value.substring(end);
      setForm(prev => ({ ...prev, content: newContent }));
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + tag.length + 1;
      }, 0);
    }
  };

  const handleEdit = (article) => {
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      category: article.category,
      status: article.status,
      image_url: article.image_url || '',
      featured: article.featured || false,
    });
    setEditingId(article.id);
    setOriginalPublishDate(article.publish_date || null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOriginalPublishDate(null);
    setErrors({});
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    },
  });

  return (
    <main dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shadow">
          <PenLine size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            لوحة التحرير
          </h1>
          <p className="text-sm text-gray-500">إنشاء وإدارة المحتوى الثقافي والعلمي</p>
        </div>
        {loading && <Loader2 size={20} className="animate-spin text-green-700 ml-2" />}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* النموذج */}
        <section className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil size={16} className="text-amber-600" />
                    <span className="font-semibold text-gray-800">تعديل المقال رقم {editingId}</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} className="text-green-700" />
                    <span className="font-semibold text-gray-800">محتوى جديد</span>
                  </>
                )}
              </div>
              {editingId && (
                <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700 underline">
                  إلغاء التعديل
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  العنوان <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="عنوان المحتوى..."
                  {...field('title')}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">التصنيف</label>
                  <select
                    {...field('category')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحالة</label>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {[
                      { value: 'draft', label: 'مسودة' },
                      { value: 'published', label: 'منشور' }
                    ].map(s => (
                      <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value={s.value}
                          checked={form.status === s.value}
                          onChange={() => setForm(prev => ({ ...prev, status: s.value }))}
                          className="accent-green-700"
                        />
                        <span className="text-sm text-gray-700">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar size={14} />
                  <span className="text-xs font-semibold">تاريخ النشر</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {(() => {
                    if (editingId && originalPublishDate) {
                      return formatDate(originalPublishDate);
                    }
                    if (!editingId && form.status === 'published') {
                      return 'سيتم تعيين تاريخ النشر تلقائياً عند الحفظ';
                    }
                    return 'غير منشور بعد';
                  })()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">صورة المحتوى</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {form.image_url && (
                  <img src={form.image_url} alt="معاينة" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
                {uploading && <p className="text-xs text-gray-400 mt-1">جاري الرفع...</p>}
                <p className="text-xs text-gray-400 mt-1">أو الصق الرابط أدناه</p>
                <input
                  type="url"
                  placeholder="https://..."
                  {...field('image_url')}
                  onBlur={(e) => {
                    const url = e.target.value;
                    if (url && !url.match(/^https?:\/\/.+\..+/)) {
                      toast.error('الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://');
                      setForm(prev => ({ ...prev, image_url: '' }));
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  الملخص <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="ملخص قصير (بحد أقصى 160 حرفًا)..."
                  {...field('excerpt')}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 ${errors.excerpt ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.excerpt && <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  المحتوى <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    🔗 إدراج رابط
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertHashtag}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    # إدراج هاشتاج
                  </button>
                </div>

                <textarea
                  id="article-content"
                  rows={10}
                  placeholder="اكتب محتوى المقال الكامل هنا... يمكنك استخدام Markdown: [رابط](url), **نص غامق**, *مائل*, #هاشتاج"
                  {...field('content')}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 resize-y ${errors.content ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  يدعم المحتوى صيغة Markdown: <strong>**غامق**</strong>، <em>*مائل*</em>، [رابط](https://example.com)، وقوائم، والهاشتاجات تتحول تلقائياً لروابط.
                </p>
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>

              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => saveArticle('draft')}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Save size={15} />
                  حفظ كمسودة
                </button>
                <button
                  onClick={() => saveArticle('published')}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow transition-colors"
                >
                  <Send size={15} />
                  نشر الآن
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* قائمة المحتويات */}
        <section className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-500" />
                <span className="font-semibold text-gray-800">
                  {showAllArticles ? 'جميع المحتويات' : 'محتوياتي'}
                </span>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2.5 py-0.5 font-semibold">
                {loading ? '-' : totalArticles}
              </span>
            </div>

            {isAdmin && (
              <div className="p-4 border-b border-gray-100 flex gap-2">
                <button
                  onClick={() => {
                    setShowAllArticles(false);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    !showAllArticles
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  محتوياتي
                </button>
                <button
                  onClick={() => {
                    setShowAllArticles(true);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    showAllArticles
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  جميع المحتويات
                </button>
              </div>
            )}

            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="ابحث في المحتويات (العنوان)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchTerm(searchInput);
                    setCurrentPage(1);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-700"
              />
              <button
                onClick={() => {
                  setSearchTerm(searchInput);
                  setCurrentPage(1);
                }}
                className="mt-2 text-xs bg-gray-100 px-3 py-1 rounded"
              >
                بحث
              </button>
            </div>

            <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonArticleRow key={i} />)
              ) : articles.length === 0 ? (
                <li className="px-5 py-8 text-center text-gray-500 text-sm">
                  لا توجد محتويات {showAllArticles ? '' : 'لك'} لعرضها
                </li>
              ) : (
                articles.map(article => (
                  <li key={article.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      {article.image_url && (
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img src={article.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CategoryBadge category={article.category} />
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${article.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}>
                            {article.status === 'published' ? 'منشور' : 'مسودة'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {article.status === 'published' && article.publish_date
                              ? formatDate(article.publish_date)
                              : 'غير منشور بعد'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(article)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(article)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {!loading && totalArticles > ARTICLES_PER_PAGE && (
              <div className="flex justify-between items-center p-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                >
                  → السابق
                </button>
                <span className="text-sm text-gray-500">
                  صفحة {currentPage} من {Math.ceil(totalArticles / ARTICLES_PER_PAGE)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * ARTICLES_PER_PAGE >= totalArticles}
                  className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                >
                  التالي ←
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        inputFields={modal.inputFields}
        confirmText={modal.type === 'confirm' ? 'نعم، حذف' : 'إدراج'}
        cancelText="إلغاء"
      />
    </main>
  );
}