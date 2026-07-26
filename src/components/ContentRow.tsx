'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ContentRowData, RowCard } from '@/types/content';
import { contentHref, contentIdFromLegacyHref } from '@/lib/routes';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

function PosterCard({ card }: { card: RowCard }) {
  return (
    <div
      className="relative rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8f5bd7] focus:ring-opacity-75 transition-all duration-200"
      tabIndex={0}
    >
      <a
        href={contentHref({ id: contentIdFromLegacyHref(card.href, card.title) })}
        className="cursor-pointer relative group flex-shrink-0 text-left w-full h-full p-0 bg-transparent border-none"
      >
        <div className="relative w-[160px] md:w-[180px] overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-[0_0_28px_rgba(143,91,215,0.34)] hover:scale-105 hover:z-10">
          <Image src={card.poster} alt={`Póster de ${card.title}`} width={360} height={540} sizes="(max-width: 768px) 160px, 180px" className="aspect-[2/3] object-cover w-full" />
          <div className="absolute top-2 left-2 z-20">
            <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
              <div className="absolute inset-0 rounded-full bg-black/50 shadow-lg"></div>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#14121b"
                  strokeWidth="3"
                  strokeOpacity="0.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#8f5bd7"
                  strokeWidth="3"
                  strokeDasharray={`${card.progress} 100`}
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                  className="group-hover:animate-pulse"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#eee9f4] font-bold text-sm drop-shadow-md">
                  {card.rating}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-b from-transparent via-transparent to-[#5f318f]/45 pointer-events-none"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 border-2 border-[#8f5bd7]/30 pointer-events-none"></div>
        </div>
      </a>
    </div>
  );
}

/**
 * Fila de contenido con scroll horizontal del template:
 * título + separador + "Ver todo" + botones prev/next (scrollBy 300px smooth).
 */
export default function ContentRow({ row }: { row: ContentRowData }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const scrollAmount = 300;

  const updateArrowVisibility = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scrollBy = (left: number) => {
    scrollRef.current?.scrollBy({ left, behavior: 'smooth' });
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(updateArrowVisibility, 220);
  };

  useEffect(() => {
    updateArrowVisibility();
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="scroll-section mt-4 mb-12">
      <div className="py-6 md:py-8">
        <div className="flex items-center justify-between px-4 md:px-8 mb-4">
          <div className="flex items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#eee9f4]">{row.title}</h2>
            <div className="h-8 border-l border-[#b9a9ca]/18 mx-4"></div>
            <a href="/explore" className="text-[#c9a8f0] text-sm hover:text-[#eee9f4] transition-colors">
              Ver todo
            </a>
          </div>
        </div>

        <div className="relative vault-rail-wrap">
          <button
            type="button"
            aria-label="Desplazar fila a la izquierda"
            className={`vault-rail-arrow vault-rail-arrow--left ${showLeft ? '' : 'vault-rail-arrow--hidden'}`}
            onClick={() => scrollBy(-scrollAmount)}
          >
            <span className="vault-rail-arrow-btn">
              <ChevronLeftIcon className="h-5 w-5" />
            </span>
          </button>

          <div
            ref={scrollRef}
            onScroll={updateArrowVisibility}
            className="flex items-center space-x-6 overflow-x-scroll scrollbar-hide py-4 px-4 md:px-8 select-none will-change-scroll cursor-grab"
          >
            {row.cards.map((card, i) => (
              <PosterCard key={`${card.href}-${i}`} card={card} />
            ))}
          </div>

          <button
            type="button"
            aria-label="Desplazar fila a la derecha"
            className={`vault-rail-arrow vault-rail-arrow--right ${showRight ? '' : 'vault-rail-arrow--hidden'}`}
            onClick={() => scrollBy(scrollAmount)}
          >
            <span className="vault-rail-arrow-btn">
              <ChevronRightIcon className="h-5 w-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
