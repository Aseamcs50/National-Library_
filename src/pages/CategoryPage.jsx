import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ArticleCard from '../components/ArticleCard';

// Map English slugs to Arabic category names
const slugToCategory = {
  'selected-books': 'كتب مختارة',
  'new-releases': 'إصدارات جديدة',
  'cultural-activities': 'أنشطة ثقافية',
  'visits': 'زيارات',
  'forums': 'منتديات',
  'workshops': 'ورش'
};

export default function CategoryPage() {
  const { slug } = useParams();
  const categoryName = slugToCategory[slug];

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const ARTICLES_PER_PAGE = 12;

  useEffect(() => {
    if (categoryName) {
      document.title = `${categoryName} – المكتبة الوطنية السودانية`;
    }
  }, [categoryName]);

  useEffect(() => {
    if (!categoryName) return;
    
    const fetchArticles = async () => {
      setLoading(true);
      const from = (page - 1) * ARTICLES_PER_PAGE;
      const to = from + ARTICLES_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .eq('category', categoryName)
        .order('publish_date', { ascending: false })
        .range(from, to);

      if (!error && data) {
        setArticles(data);
        setTotal(count || 0);
      }
      setLoading(false);
    };
    fetchArticles();
  }, [categoryName, page]);

  if (!categoryName) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-gray-500">القسم غير موجود</p>
        <Link to="/" className="text-green-700 mt-4 inline-block">العودة للرئيسية</Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 border-r-4 border-green-700 pr-3">
          {categoryName}
        </h1>
        <p className="text-gray-500 mt-2">جميع المحتويات المتعلقة بـ {categoryName}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-green-700" size={32} />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl">
          لا توجد محتويات في هذا القسم بعد.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {total > ARTICLES_PER_PAGE && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
              >
                → السابق
              </button>
              <span className="px-4 py-2 text-gray-600">
                صفحة {page} من {Math.ceil(total / ARTICLES_PER_PAGE)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * ARTICLES_PER_PAGE >= total}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
              >
                التالي ←
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}