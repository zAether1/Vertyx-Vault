"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useHistory } from "@/stores/history";
import { contentById } from "@/data/catalog";
import { genreById } from "@/data/genres";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { formatRelativeDate, formatTimecode } from "@/lib/format";
import { GenerativePoster } from "@/components/cards/GenerativePoster";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Footer } from "@/components/layout/Footer";
import { ClockIcon, PlayIcon, TrashIcon } from "@/components/ui/icons";

export function HistoryView() {
  const { t, locale } = useI18n();
  const entries = useHistory((s) => s.entries);
  const remove = useHistory((s) => s.remove);
  const clear = useHistory((s) => s.clear);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const rows = entries
    .map((entry) => ({ entry, item: contentById.get(entry.id) }))
    .filter((r): r is { entry: (typeof entries)[number]; item: NonNullable<ReturnType<typeof contentById.get>> } => r.item !== undefined);

  return (
    <div data-i18n-region>
      <div
        className="mx-auto min-h-svh max-w-5xl px-4 pb-24 sm:px-6 lg:px-10"
        style={{ paddingTop: "calc(var(--nav-height) + 2.5rem)" }}
      >
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-display-md font-semibold text-ink">
              {t.history.title}
            </h1>
            <p className="mt-2 text-body text-ink-dim">{t.history.subtitle}</p>
          </div>
          {hydrated && rows.length > 0 && (
            <Button variant="ghost" onClick={clear}>
              <TrashIcon size={15} />
              {t.history.clear}
            </Button>
          )}
        </header>

        {hydrated && rows.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-pill border border-graphite-700 text-ink-faint">
              <ClockIcon size={26} />
            </span>
            <div>
              <p className="font-display text-title font-semibold text-ink">{t.history.empty}</p>
              <p className="mt-1.5 text-caption text-ink-faint">{t.history.emptyHint}</p>
            </div>
            <ButtonLink href="/">{t.favorites.explore}</ButtonLink>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map(({ entry, item }) => {
              const pct = entry.durationSec > 0 ? Math.min(100, (entry.progressSec / entry.durationSec) * 100) : 0;
              const finished = pct >= 97;
              return (
                <li
                  key={entry.id}
                  className="group flex items-center gap-4 rounded-panel border border-graphite-800 bg-graphite-900/50 p-3 shadow-card transition-[border-color] duration-[var(--duration-fast)] hover:border-graphite-600"
                >
                  <Link
                    href={`/title/${item.slug}`}
                    className="relative block w-32 shrink-0 overflow-hidden rounded-card sm:w-44"
                    aria-label={item.title[locale]}
                  >
                    <div className="relative aspect-video">
                      <GenerativePoster
                        seed={item.id}
                        genre={item.genre}
                        mode="backdrop"
                        className="absolute inset-0 h-full w-full"
                      />
                      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-graphite-700">
                        <div className="h-full bg-primary-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[1rem] font-semibold text-ink">
                      {item.title[locale]}
                    </p>
                    <p className="label-micro mt-1">
                      {genreById[item.genre].label[locale]} · {item.year}
                    </p>
                    <p className="mt-1.5 text-caption text-ink-faint">
                      {finished
                        ? `100% ${t.history.watched}`
                        : `${formatTimecode(entry.progressSec)} / ${formatTimecode(entry.durationSec)}`}
                      <span className="mx-1.5">·</span>
                      {formatRelativeDate(entry.watchedAt, locale)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!finished && (
                      <ButtonLink
                        href={`/watch/${item.id}?t=${Math.floor(entry.progressSec)}`}
                        size="md"
                        variant="glass"
                        className="hidden sm:inline-flex"
                      >
                        <PlayIcon size={14} />
                        {t.history.resume}
                      </ButtonLink>
                    )}
                    <IconButton label={t.common.close} size="sm" onClick={() => remove(entry.id)}>
                      <TrashIcon size={15} />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
}
