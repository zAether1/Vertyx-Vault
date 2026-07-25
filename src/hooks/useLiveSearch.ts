'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import heroData from '@/data/hero.json';
import rowsData from '@/data/rows.json';
import { SEARCH_SUGGESTIONS_TYPING } from '@/data/navigation';
import type { ContentRowData, HeroSlide } from '@/types/content';
import type { CatalogTitle } from '@/types/catalog';
import { contentHref, contentIdFromLegacyHref } from '@/lib/routes';

/** Resultado normalizado: puede venir del proveedor server-side autorizado o del índice local. */
export interface TmdbSearchItem {
  id: string;
  title?: string;
  name?: string;
  poster?: string;
  href?: string;
  media_type?: 'movie' | 'tv';
  overview?: string;
}

export type SearchState =
  | { status: 'idle' }
  | { status: 'results'; items: TmdbSearchItem[] }
  | { status: 'empty' };

const hero = heroData as HeroSlide[];
const rows = rowsData as ContentRowData[];
const mediaTypeFor = (title: string): 'movie' | 'tv' =>
  title.toLocaleLowerCase('es').includes('serie') ? 'tv' : 'movie';
const searchIndex: TmdbSearchItem[] = [
  ...hero.map((item) => ({
    id: contentIdFromLegacyHref(item.watchHref, item.title),
    title: item.title,
    poster: item.thumbnail,
    href: item.detailHref || item.watchHref,
    media_type: mediaTypeFor(item.type),
    overview: item.desc,
  })),
  ...rows.flatMap((row) =>
    row.cards.map((item) => ({
      id: contentIdFromLegacyHref(item.href, item.title),
      title: item.title,
      poster: item.poster,
      href: item.href,
      media_type: mediaTypeFor(row.title),
      overview: row.title,
    })),
  ),
];

const toSearchItem = (item: CatalogTitle): TmdbSearchItem => ({
  id: item.id,
  title: item.title,
  poster: item.poster,
  href: contentHref(item),
  media_type: item.kind === 'series' ? 'tv' : 'movie',
  overview: item.description ?? item.collection,
});

function searchLocal(indexedContent: TmdbSearchItem[], normalizedQuery: string) {
  return indexedContent
    .filter((item) => `${item.title} ${item.overview}`.toLocaleLowerCase('es').includes(normalizedQuery))
    .slice(0, 8);
}

/** Búsqueda remota vía API interna; cae al índice local si el proveedor autorizado no está configurado o falla. */
export function useLiveSearch() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestRef = useRef(0);
  const indexedContent = useMemo(() => searchIndex, []);

  const onInput = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    const normalizedQuery = value.trim().toLocaleLowerCase('es');
    if (normalizedQuery.length < 2) {
      requestRef.current += 1;
      setState({ status: 'idle' });
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    debounceRef.current = setTimeout(() => {
      void fetch(`/api/catalog/search?q=${encodeURIComponent(value.trim())}`)
        .then((response) => response.ok ? response.json() as Promise<{ items: CatalogTitle[] }> : Promise.reject(new Error('search failed')))
        .then((payload) => payload.items.map(toSearchItem).slice(0, 8))
        .catch(() => searchLocal(indexedContent, normalizedQuery))
        .then((items) => {
          if (requestRef.current === requestId) setState(items.length ? { status: 'results', items } : { status: 'empty' });
        });
    }, 180);
  }, [indexedContent]);

  const clear = useCallback(() => {
    requestRef.current += 1;
    clearTimeout(debounceRef.current);
    setQuery('');
    setState({ status: 'idle' });
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);
  return { query, state, onInput, clear };
}

export function useTypingPlaceholder(enabled = true) {
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let currentIndex = 0;
    let charIndex = 0;
    let forward = true;
    let timer: ReturnType<typeof setTimeout>;

    const type = () => {
      const text = SEARCH_SUGGESTIONS_TYPING[currentIndex];
      charIndex += forward ? 1 : -1;
      setPlaceholder(text.slice(0, Math.max(0, charIndex)));
      if (forward && charIndex > text.length) {
        forward = false;
        timer = setTimeout(type, 1250);
        return;
      }
      if (!forward && charIndex < 0) {
        forward = true;
        currentIndex = (currentIndex + 1) % SEARCH_SUGGESTIONS_TYPING.length;
      }
      timer = setTimeout(type, forward ? 55 : 28);
    };

    type();
    return () => clearTimeout(timer);
  }, [enabled]);

  return placeholder;
}

export function searchItemLink(item: TmdbSearchItem): string {
  return item.href?.startsWith('/title/') ? item.href : contentHref({ id: item.id });
}

export function searchItemMediaType(item: TmdbSearchItem): string {
  return item.media_type === 'tv' ? 'Serie' : 'Película';
}
