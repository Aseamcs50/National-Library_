import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ArticleCard from '../components/ArticleCard';
import CategoryBadge from '../components/CategoryBadge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md border-0 animate-pulse">
    <div className="aspect-video bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  const [articlePage, setArticlePage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const ARTICLES_PER_PAGE = 9;

  useEffect(() => {
    document.title = categoryFilter
      ? `${categoryFilter} – المكتبة الوطنية السودانية`
      : 'المكتبة الوطنية السودانية';
  }, [categoryFilter]);

  const fetchData = async () => {
    setLoading(true);

    let countQuery = supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');
    if (categoryFilter) countQuery = countQuery.eq('category', categoryFilter);
    const { count } = await countQuery;
    setTotalArticles(count || 0);

    let articlesQuery = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('publish_date', { ascending: false });
    if (categoryFilter) articlesQuery = articlesQuery.eq('category', categoryFilter);

    const from = (articlePage - 1) * ARTICLES_PER_PAGE;
    const to = from + ARTICLES_PER_PAGE - 1;
    const { data: articlesData, error: articlesError } = await articlesQuery.range(from, to);

    if (!articlesError && articlesData) {
      setArticles(articlesData);
      const featuredArticle = articlesData.find(a => a.featured === true) || articlesData[0];
      setFeatured(featuredArticle);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, articlePage]);

  const handleFeaturedClick = () => {
    if (featured) navigate(`/article/${featured.slug}`);
  };

  const gridArticles = articles.filter(a => a.id !== featured?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {categoryFilter && (
        <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-3">
          <span className="text-sm text-gray-700">
            تصفية حسب: <strong className="font-bold">{categoryFilter}</strong>
          </span>
          <Link to="/" className="text-xs font-semibold text-green-700 hover:underline">
            إلغاء التصفية ← عرض الكل
          </Link>
        </div>
      )}

      {loading ? (
        <section className="mb-12">
          <div className="relative rounded-2xl overflow-hidden shadow-lg animate-pulse min-h-[250px] sm:min-h-[350px] md:min-h-[420px]">
            <div className="absolute inset-0 bg-gray-300" />
            <div className="absolute bottom-0 left-0 right-0 p-10 space-y-3">
              <div className="h-6 bg-gray-500 rounded w-1/4" />
              <div className="h-10 bg-gray-500 rounded w-3/4" />
              <div className="h-5 bg-gray-500 rounded w-1/2" />
            </div>
          </div>
        </section>
      ) : featured && (
        <section className="mb-12">
          <div
            onClick={handleFeaturedClick}
            className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
            style={{ minHeight: '420px' }}
          >
            <img
              src={featured.image_url || 'https://placehold.co/1200x600'}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-3">
                <CategoryBadge category={featured.category} size="lg" />
                <time className="text-gray-200 text-sm flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(featured.publish_date)}
                </time>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-3 max-w-3xl font-serif">
                {featured.title}
              </h1>
              <p className="text-gray-200 text-base leading-relaxed max-w-2xl line-clamp-2 hidden sm:block">
                {featured.excerpt}
              </p>
              <div className="mt-5">
                <span className="inline-block text-white border-2 border-white hover:bg-white hover:text-green-800 text-sm font-semibold px-5 py-2 rounded-full transition-colors">
                  اقرأ القصة ←
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">أحدث المنشورات</h2>
          {loading && <Loader2 size={20} className="animate-spin text-green-700" />}
          <div className="h-0.5 flex-1 mx-4 bg-gradient-to-r from-green-600 to-transparent" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map(article => <ArticleCard key={article.id} article={article} />)}
            </div>
            {totalArticles > ARTICLES_PER_PAGE && (
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={() => setArticlePage(p => Math.max(1, p - 1))} disabled={articlePage === 1} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">→ السابق</button>
                <span className="px-4 py-2 text-gray-600">صفحة {articlePage} من {Math.ceil(totalArticles / ARTICLES_PER_PAGE)}</span>
                <button onClick={() => setArticlePage(p => p + 1)} disabled={articlePage * ARTICLES_PER_PAGE >= totalArticles} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">التالي ←</button>
              </div>  
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">لا توجد مقالات منشورة بعد. تابعونا قريباً!</div>
        )}
      </section>

      {/* Category Cards Section */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">أقسام المكتبة</h2>
          <div className="h-0.5 flex-1 mx-4 bg-gradient-to-r from-green-600 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { name: 'كتب مختارة', slug: 'selected-books', icon: '📚', desc: 'أهم الإصدارات الأدبية والعلمية' },
            { name: 'إصدارات جديدة', slug: 'new-releases', icon: '🆕', desc: 'آخر ما صدر عن المكتبة' },
            { name: 'أنشطة ثقافية', slug: 'cultural-activities', icon: '🎭', desc: 'فعاليات وبرامج ثقافية' },
            { name: 'زيارات', slug: 'visits', icon: '👥', desc: 'استقبال الوفود والزوار' },
            { name: 'منتديات', slug: 'forums', icon: '💬', desc: 'ندوات وحوارات فكرية' },
            { name: 'ورش', slug: 'workshops', icon: '🔧', desc: 'دورات تدريبية وورش عمل' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="block bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="h-2 bg-green-600" />
              <div className="p-5 text-center">
                <div className="text-4xl mb-2">{cat.icon}</div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
                <div className="mt-3 text-green-700 text-sm font-semibold group-hover:underline">
                  استعرض المحتوى ←
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}