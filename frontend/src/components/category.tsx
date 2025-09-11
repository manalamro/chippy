import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../store/productStore';
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate for logout

const SweetTreatsMenu = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { categories, fetchCategories } = useProductStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const navigate = useNavigate();
  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Responsive items per view
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

  // Filter out "ALL" category
  const filteredCategories = categories.filter(cat => cat.slug !== 'all');

  const maxIndex = Math.max(0, filteredCategories.length - itemsPerView);
  const visibleCategories = filteredCategories.slice(currentIndex, currentIndex + itemsPerView);

  const handleNext = () => setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  const handlePrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col items-center justify-center px-4 md:px-12 py-12 bg-[#7B4B27]">
      <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold mb-10 text-white text-center">
        {t('MENU.TITLE')}
      </h1>

      {/* Categories Carousel */}
      <div className="relative flex mt-6 items-center justify-center w-full max-w-7xl">
        {/* Left Arrow */}
        <button
          onClick={isRTL ? handleNext : handlePrev}
          disabled={isRTL ? currentIndex >= maxIndex : currentIndex === 0}
          className={`absolute ${isRTL ? 'right-0' : 'left-0'} p-2 rounded-full bg-white text-[#3E2723] z-10 disabled:opacity-50`}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex justify-center gap-6 px-2 sm:px-6 md:px-12 w-full">
          {visibleCategories.map((cat, index) => (
            <div
              key={cat.id}
              className={`cursor-pointer flex-none w-full sm:w-[calc(50%-12px)] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(33.333%-16px)] rounded-2xl overflow-hidden
                ${index === Math.floor(itemsPerView / 2)
                  ? 'bg-white shadow-2xl scale-110 border-2 border-[#7B4B27] -translate-y-4 z-10'
                  : 'bg-white/20 border border-transparent scale-100 translate-y-0 z-0'}
                transition-all duration-300`}
            >
              <div className="flex flex-col items-center justify-between h-full p-6">
                <div className="w-full h-40 flex items-center justify-center rounded-lg bg-[#E6D5C3] mb-4">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={t(`MENU.CATEGORIES.${cat.slug.toUpperCase()}`)} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-6xl">{cat.image}</span>
                  )}
                </div>
                <div className="text-center">
                  <h3 className={`font-semibold mb-2 ${index === Math.floor(itemsPerView / 2) ? 'text-[#7B4B27]' : 'text-[#3E2723]'}`}>
                    {t(`MENU.CATEGORIES.${cat.slug.toUpperCase()}`)}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={isRTL ? handlePrev : handleNext}
          disabled={isRTL ? currentIndex === 0 : currentIndex >= maxIndex}
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} p-2 rounded-full bg-white text-[#3E2723] z-10 disabled:opacity-50`}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <button
      onClick={()=> navigate('/products')}
       className="mt-10 w-full sm:w-auto px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full bg-gradient-to-r from-[#A97155] to-[#D9A441] text-white font-semibold text-lg md:text-xl lg:text-2xl shadow-md hover:scale-105 transition-all"> {t('MENU.SEE_MORE')} </button>
    </div>
  );
};

export default SweetTreatsMenu;
