import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function NewsTicker() {
  const navigate = useNavigate();
  const [headlines, setHeadlines] = useState([]);

  useEffect(() => {
    const fetchTicker = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug')
        .eq('status', 'published')
        .order('publish_date', { ascending: false })
        .limit(10);
      if (!error && data) setHeadlines(data);
    };
    fetchTicker();
  }, []);

  if (headlines.length === 0) return null;

  const tickerItems = [...headlines, ...headlines];

  const handleClick = (item) => {
    navigate(`/article/${item.slug}`);
  };

  return (
    <div className="bg-gradient-to-r from-primary-dark to-primary-medium text-white py-2 overflow-hidden shadow-md ticker-wrapper">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-black/30 px-2 sm:px-5 py-2 sm:py-3 text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-l-full">
          أحدث المنشورات
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-track">
            {tickerItems.map((item, i) => (
              <span key={i} className="inline-flex items-center">
                <button
                  onClick={() => handleClick(item)}
                  className="text-sm font-medium px-6 hover:text-amber-300 hover:underline cursor-pointer whitespace-nowrap transition"
                >
                  {item.title}
                </button>
                <span className="text-primary-light mx-2">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}