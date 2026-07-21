"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import { genreById } from "@/data/genres";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { formatDuration } from "@/lib/format";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { GenerativePoster } from "@/components/cards/GenerativePoster";
import { InfoIcon, PlayIcon } from "@/components/ui/icons";

const AUTO_ADVANCE_MS = 7000;

/**
 * Fullscreen auto-advancing hero slider: full-bleed backdrop crossfade with
 * scale settle, SplitText title entrance, staggered metadata, and a poster
 * thumbnail strip acting as pagination with an animated progress ring.
 */
export function HeroSlider({ items }: { items: ContentItem[] }) {
  const { t, locale } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const progressTween = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => setActive(((index % items.length) + items.length) % items.length),
    [items.length],
  );

  /* Slide transition + auto-advance progress bar */
  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]");
      slides.forEach((slide, i) => {
        gsap.set(slide, { autoAlpha: i === active ? 1 : 0, zIndex: i === active ? 2 : 1 });
      });

      if (!reduced) {
        const current = slides[active];
        if (current) {
          const split = new SplitText(current.querySelector("[data-slide-title]"), {
            type: "chars",
            mask: "chars",
          });
          const tl = gsap.timeline({ defaults: { ease: "vv-out-expo" } });
          tl.fromTo(
            current.querySelector("[data-slide-backdrop]"),
            { scale: 1.12, filter: "blur(14px)" },
            { scale: 1, filter: "blur(0px)", duration: 1.6 },
          )
            .from(split.chars, { yPercent: 115, stagger: 0.022, duration: 0.75 }, "-=1.2")
            .fromTo(
              current.querySelectorAll("[data-slide-reveal]"),
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, stagger: 0.09, duration: 0.5 },
              "-=0.45",
            );
          return () => {
            split.revert();
            tl.kill();
          };
        }
      }
    },
    { scope: rootRef, dependencies: [active, locale], revertOnUpdate: true },
  );

  /* Progress bar drives auto-advance (GSAP tween is the timer) */
  useEffect(() => {
    if (prefersReducedMotion() || items.length < 2) return;
    const bar = progressRef.current;
    if (!bar) return;
    progressTween.current?.kill();
    gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
    const tween = gsap.to(bar, {
      scaleX: 1,
      duration: AUTO_ADVANCE_MS / 1000,
      ease: "none",
      paused,
      onComplete: () => goTo(active + 1),
    });
    progressTween.current = tween;
    return () => {
      tween.kill();
    };
  }, [active, items.length, goTo, paused]);

  useEffect(() => {
    if (paused) progressTween.current?.pause();
    else progressTween.current?.resume();
  }, [paused]);

  const item = items[active] ?? items[0];
  if (!item) return null;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label={t.hero.featured}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="relative h-[94svh] min-h-[540px] overflow-hidden"
      data-i18n-region
    >
      {items.map((slide, i) => {
        const slideGenre = genreById[slide.genre].label[locale];
        return (
          <article
            key={slide.id}
            data-slide
            aria-hidden={i !== active}
            className="absolute inset-0"
          >
            <div data-slide-backdrop className="absolute inset-0 will-change-transform">
              <GenerativePoster
                seed={slide.id}
                genre={slide.genre}
                mode="backdrop"
                className="h-full w-full"
              />
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-void/10" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/30 to-transparent" />

            <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 pb-32 sm:px-6 sm:pb-36 lg:px-10">
              <div className="max-w-2xl space-y-4">
                <p data-slide-reveal className="label-micro !text-primary-300">
                  {t.hero.featured} · {slideGenre} · {slide.year}
                </p>
                <h1
                  data-slide-title
                  className="font-display text-display-lg font-semibold text-ink sm:text-display-xl"
                >
                  {slide.title[locale]}
                </h1>
                <div data-slide-reveal className="flex flex-wrap items-center gap-4 text-caption text-ink-dim">
                  <span className="rounded-md border border-graphite-600 px-1.5 py-0.5 text-micro font-mono">
                    {slide.rating}
                  </span>
                  <span>{formatDuration(slide.runtime, t.common.min)}</span>
                  <span className="flex items-center gap-1.5 font-mono text-success">
                    ★ {(slide.score / 10).toFixed(1)}
                  </span>
                  <span className="label-micro">
                    {slide.kind === "series" ? t.common.series : t.common.movie}
                  </span>
                </div>
                <p data-slide-reveal className="max-w-xl text-body text-ink-dim line-clamp-2 sm:line-clamp-3">
                  {slide.synopsis[locale]}
                </p>
                <div data-slide-reveal className="flex flex-wrap items-center gap-3 pt-2">
                  <ButtonLink href={`/watch/${slide.id}`} size="lg" data-cursor="expand">
                    <PlayIcon size={18} />
                    {t.hero.watchNow}
                  </ButtonLink>
                  <ButtonLink href={`/title/${slide.slug}`} size="lg" variant="glass">
                    <InfoIcon size={18} />
                    {t.hero.moreInfo}
                  </ButtonLink>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      {/* Thumbnail pagination strip */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-10">
          <div className="flex items-end gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {items.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={slide.title[locale]}
                aria-current={i === active}
                className={`group/thumb relative w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-[var(--duration-base)] sm:w-24 ${
                  i === active
                    ? "border-primary-400/80 opacity-100 shadow-glow-purple sm:w-28"
                    : "border-graphite-700/60 opacity-45 hover:opacity-80"
                }`}
              >
                <div className="relative aspect-video">
                  <GenerativePoster
                    seed={slide.id}
                    genre={slide.genre}
                    mode="backdrop"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                {i === active && (
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-graphite-700/70">
                    <div ref={progressRef} className="h-full w-full bg-primary-400" style={{ transform: "scaleX(0)" }} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
