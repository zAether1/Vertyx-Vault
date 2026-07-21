"use client";

import { useRef } from "react";
import { gsap, useGSAP, FULL_MOTION_QUERY } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { GenerativePoster } from "@/components/cards/GenerativePoster";
import { PlayIcon } from "@/components/ui/icons";

/**
 * Full-width spotlight banner between rows: full-bleed backdrop with left
 * wash, type tag, title, synopsis and CTA — with a parallax drift on scroll.
 */
export function SpotlightBanner({ item }: { item: ContentItem }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const { t, locale } = useI18n();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(
          rootRef.current,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "vv-out-expo",
            scrollTrigger: { trigger: rootRef.current, start: "top 85%", once: true },
          },
        );
        gsap.fromTo(
          "[data-spot-backdrop]",
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="cv-auto mx-auto max-w-7xl px-4 sm:px-6 lg:px-10" aria-label={item.title[locale]} data-i18n-region>
      <div className="relative overflow-hidden rounded-panel border border-graphite-800 shadow-card">
        <div data-spot-backdrop className="absolute inset-[-12%] will-change-transform">
          <GenerativePoster
            seed={`${item.id}-spot`}
            genre={item.genre}
            mode="backdrop"
            className="h-full w-full"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/60 to-void/20" />

        <div className="relative flex items-center gap-8 p-6 sm:p-10 lg:p-14">
          <div className="hidden w-40 shrink-0 overflow-hidden rounded-card border border-graphite-700 shadow-card md:block">
            <div className="relative aspect-[2/3]">
              <GenerativePoster
                seed={item.id}
                genre={item.genre}
                mode="poster"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>

          <div className="max-w-xl space-y-3">
            <p className="label-micro !text-accent-300">
              {item.kind === "series" ? t.common.series : t.common.movie} · {item.year} ·{" "}
              <span className="text-success">★ {(item.score / 10).toFixed(1)}</span>
            </p>
            <h2 className="font-display text-display-md font-semibold text-ink">
              {item.title[locale]}
            </h2>
            <p className="text-body text-ink-dim line-clamp-2 sm:line-clamp-3">
              {item.synopsis[locale]}
            </p>
            <div className="pt-2">
              <ButtonLink href={`/watch/${item.id}`} size="lg">
                <PlayIcon size={18} />
                {t.hero.watchNow}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
