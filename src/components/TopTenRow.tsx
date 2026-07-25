'use client';

import { useEffect, useRef, useState } from 'react';
import type { TopItem } from '@/types/content';
import { ChevronRightIcon } from '@/components/icons';
import { contentHref, contentIdFromLegacyHref } from '@/lib/routes';

interface TopTenRowProps {
  variant: 'PELÍCULAS' | 'SERIES';
  seeAllHref: string;
  items: TopItem[];
}

/**
 * Top-10 del template: cabecera "TOP PELÍCULAS/SERIES HOY", números gigantes
 * con -webkit-text-stroke y flechas laterales que aparecen al hover de la fila,
 * con visibilidad según posición de scroll (réplica de updateArrowVisibility).
 */
export default function TopTenRow({ variant, seeAllHref, items }: TopTenRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const scrollAmount = 300;

  const updateArrowVisibility = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setShowRight(el.scrollLeft < maxScrollLeft - 5);
  };

  useEffect(() => {
    updateArrowVisibility();
  }, []);

  const scrollBy = (left: number) => {
    containerRef.current?.scrollBy({ left, behavior: 'smooth' });
    setTimeout(updateArrowVisibility, 500);
  };

  return (
    <>
      <div className="px-4 md:px-8 lg:px-12 mb-2">
        <h1 className="flex flex-col md:flex-row items-start md:items-center ml-2 md:ml-0">
          <div className="flex">
            <span className="text-6xl md:text-8xl font-bold text-blue-500 leading-none">T</span>
            <span className="text-6xl md:text-8xl font-bold text-blue-500 leading-none ml-1">O</span>
            <span className="text-6xl md:text-8xl font-bold text-blue-500 leading-none ml-1">P</span>
          </div>
          <div className="text-white uppercase tracking-wider font-medium ml-1 md:ml-4 text-sm md:text-base">
            <div>{variant}</div>
            <div>HOY</div>
          </div>
          <div className="ml-4 mt-2 md:mt-0 md:block">
            <a
              className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#00040a] focus:ring-blue-500"
              href="/explore"
            >
              <span className="text-sm">Ver todo</span>
              <ChevronRightIcon className="h-4 w-4" />
            </a>
          </div>
        </h1>
      </div>

      {/* top slider start */}
      <div className="pt-0 pb-3">
        <div className="space-y-0 pl-1 sm:pl-2 md:pl-4 mb-2">
          <div className="group/row relative mt-1 overflow-visible">
            <div
              ref={containerRef}
              onScroll={updateArrowVisibility}
              className="flex items-center pl-12 sm:pl-14 md:pl-16 space-x-8 md:space-x-10 overflow-x-scroll scrollbar-hide py-6 select-none will-change-scroll cursor-grab"
              style={{ scrollBehavior: 'smooth' }}
            >
              {items.map((item) => (
                <button
                  key={item.rank}
                  onClick={() => {
                    window.location.href = contentHref({ id: contentIdFromLegacyHref(item.href, item.title) });
                  }}
                  className="cursor-pointer min-w-[140px] sm:min-w-[180px] md:min-w-[200px] relative group/item p-0 bg-transparent border-none text-left rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-opacity-75 transition-all duration-200"
                >
                  <div className="relative">
                    <div className="absolute -left-10 sm:-left-12 md:-left-14 top-2/3 -translate-y-1/2 z-30 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-translate-x-1">
                      <span
                        className="text-[80px] sm:text-[100px] md:text-[120px] font-bold text-transparent group-hover/item:text-blue-500 drop-shadow-lg select-none pointer-events-none transition-all duration-300"
                        style={{
                          WebkitTextStroke: '2px rgb(59, 130, 246)',
                          fontFamily: 'sans-serif',
                        }}
                      >
                        {item.rank}
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-lg relative z-20 transition-all duration-300 group-hover/item:shadow-[0_0_15px_rgba(59,130,246,0.7)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="aspect-[2/3] object-cover w-full h-full transition-transform duration-300 group-hover/item:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              onClick={() => scrollBy(-scrollAmount)}
              className={`absolute top-0 bottom-0 left-2 z-40 m-auto h-6 w-6 md:h-9 md:w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover/row:opacity-100 ${showLeft ? '' : 'hidden'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              onClick={() => scrollBy(scrollAmount)}
              className={`absolute top-0 bottom-0 right-2 z-40 m-auto h-6 w-6 md:h-9 md:w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover/row:opacity-100 ${showRight ? '' : 'hidden'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
      {/* top slider end */}
    </>
  );
}
