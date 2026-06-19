import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';
import { Calendar } from 'lucide-react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const categoryBarColors = {
  'سياسة': 'bg-red-400',
  'تقنية': 'bg-blue-500',
  'صحة': 'bg-green-500',
  'رياضة': 'bg-yellow-400',
  'ثقافة': 'bg-purple-400',
  'اقتصاد': 'bg-orange-400',
};

function getCategoryBarColor(category) {
  return categoryBarColors[category] || 'bg-gray-300';
}

function ArticleCard({ article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${article.slug}`);
  };

  return (
    <article
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 cursor-pointer group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`h-1 w-full ${getCategoryBarColor(article.category)}`} />
      <div className="relative overflow-hidden aspect-video bg-gray-100">
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <CategoryBadge category={article.category} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Calendar size={12} />
          <time>{formatDate(article.publish_date)}</time>
        </div>
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-primary-dark transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
        <div className="mt-4 text-primary-dark text-sm font-semibold group-hover:underline underline-offset-4 transition-all">
          اقرأ المزيد ←
        </div>
      </div>
    </article>
  );
}

export default memo(ArticleCard);