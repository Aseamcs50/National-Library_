import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Loader2, UserCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';
import CategoryBadge from '../components/CategoryBadge';
import ShareBar from '../components/ShareBar';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('خطأ في جلب المقال:', error);
        setArticle(null);
      } else {
        setArticle(data);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (slug) fetchArticle();
  }, [slug]);

  let readingTime = null;
  if (article?.content) {
    const wordsPerMinute = 100;
    const wordCount = article.content.replace(/\s+/g, ' ').trim().split(' ').length;
    readingTime = Math.ceil(wordCount / wordsPerMinute);
  }

  const processedContent = article?.content
    ? article.content.replace(/(?<!\w)#([\u0600-\u06FFa-zA-Z0-9_]+)/g, (_, tag) => `[#${tag}](/search?tag=${tag})`)
    : '';

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
        <div className="flex gap-4 mb-4">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
        <div className="aspect-video bg-gray-200 rounded-2xl mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-11/12" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-gray-500 text-lg mb-6">المقال غير موجود.</p>
        <Link to="/" className="text-primary-dark font-semibold hover:underline">← العودة للرئيسية</Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-light text-sm font-medium mb-6 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:translate-x-0.5 transition-transform" />
        العودة للرئيسية
      </button>

      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <CategoryBadge category={article.category} size="lg" />
          <time className="flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar size={15} />
            {formatDate(article.publish_date)}
          </time>
          {readingTime && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={15} />
              {readingTime} دقيقة قراءة
            </span>
          )}
        </div>
        <h1
          className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5 font-serif"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {article.title}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed border-r-4 border-primary-light pr-5">
          {article.excerpt}
        </p>
      </header>

      <div className="rounded-2xl overflow-hidden mb-8 shadow-md aspect-video bg-gray-100">
        <img
          src={article.image_url || 'https://placehold.co/1200x600'}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <article className="prose max-w-none prose-headings:font-bold prose-a:text-primary-dark prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => {
              const isInternal = href?.startsWith('/');
              return isInternal ? (
                <Link to={href} className="text-primary-dark hover:underline">
                  {children}
                </Link>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-dark hover:underline"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
        {article.author_name && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 flex items-center gap-2">
            <UserCircle size={18} />
            <span>بقلم: <strong className="text-gray-700">{article.author_name}</strong></span>
          </div>
        )}
      </article>

      <div className="mt-12 pt-8 border-t border-primary-muted flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Tag size={14} />
          <span>القسم: <span className="font-semibold text-gray-700">{article.category}</span></span>
        </div>
        <Link to="/" className="flex items-center gap-2 text-primary-dark font-semibold text-sm hover:underline">
          <ArrowLeft size={15} />
          العودة للرئيسية
        </Link>
      </div>

      <ShareBar title={article.title} articleSlug={article.slug} />
    </main>
  );
}