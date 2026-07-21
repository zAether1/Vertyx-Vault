"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, FULL_MOTION_QUERY } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import { genreById } from "@/data/genres";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { useFavorites } from "@/stores/favorites";
import { GenerativePoster } from "./GenerativePoster";
import { HeartIcon } from "@/components/ui/icons";

/**
 * Poster card with premium hover: slight 3D tilt following the pointer and a
 * dynamic light spot driven through CSS vars via gsap.quickSetter.
 */
export function PosterCard({ item, priority = false }: { item: ContentItem; priority?: boolean }) {
  const { t, locale } = useI18n();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isFavorite = useFavorites((s) => s.ids.includes(item.id));
  const toggleFavorite = useFavorites((s) => s.toggle);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`(pointer: fine) and ${FULL_MOTION_QUERY}`, () => {
        const card = el.querySelector<HTMLElement>("[data-card]");
        if (!card) return;

        const rx = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power2.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power2.out" });
        const setLight = gsap.quickSetter(card, "--mx", "%") as (v: number) => void;
        const setLightY = gsap.quickSetter(card, "--my", "%") as (v: number) => void;

        const onMove = (e: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          ry((px - 0.5) * 10);
          rx((0.5 - py) * 8);
          setLight(px * 100);
          setLightY(py * 100);
        };
        const onEnter = () => {
          gsap.to(card, { scale: 1.03, duration: 0.4, ease: "vv-out-expo" });
          gsap.to(card.querySelector("[data-light]"), { opacity: 1, duration: 0.3 });
        };
        const onLeave = () => {
          rx(0);
          ry(0);
          gsap.to(card, { scale: 1, duration: 0.5, ease: "vv-out-expo" });
          gsap.to(card.querySelector("[data-light]"), { opacity: 0, duration: 0.4 });
        };

        el.addEventListener("pointermove", onMove, { passive: true });
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const title = item.title[locale];
  const genre = genreById[item.genre].label[locale];

  return (
    <div ref={rootRef} className="group w-40 shrink-0 sm:w-44 lg:w-48" style={{ perspective: "800px" }}>
      <div
        data-card
        className="relative overflow-hidden rounded-card bg-graphite-900 shadow-card transition-shadow duration-[var(--duration-base)] will-change-transform group-hover:shadow-card-hover"
        style={{ transformStyle: "preserve-3d", ["--mx" as string]: "50%", ["--my" as string]: "50%" }}
      >
        <Link
          href={`/title/${item.slug}`}
          className="block focus-visible:outline-none"
          aria-label={`${title} — ${genre}, ${item.year}`}
        >
          <div className="relative aspect-[2/3]">
            <GenerativePoster
              seed={item.id}
              genre={item.genre}
              mode="poster"
              className="absolute inset-0 h-full w-full"
            />
            {/* Dynamic light following the pointer */}
            <div
              data-light
              aria-hidden="true"
              className="absolute inset-0 opacity-0"
              style={{
                background:
                  "radial-gradient(280px circle at var(--mx) var(--my), rgb(196 176 255 / 0.14), transparent 65%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-void/90 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="font-display text-[0.95rem] font-semibold leading-tight text-ink">
                {title}
              </p>
              <p className="label-micro mt-1.5">
                {genre} · {item.year}
              </p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => toggleFavorite(item.id)}
          aria-label={isFavorite ? t.detail.removeFromFavorites : t.detail.addToFavorites}
          aria-pressed={isFavorite}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-pill backdrop-blur-md transition-all duration-[var(--duration-fast)] ${
            isFavorite
              ? "bg-primary-600/80 text-ink opacity-100"
              : "bg-void/50 text-ink-dim opacity-0 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
          }`}
        >
          <HeartIcon size={15} filled={isFavorite} />
        </button>
      </div>
    </div>
  );
}
