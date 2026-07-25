'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeroSlide } from '@/types/content';
import { PlaySolidIcon, StarSmallIcon } from '@/components/icons';

interface HeroSliderProps {
  slides: HeroSlide[];
}

/**
 * Slider principal del template: autoplay cada 6s, cambio por thumbnail,
 * logo de título con fallback a texto, tags (tipo/rating/año) y re-trigger
 * de la clase fade-in en cada cambio, igual que el script original.
 */
export default function HeroSlider({ slides }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const fadeElsRef = useRef<HTMLDivElement>(null);

  const startAutoPlay = useCallback(() => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
  }, [slides.length]);

  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(autoplayRef.current);
  }, [startAutoPlay]);

  const changeMovie = (i: number) => {
    setIndex(i);
    startAutoPlay();
  };

  // Re-trigger del fade-in en cada cambio (mismo truco de reflow del original)
  useEffect(() => {
    const root = fadeElsRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>('[data-fade]');
    els.forEach((el) => {
      el.classList.remove('fade-in');
      void el.offsetWidth;
      el.classList.add('fade-in');
    });
  }, [index]);

  const movie = slides[index];

  return (
    <div className="relative pointer-events-auto select-none" ref={fadeElsRef}>
      <div className="relative h-[70vh] md:h-screen w-full overflow-hidden select-none">
        <div
          id="bg"
          data-fade
          className="absolute inset-0 transition-all duration-700 ease-in-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="bg-img"
            src={movie.bg}
            alt="Slide Background"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-500 opacity-100"></div>
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#000814] to-transparent z-10"></div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end z-10">
          <div className="pl-2 md:pl-5 lg:pl-6 pr-4 pb-6 md:pb-16 max-w-2xl">
            <div id="tags" data-fade className="flex items-center space-x-2 mb-2 fade-in">
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                {movie.type}
              </span>
              <span className="bg-[#001845]/60 text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full flex items-center backdrop-blur-sm">
                <StarSmallIcon className="h-2.5 w-2.5 text-yellow-400 mr-1" />
                {movie.rating}
              </span>
              <span className="bg-[#001845]/60 text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full flex items-center backdrop-blur-sm">
                {movie.release}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white max-w-3xl mt-2 text-shadow">
              <div
                className="relative w-full h-20 md:h-28 lg:h-36 overflow-hidden"
                id="logo-container"
                data-fade
              >
                {movie.logo !== '' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    id="logo-img"
                    src={movie.logo}
                    alt="Logo"
                    className="object-contain object-left h-full w-auto max-w-full"
                  />
                ) : (
                  <span
                    id="title-text"
                    className="absolute inset-0 flex items-center text-left text-white text-3xl md:text-5xl lg:text-7xl font-bold p-2"
                  >
                    {movie.title}
                  </span>
                )}
              </div>
            </h1>

            <p
              id="desc"
              data-fade
              className="text-white/80 text-xs md:text-sm max-w-xl md:max-w-2xl line-clamp-2 leading-relaxed mt-2"
            >
              {movie.desc}
            </p>

            <div id="buttons" data-fade className="flex space-x-3 mt-4">
              <button
                id="play-btn"
                onClick={() => {
                  window.location.href = movie.watchHref;
                }}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full w-32 md:w-36 py-2 md:py-2.5 text-sm transition duration-300 shadow-lg shadow-blue-900/20"
              >
                <PlaySolidIcon className="h-3 w-3 mr-1.5" />
                Ver ahora
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnails (solo lg+) */}
        <div
          className="absolute bottom-8 right-8 z-30 hidden lg:flex items-center space-x-4"
          id="thumbnails"
        >
          {slides.map((slide, i) => {
            const active = i === index;
            return (
              <div
                key={slide.title}
                className={`thumb group relative cursor-pointer transition-all duration-500 transform ${active ? 'scale-105' : 'scale-95 hover:scale-100'}`}
                data-index={i}
                onClick={() => changeMovie(i)}
              >
                <div
                  className={`glow-layer absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-xl blur-sm opacity-40 group-hover:opacity-60 transition duration-300 ${active ? '' : 'hidden'}`}
                ></div>
                <div
                  className={`thumb-inner relative overflow-hidden rounded-lg transition-all duration-300 ${active ? 'ring-1 ring-blue-400 shadow-lg shadow-blue-500/30' : 'opacity-50 hover:opacity-75'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.thumbnail}
                    alt={`Slide ${i + 1}`}
                    className={`object-cover transition-all duration-300 ${active ? 'h-28 w-18 md:h-32 md:w-20' : 'h-24 w-16 md:h-28 md:w-18'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
