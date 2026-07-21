"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, FULL_MOTION_QUERY } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import { genreById } from "@/data/genres";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { formatDuration } from "@/lib/format";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Chip } from "@/components/ui/Chip";
import { GenerativePoster } from "@/components/cards/GenerativePoster";
import { InfoIcon, PlayIcon } from "@/components/ui/icons";

/**
 * Cinematic hero: layered backdrop settling from 1.08→1 scale with a blur
 * dissolve, SplitText headline rising through masks, staggered metadata and
 * a parallax depth effect on scroll (data-speed via ScrollSmoother).
 */
export function Hero({ item }: { item: ContentItem }) {
  const { t, locale } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        const split = new SplitText("[data-hero-title]", { type: "chars", mask: "chars" });
        const tl = gsap.timeline({ defaults: { ease: "vv-out-expo" }, delay: 0.15 });

        tl.fromTo(
          "[data-hero-backdrop]",
          { scale: 1.08, filter: "blur(10px)", opacity: 0.4 },
          { scale: 1, filter: "blur(0px)", opacity: 1, duration: 1.4 },
        )
          .fromTo(
            "[data-hero-eyebrow]",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.9",
          )
          .from(
            split.chars,
            { yPercent: 115, stagger: 0.02, duration: 0.8 },
            "-=0.3",
          )
          .fromTo(
            "[data-hero-meta] > *",
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, stagger: 0.07, duration: 0.45 },
            "-=0.4",
          )
          .fromTo(
            "[data-hero-synopsis]",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.3",
          )
          .fromTo(
            "[data-hero-actions]",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.35",
          );

        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [item.id, locale], revertOnUpdate: true },
  );

  const genre = genreById[item.genre].label[locale];

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[92svh] items-end overflow-hidden"
      aria-labelledby="hero-title"
      data-i18n-region
    >
      {/* Backdrop layers with parallax depth */}
      <div className="absolute inset-0" data-speed="0.82">
        <div data-hero-backdrop className="absolute inset-0 will-change-transform">
          <GenerativePoster
            seed={item.id}
            genre={item.genre}
            mode="backdrop"
            className="h-full w-full"
          />
        </div>
      </div>
      {/* Cinematic wash: readable text without killing the art */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-void/85 via-transparent to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-40 sm:px-6 lg:px-10">
        <div className="max-w-2xl space-y-5">
          <div data-hero-eyebrow className="flex items-center gap-3">
            <Chip active>{t.hero.featured}</Chip>
            <span className="label-micro">
              {genre} · {item.year}
            </span>
          </div>

          <h1
            id="hero-title"
            data-hero-title
            className="font-display text-display-lg font-semibold text-ink sm:text-display-xl"
          >
            {item.title[locale]}
          </h1>

          <div data-hero-meta className="flex flex-wrap items-center gap-4">
            <span className="rounded-md border border-graphite-600 px-1.5 py-0.5 text-micro font-mono text-ink-dim">
              {item.rating}
            </span>
            <span className="text-caption text-ink-dim">
              {formatDuration(item.runtime, t.common.min)}
            </span>
            <span className="flex items-center gap-1.5 text-caption text-success">
              <span aria-hidden="true">●</span> {item.score}%
            </span>
          </div>

          <p data-hero-synopsis className="max-w-xl text-body text-ink-dim">
            {item.synopsis[locale]}
          </p>

          <div data-hero-actions className="flex flex-wrap items-center gap-3 pt-2">
            <ButtonLink href={`/watch/${item.id}`} size="lg" data-cursor="expand">
              <PlayIcon size={18} />
              {t.hero.watchNow}
            </ButtonLink>
            <ButtonLink href={`/title/${item.slug}`} size="lg" variant="glass">
              <InfoIcon size={18} />
              {t.hero.moreInfo}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
