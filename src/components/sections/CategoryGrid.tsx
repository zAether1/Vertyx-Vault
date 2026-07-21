"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, FULL_MOTION_QUERY } from "@/lib/gsap";
import { genres } from "@/data/genres";
import { catalog } from "@/data/catalog";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { GenerativePoster } from "@/components/cards/GenerativePoster";

/** Genre tiles with staggered reveal — each backed by generative art. */
export function CategoryGrid() {
  const rootRef = useRef<HTMLElement | null>(null);
  const { t, locale } = useI18n();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(
          "[data-category]",
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: "vv-out-expo",
            scrollTrigger: { trigger: rootRef.current, start: "top 85%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="cv-auto mx-auto max-w-7xl px-4 sm:px-6 lg:px-10" aria-label={t.home.browseByGenre} data-i18n-region>
      <h2 className="mb-5 font-display text-title font-semibold text-ink">
        {t.home.browseByGenre}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {genres.map((genre) => {
          const count = catalog.filter((c) => c.genre === genre.id).length;
          return (
            <Link
              key={genre.id}
              data-category
              href={`/search?genre=${genre.id}`}
              className="group relative overflow-hidden rounded-card border border-graphite-800 shadow-card transition-[border-color,box-shadow] duration-[var(--duration-base)] hover:border-graphite-600 hover:shadow-card-hover"
            >
              <div className="relative aspect-[8/5]">
                <GenerativePoster
                  seed={`genre-${genre.id}`}
                  genre={genre.id}
                  mode="backdrop"
                  className="absolute inset-0 h-full w-full transition-transform duration-[var(--duration-slow)] group-hover:scale-105"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-void/40 transition-colors duration-[var(--duration-base)] group-hover:bg-void/20" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-display text-[0.95rem] font-semibold text-ink">
                    {genre.label[locale]}
                  </p>
                  <p className="label-micro mt-0.5">{count}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
