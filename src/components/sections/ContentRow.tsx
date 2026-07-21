"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, FULL_MOTION_QUERY } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { PosterCard } from "@/components/cards/PosterCard";
import { IconButton } from "@/components/ui/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

/**
 * Horizontal content carousel: native scroll (snap + momentum + a11y for
 * free), arrow buttons tweened with ScrollToPlugin, ScrollTrigger reveal.
 */
export function ContentRow({
  title,
  items,
  eyebrow,
}: {
  title: string;
  items: ContentItem[];
  eyebrow?: string;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const { t } = useI18n();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(
          rootRef.current,
          { opacity: 0, y: 44 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "vv-out-expo",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const updateArrows = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanLeft(track.scrollLeft > 8);
    setCanRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 8);
  };

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.round(track.clientWidth * 0.85) * dir;
    gsap.to(track, {
      scrollTo: { x: track.scrollLeft + amount },
      duration: 0.55,
      ease: "vv-out-quart",
      onUpdate: updateArrows,
      onComplete: updateArrows,
    });
  };

  if (items.length === 0) return null;

  return (
    <section ref={rootRef} className="cv-auto" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="label-micro mb-1.5">{eyebrow}</p>}
            <h2 className="font-display text-title font-semibold text-ink">{title}</h2>
          </div>
          <div className="hidden gap-1 sm:flex">
            <IconButton label={t.a11y.scrollLeft} size="sm" onClick={() => scrollBy(-1)} disabled={!canLeft}>
              <ChevronLeftIcon size={16} />
            </IconButton>
            <IconButton label={t.a11y.scrollRight} size="sm" onClick={() => scrollBy(1)} disabled={!canRight}>
              <ChevronRightIcon size={16} />
            </IconButton>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 sm:px-6 lg:px-[calc((100vw-80rem)/2+2.5rem)]"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <PosterCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
