"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, Flip, prefersReducedMotion } from "@/lib/gsap";
import { useFavorites } from "@/stores/favorites";
import { contentById } from "@/data/catalog";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { PosterCard } from "@/components/cards/PosterCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Footer } from "@/components/layout/Footer";
import { HeartIcon } from "@/components/ui/icons";

export function FavoritesView() {
  const { t } = useI18n();
  const ids = useFavorites((s) => s.ids);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => setHydrated(true), []);

  /* Capture layout before an unfavorite removal, animate after. */
  useLayoutEffect(() => {
    if (!hydrated || prefersReducedMotion()) return;
    const grid = gridRef.current;
    if (!grid) return;
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        duration: 0.5,
        ease: "vv-out-expo",
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }),
      });
      flipStateRef.current = null;
    }
  }, [ids, hydrated]);

  const captureFlip = () => {
    const grid = gridRef.current;
    if (grid && !prefersReducedMotion()) {
      flipStateRef.current = Flip.getState(grid.querySelectorAll("[data-flip-card]"));
    }
  };

  const items = ids.map((id) => contentById.get(id)).filter((x) => x !== undefined);

  return (
    <div data-i18n-region>
      <div
        className="mx-auto min-h-svh max-w-7xl px-4 pb-24 sm:px-6 lg:px-10"
        style={{ paddingTop: "calc(var(--nav-height) + 2.5rem)" }}
      >
        <header className="mb-10">
          <h1 className="font-display text-display-md font-semibold text-ink">
            {t.favorites.title}
          </h1>
          <p className="mt-2 text-body text-ink-dim">{t.favorites.subtitle}</p>
        </header>

        {hydrated && items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-pill border border-graphite-700 text-ink-faint">
              <HeartIcon size={26} />
            </span>
            <div>
              <p className="font-display text-title font-semibold text-ink">
                {t.favorites.empty}
              </p>
              <p className="mt-1.5 text-caption text-ink-faint">{t.favorites.emptyHint}</p>
            </div>
            <ButtonLink href="/">{t.favorites.explore}</ButtonLink>
          </div>
        ) : (
          <div
            ref={gridRef}
            onClickCapture={captureFlip}
            className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {items.map((item) => (
              <div key={item.id} data-flip-card data-flip-id={item.id}>
                <PosterCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
