"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, SplitText, FULL_MOTION_QUERY } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import { genreById } from "@/data/genres";
import { relatedTo } from "@/data/catalog";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { formatDuration } from "@/lib/format";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { GenerativePoster } from "@/components/cards/GenerativePoster";
import { ContentRow } from "@/components/sections/ContentRow";
import { Footer } from "@/components/layout/Footer";
import { HeartIcon, PlayIcon } from "@/components/ui/icons";

export function TitleDetailView({ item }: { item: ContentItem }) {
  const { t, locale } = useI18n();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isFavorite = useFavorites((s) => s.ids.includes(item.id));
  const toggleFavorite = useFavorites((s) => s.toggle);
  const historyEntry = useHistory((s) => s.entries.find((e) => e.id === item.id));

  const resumeAt =
    historyEntry &&
    historyEntry.durationSec > 0 &&
    historyEntry.progressSec / historyEntry.durationSec < 0.97
      ? Math.floor(historyEntry.progressSec)
      : 0;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        const split = new SplitText("[data-detail-title]", { type: "words", mask: "words" });
        const tl = gsap.timeline({ defaults: { ease: "vv-out-expo" } });
        tl.fromTo(
          "[data-detail-backdrop]",
          { scale: 1.06, opacity: 0.3, filter: "blur(8px)" },
          { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.2 },
        )
          .from(split.words, { yPercent: 110, stagger: 0.05, duration: 0.7 }, "-=0.7")
          .fromTo(
            "[data-detail-reveal]",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.5 },
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
    <div ref={rootRef} data-i18n-region>
      <section className="relative min-h-[78svh] overflow-hidden" aria-labelledby="detail-title">
        <div className="absolute inset-0" data-speed="0.85">
          <div data-detail-backdrop className="absolute inset-0 will-change-transform">
            <GenerativePoster
              seed={item.id}
              genre={item.genre}
              mode="backdrop"
              className="h-full w-full"
            />
          </div>
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/20" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/30 to-transparent" />

        <div className="relative mx-auto flex min-h-[78svh] w-full max-w-7xl flex-col justify-end px-4 pb-16 pt-36 sm:px-6 lg:px-10">
          <div className="max-w-2xl space-y-5">
            <div data-detail-reveal className="flex flex-wrap items-center gap-3">
              <Chip active>{genre}</Chip>
              <span className="label-micro">
                {item.kind === "series" ? "Series" : "Film"} · {item.year}
              </span>
            </div>

            <h1
              id="detail-title"
              data-detail-title
              className="font-display text-display-md font-semibold text-ink sm:text-display-lg"
            >
              {item.title[locale]}
            </h1>

            <div data-detail-reveal className="flex flex-wrap items-center gap-4 text-caption text-ink-dim">
              <span className="rounded-md border border-graphite-600 px-1.5 py-0.5 text-micro font-mono">
                {item.rating}
              </span>
              <span>{formatDuration(item.runtime, t.common.min)}</span>
              <span className="flex items-center gap-1.5 text-success">
                <span aria-hidden="true">●</span> {item.score}%
              </span>
            </div>

            <div data-detail-reveal>
              <h2 className="label-micro mb-2">{t.detail.synopsis}</h2>
              <p className="max-w-xl text-body text-ink-dim">{item.synopsis[locale]}</p>
            </div>

            <div data-detail-reveal className="flex flex-wrap items-center gap-3 pt-2">
              <ButtonLink
                href={resumeAt > 0 ? `/watch/${item.id}?t=${resumeAt}` : `/watch/${item.id}`}
                size="lg"
              >
                <PlayIcon size={18} />
                {resumeAt > 0 ? t.detail.resume : t.detail.play}
              </ButtonLink>
              <Button
                size="lg"
                variant={isFavorite ? "primary" : "glass"}
                onClick={() => toggleFavorite(item.id)}
                aria-pressed={isFavorite}
              >
                <HeartIcon size={18} filled={isFavorite} />
                {isFavorite ? t.detail.removeFromFavorites : t.detail.addToFavorites}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-16 pb-24 pt-14">
        <ContentRow title={t.detail.related} items={relatedTo(item, 12)} />
      </div>
      <Footer />
    </div>
  );
}
