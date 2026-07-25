'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { HeroSlide } from '@/types/content';
import { PlaySolidIcon, StarSmallIcon } from '@/components/icons';
import { contentHref, contentIdFromLegacyHref } from '@/lib/routes';

interface HeroSliderProps { slides: HeroSlide[]; }

/** Héroe de catálogo con transición ligera y profundidad que respeta movimiento reducido. */
export default function HeroSlider({ slides }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const startAutoPlay = useCallback(() => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => setIndex((current) => (current + 1) % slides.length), 6000);
  }, [slides.length]);

  useEffect(() => { startAutoPlay(); return () => clearInterval(autoplayRef.current); }, [startAutoPlay]);
  useEffect(() => {
    if (!rootRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = rootRef.current.querySelectorAll<HTMLElement>('[data-hero-reveal]');
    gsap.fromTo(elements, { autoAlpha: 0, y: 18, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .55, stagger: .07, ease: 'power2.out', overwrite: true });
  }, [index]);
  useGSAP(() => {
    const root = rootRef.current;
    const background = backgroundRef.current;
    if (!root || !background || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (event: PointerEvent) => gsap.to(background, { x: (event.clientX / window.innerWidth - .5) * -10, y: (event.clientY / window.innerHeight - .5) * -8, duration: .8, ease: 'power2.out', overwrite: true });
    root.addEventListener('pointermove', onMove);
    return () => root.removeEventListener('pointermove', onMove);
  }, { scope: rootRef, dependencies: [index] });

  const movie = slides[index];
  const detailHref = contentHref({ id: contentIdFromLegacyHref(movie.watchHref, movie.title) });

  return <div className="relative pointer-events-auto select-none" ref={rootRef}>
    <div className="relative h-[70vh] md:h-screen w-full overflow-hidden">
      <div ref={backgroundRef} className="absolute -inset-3 will-change-transform">
        <Image src={movie.bg} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-black/45 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#08070d] to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end z-10">
        <div className="pl-4 md:pl-7 lg:pl-10 pr-4 pb-8 md:pb-16 max-w-2xl">
          <div data-hero-reveal className="flex items-center space-x-2 mb-3">
            <span className="bg-[#5f318f] text-[#eee9f4] text-xs px-2 py-0.5 rounded-full">{movie.type}</span>
            <span className="vault-glass text-[#eee9f4] text-xs px-2 py-0.5 rounded-full flex items-center"><StarSmallIcon className="h-3 w-3 text-[#c9a8f0] mr-1" />{movie.rating}</span>
            <span className="vault-glass text-[#eee9f4] text-xs px-2 py-0.5 rounded-full">{movie.release}</span>
          </div>
          <h1 data-hero-reveal className="text-3xl md:text-5xl lg:text-7xl font-bold text-[#eee9f4] max-w-3xl">
            {movie.logo ? <span className="relative block h-20 md:h-28 lg:h-36"><Image src={movie.logo} alt={movie.title} fill sizes="(min-width: 1024px) 500px, 80vw" className="object-contain object-left" /></span> : movie.title}
          </h1>
          <p data-hero-reveal className="text-[#eee9f4]/80 text-sm max-w-xl leading-relaxed mt-3 line-clamp-3">{movie.desc}</p>
          <div data-hero-reveal className="flex space-x-3 mt-5"><a href={detailHref} className="flex items-center justify-center bg-[#5f318f] hover:bg-[#8f5bd7] text-[#eee9f4] font-medium rounded-full w-36 py-2.5 text-sm transition shadow-lg shadow-[#5f318f]/28"><PlaySolidIcon className="h-3 w-3 mr-1.5" />Ver detalle</a></div>
        </div>
      </div>
      <div className="absolute bottom-8 right-8 z-30 hidden lg:flex items-center space-x-3">
        {slides.map((slide, slideIndex) => <button key={slide.title} type="button" aria-label={`Ver ${slide.title}`} aria-pressed={slideIndex === index} className={`relative overflow-hidden rounded-lg transition-all duration-300 ${slideIndex === index ? 'ring-1 ring-[#c9a8f0] shadow-lg shadow-[#8f5bd7]/24 scale-105' : 'opacity-55 hover:opacity-90'}`} onClick={() => { setIndex(slideIndex); startAutoPlay(); }}><Image src={slide.thumbnail} alt="" width={80} height={120} sizes="80px" className="h-28 w-20 object-cover" /></button>)}
      </div>
    </div>
  </div>;
}
