"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { useHistory } from "@/stores/history";
import { contentById } from "@/data/catalog";
import { GenerativePoster } from "@/components/cards/GenerativePoster";
import { PlayIcon } from "@/components/ui/icons";

/** "Continue watching" strip — only renders when local history exists. */
export function ContinueWatchingRow() {
  const { t, locale } = useI18n();
  const entries = useHistory((s) => s.entries);

  const inProgress = entries
    .filter((e) => e.durationSec > 0 && e.progressSec / e.durationSec < 0.97)
    .slice(0, 8);

  if (inProgress.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10" aria-label={t.home.continueWatching} data-i18n-region>
      <h2 className="mb-4 font-display text-title font-semibold text-ink">
        {t.home.continueWatching}
      </h2>
      <div className="scrollbar-none flex snap-x gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {inProgress.map((entry) => {
          const item = contentById.get(entry.id);
          if (!item) return null;
          const pct = Math.min(100, (entry.progressSec / entry.durationSec) * 100);
          return (
            <Link
              key={entry.id}
              href={`/watch/${item.id}?t=${Math.floor(entry.progressSec)}`}
              className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-card border border-graphite-800 shadow-card transition-[border-color] duration-[var(--duration-fast)] hover:border-graphite-600 sm:w-72"
            >
              <div className="relative aspect-video">
                <GenerativePoster
                  seed={item.id}
                  genre={item.genre}
                  mode="backdrop"
                  className="absolute inset-0 h-full w-full"
                />
                <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-void/35 opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-600/90 text-ink shadow-glow-purple">
                    <PlayIcon size={18} />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 pb-4">
                  <p className="font-display text-caption font-semibold text-ink">
                    {item.title[locale]}
                  </p>
                </div>
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-graphite-700">
                  <div className="h-full bg-primary-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
