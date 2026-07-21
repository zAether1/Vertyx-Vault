"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, FULL_MOTION_QUERY } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { GenerativePoster } from "@/components/cards/GenerativePoster";

/**
 * Top-10 row: giant outlined ranking numerals tucked behind each poster,
 * numerals counting in with a stagger as the row scrolls into view.
 */
export function TopTenRow({ title, items }: { title: string; items: ContentItem[] }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const { locale } = useI18n();
  const top = items.slice(0, 10);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(
          "[data-rank-item]",
          { opacity: 0, x: 60 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.07,
            duration: 0.7,
            ease: "vv-out-expo",
            scrollTrigger: { trigger: rootRef.current, start: "top 85%", once: true },
          },
        );
        gsap.fromTo(
          "[data-rank-num]",
          { yPercent: 30, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.07,
            duration: 0.8,
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
    <section ref={rootRef} className="cv-auto" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <h2 className="mb-5 font-display text-title font-semibold text-ink">{title}</h2>
      </div>
      <div
        className="flex snap-x gap-1 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-[calc((100vw-80rem)/2+2.5rem)]"
        style={{ scrollbarWidth: "none" }}
      >
        {top.map((item, i) => (
          <Link
            key={item.id}
            data-rank-item
            href={`/title/${item.slug}`}
            aria-label={`#${i + 1} — ${item.title[locale]}`}
            className="group relative flex shrink-0 snap-start items-end pl-10 sm:pl-14"
          >
            <span
              data-rank-num
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 z-0 select-none font-display text-[7.5rem] font-bold leading-[0.78] text-transparent sm:text-[10rem]"
              style={{ WebkitTextStroke: "2px rgb(105 96 160 / 0.55)" }}
            >
              {i + 1}
            </span>
            <div className="relative z-10 w-28 overflow-hidden rounded-card border border-graphite-800 shadow-card transition-transform duration-[var(--duration-base)] group-hover:scale-[1.04] group-hover:shadow-card-hover sm:w-36">
              <div className="relative aspect-[2/3]">
                <GenerativePoster
                  seed={item.id}
                  genre={item.genre}
                  mode="poster"
                  className="absolute inset-0 h-full w-full"
                />
                <span className="absolute right-1.5 top-1.5 rounded-md bg-void/75 px-1.5 py-0.5 font-mono text-micro text-success backdrop-blur-sm">
                  {(item.score / 10).toFixed(1)}
                </span>
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/95 to-transparent p-2 pt-6 opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100"
                >
                  <p className="font-display text-micro font-semibold text-ink">
                    {item.title[locale]}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
