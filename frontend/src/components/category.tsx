import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../store/productStore';
import { useNavigate } from "react-router-dom";

const SweetTreatsMenu = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const { categories, fetchCategories } = useProductStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchCategories();
      } catch (err: any) {
        console.error('Error loading categories:', err);
        if (err?.message?.includes('Network') || err?.code === 'NETWORK_ERROR') {
          setError(t('error.networkProblem'));
        } else if (err?.response?.status >= 500) {
          setError(t('error.serverProblem'));
        } else {
          setError(t('error.generic'));
        }
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [fetchCategories, t]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setItemsPerView(3);
      else if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredCategories = categories.filter(cat => cat.slug !== 'all');
  const maxIndex = Math.max(0, filteredCategories.length - itemsPerView);
  const visibleCategories = filteredCategories.slice(currentIndex, currentIndex + itemsPerView);
  
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(Math.max(prev, 0), maxIndex));
  }, [maxIndex, itemsPerView, isRTL, filteredCategories.length]);

  const handleNext = () => setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  const handlePrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col items-center justify-center px-4 md:px-12 py-12 bg-[#7B4B27]">
      <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold mb-10 text-white text-center">
        {t('MENU.TITLE', 'Our categories')}
      </h1>

      {loading ? (
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-white/40 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-white text-xl font-medium">{t('loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-white text-xl mb-4">{t('error.serverProblem')}</p>
          <p className="text-white/80 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-white hover:text-white/80 underline transition-colors"
          >
            {t('error.retry')}
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center">
          <p className="text-white text-xl mb-4">{t('MENU.NO_CATEGORIES_FOUND', 'No categories found')}</p>
          <p className="text-white/80 text-sm mb-4">{t('MENU.NO_CATEGORIES_DESCRIPTION', 'No categories are currently available')}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-white hover:text-white/80 underline transition-colors"
          >
            {t('error.retry')}
          </button>
        </div>
      ) : (
        <div className="relative flex mt-6 items-center justify-center w-full max-w-7xl">
          <button
            onClick={isRTL ? handleNext : handlePrev}
            disabled={isRTL ? currentIndex >= maxIndex : currentIndex === 0}
            className={`absolute ${isRTL ? 'right-2 sm:right-4 md:-right-6' : 'left-2 sm:left-4 md:-left-6'} top-1/2 -translate-y-1/2 p-2 sm:p-2 md:p-3 rounded-full bg-white/90 backdrop-blur text-[#3E2723] z-20 shadow disabled:opacity-50`}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex justify-center gap-4 sm:gap-6 px-2 sm:px-6 md:px-12 w-full">
            {visibleCategories.map((cat, index) => (
              <div
                key={cat.id}
                className={`cursor-pointer flex-none w-[85%] sm:w-[calc(50%-12px)] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(33.333%-16px)] rounded-2xl overflow-hidden
                  ${index === Math.floor(itemsPerView / 2)
                    ? 'bg-white shadow-2xl md:scale-110 md:border-2 md:border-[#7B4B27] md:-translate-y-4 z-10'
                    : 'bg-white/20 border border-transparent scale-100 translate-y-0 z-0'}
                  transition-all duration-300`}
              >
                <div className="flex flex-col items-center justify-between h-full p-4 sm:p-6">
                  <div className="w-full h-32 sm:h-40 flex items-center justify-center rounded-lg bg-[#E6D5C3] mb-4">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={t(`MENU.CATEGORIES.${cat.slug.toUpperCase()}`, cat.name)} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-6xl">{cat.image}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className={`font-semibold mb-2 ${index === Math.floor(itemsPerView / 2) ? 'text-[#7B4B27]' : 'text-[#3E2723]'}`}>
                      {t(`MENU.CATEGORIES.${cat.slug.toUpperCase()}`, cat.name)}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={isRTL ? handlePrev : handleNext}
            disabled={isRTL ? currentIndex === 0 : currentIndex >= maxIndex}
            className={`absolute ${isRTL ? 'left-2 sm:left-4 md:-left-6' : 'right-2 sm:right-4 md:-right-6'} top-1/2 -translate-y-1/2 p-2 sm:p-2 md:p-3 rounded-full bg-white/90 backdrop-blur text-[#3E2723] z-20 shadow disabled:opacity-50`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <button
        onClick={() => navigate('/products')}
        className="mt-10 w-full sm:w-auto px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full bg-gradient-to-r from-[#A97155] to-[#D9A441] text-white font-semibold text-lg md:text-xl lg:text-2xl shadow-md hover:scale-105 transition-all"
      >
        {t('MENU.SEE_MORE', 'See all products')}
      </button>
    </div>
  );
};

export default SweetTreatsMenu;