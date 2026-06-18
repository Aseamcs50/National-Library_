const classMap = {
  'سياسة': 'bg-primary-dark/10 text-primary-dark',
  'تقنية': 'bg-primary-medium/10 text-primary-medium',
  'صحة': 'bg-primary-light/10 text-primary-light',
  'رياضة': 'bg-primary-muted/10 text-primary-muted',
  'ثقافة': 'bg-primary-dark/5 text-primary-dark border border-primary-light/30',
  'اقتصاد': 'bg-primary-medium/5 text-primary-medium border border-primary-light/20',
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const cls = classMap[category] || 'bg-gray-100 text-gray-700';
  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-block rounded-full font-semibold shadow-sm ${cls} ${sizeClass}`}>
      {category}
    </span>
  );
}