"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { gsap, useGSAP, FULL_MOTION_QUERY } from "@/lib/gsap";
import { catalog } from "@/data/catalog";
import { genres, genreById } from "@/data/genres";
import type { ContentItem, GenreId } from "@/data/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { PosterCard } from "@/components/cards/PosterCard";
import { Footer } from "@/components/layout/Footer";
import { SearchIcon } from "@/components/ui/icons";

/** Scored, bilingual, instant client-side search over the catalog. */
function scoreItem(item: ContentItem, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const locale of ["en", "es"] as const) {
    const title = item.title[locale].toLowerCase();
    if (title === q) score = Math.max(score, 100);
    else if (title.startsWith(q)) score = Math.max(score, 80);
    else if (title.includes(q)) score = Math.max(score, 60);
    if (item.synopsis[locale].toLowerCase().includes(q)) score = Math.max(score, 25);
    const genre = genreById[item.genre].label[locale].toLowerCase();
    if (genre.includes(q)) score = Math.max(score, 40);
  }
  return score;
}

export function SearchView() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get("genre");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<GenreId | "all">(
    initialGenre && genres.some((g) => g.id === initialGenre)
      ? (initialGenre as GenreId)
      : "all",
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(() => {
    let pool = genre === "all" ? catalog : catalog.filter((c) => c.genre === genre);
    if (query.trim().length > 0) {
      pool = pool
        .map((item) => ({ item, s: scoreItem(item, query.trim()) }))
        .filter(({ s }) => s > 0)
        .sort((a, b) => b.s - a.s || b.item.score - a.item.score)
        .map(({ item }) => item);
    } else {
      pool = [...pool].sort((a, b) => b.score - a.score);
    }
    return pool;
  }, [query, genre]);

  useGSAP(
    () => {
      inputRef.current?.focus();
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(
          "[data-search-head]",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: "vv-out-expo" },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(
          "[data-result]",
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            stagger: { each: 0.025, grid: "auto" },
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [results] },
  );

  const showEmpty = query.trim().length > 0 && results.length === 0;

  return (
    <div ref={rootRef} data-i18n-region>
      <div className="mx-auto min-h-svh max-w-7xl px-4 pb-24 sm:px-6 lg:px-10" style={{ paddingTop: "calc(var(--nav-height) + 2.5rem)" }}>
        <div data-search-head className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-center font-display text-display-md font-semibold text-ink">
            {t.search.title}
          </h1>

          <div className="glass flex items-center gap-3 rounded-pill px-5 shadow-card focus-within:shadow-glow-purple">
            <SearchIcon size={18} className="shrink-0 text-ink-faint" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              aria-label={t.search.title}
              className="h-13 w-full bg-transparent py-4 text-body text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t.detail.genre}>
            <button
              type="button"
              onClick={() => setGenre("all")}
              aria-pressed={genre === "all"}
              className={`cursor-pointer rounded-pill border px-3.5 py-1.5 text-micro font-mono uppercase tracking-[0.08em] transition-colors duration-[var(--duration-fast)] ${
                genre === "all"
                  ? "border-primary-500/60 bg-primary-900/50 text-primary-300"
                  : "border-graphite-700 text-ink-faint hover:border-graphite-600 hover:text-ink-dim"
              }`}
            >
              {t.common.all}
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGenre((cur) => (cur === g.id ? "all" : g.id))}
                aria-pressed={genre === g.id}
                className={`cursor-pointer rounded-pill border px-3.5 py-1.5 text-micro font-mono uppercase tracking-[0.08em] transition-colors duration-[var(--duration-fast)] ${
                  genre === g.id
                    ? "border-primary-500/60 bg-primary-900/50 text-primary-300"
                    : "border-graphite-700 text-ink-faint hover:border-graphite-600 hover:text-ink-dim"
                }`}
              >
                {g.label[locale]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12" aria-live="polite">
          {showEmpty ? (
            <div className="mx-auto max-w-md py-20 text-center">
              <p className="font-display text-title font-semibold text-ink">
                {t.search.noResults} “{query.trim()}”
              </p>
              <p className="mt-2 text-caption text-ink-faint">{t.search.tryDifferent}</p>
            </div>
          ) : (
            <>
              <p className="label-micro mb-5">
                {results.length} {results.length === 1 ? t.search.result : t.search.results}
              </p>
              <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((item) => (
                  <div key={item.id} data-result>
                    <PosterCard item={item} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
