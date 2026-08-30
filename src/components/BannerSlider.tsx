import React, { useState, useEffect, useRef } from 'react';
import { BannerSlide } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, Flame, Trophy, ShieldCheck } from 'lucide-react';

interface BannerSliderProps {
  banners: BannerSlide[];
  onBannerClick?: (banner: BannerSlide) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners, onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const activeBanners = banners.filter(b => b.active);

  // Auto slide timer
  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeBanners.length, isHovered]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -45) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl shadow-lg group select-none cursor-pointer bg-slate-900 border border-slate-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onBannerClick && onBannerClick(currentBanner)}
    >
      {/* Aspect Ratio Container (approx 16:9 / mobile banner ratio) */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] max-h-[220px]">
        {/* Banner Images with Cross-fade */}
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || 'Esports Banner'}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback Free Fire high-res wallpaper if URL fails
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
              }}
            />

            {/* Gradient Overlays for High-Contrast Readable Text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Banner Text Content Matching Screenshot */}
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center max-w-[70%] z-20">
              {banner.subtitle && (
                <div className="flex items-center gap-1.5 mb-1 text-slate-300 text-[10px] sm:text-xs font-black uppercase tracking-widest font-['Rajdhani']">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  {banner.subtitle}
                </div>
              )}

              {banner.title && (
                <h3 className="text-white font-black text-lg sm:text-2xl font-['Chakra_Petch'] leading-tight tracking-tight uppercase drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                  {banner.title}
                </h3>
              )}

              {banner.badge && (
                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black bg-indigo-600/90 text-white border border-indigo-400/40 shadow-sm uppercase tracking-wider font-['Rajdhani']">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {banner.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              type="button"
              id="banner-prev-btn"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition opacity-0 group-hover:opacity-100 active:scale-90"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="banner-next-btn"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition opacity-0 group-hover:opacity-100 active:scale-90"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Carousel Pagination Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
            {activeBanners.map((_, dotIndex) => (
              <button
                key={dotIndex}
                id={`banner-dot-${dotIndex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIndex);
                }}
                className={`transition-all duration-300 rounded-full ${
                  dotIndex === currentIndex
                    ? 'w-5 h-1.5 bg-indigo-500'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
