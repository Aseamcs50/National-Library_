import { Mail, Link, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaFacebookF, FaXTwitter, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa6';

const sharePlatforms = [
  {
    name: 'Facebook',
    Icon: FaFacebookF,
    colorClass: 'bg-blue-600 hover:bg-blue-700',
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Twitter / X',
    Icon: FaXTwitter,
    colorClass: 'bg-black hover:bg-gray-800',
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'WhatsApp',
    Icon: FaWhatsapp,
    colorClass: 'bg-green-600 hover:bg-green-700',
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  {
    name: 'LinkedIn',
    Icon: FaLinkedinIn,
    colorClass: 'bg-blue-700 hover:bg-blue-800',
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Email',
    Icon: Mail,
    colorClass: 'bg-gray-600 hover:bg-gray-700',
    getUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
  {
    name: 'نسخ الرابط',
    Icon: Link,
    colorClass: 'bg-gray-500 hover:bg-gray-600',
    action: 'copy',
  },
];

export default function ShareBar({ title, articleSlug }) {
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/article/${articleSlug}`
      : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ الرابط');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('تم نسخ الرابط');
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={18} className="text-primary-dark" />
        <span className="font-semibold text-gray-800 text-sm">مشاركة المقال</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {sharePlatforms.map((p) =>
          p.action === 'copy' ? (
            <button
              key={p.name}
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-full shadow transition-transform hover:scale-105 ${p.colorClass}`}
            >
              <p.Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{p.name}</span>
            </button>
          ) : (
            <a
              key={p.name}
              href={p.getUrl(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-full shadow transition-transform hover:scale-105 ${p.colorClass}`}
            >
              <p.Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{p.name}</span>
            </a>
          )
        )}
      </div>
    </div>
  );
}