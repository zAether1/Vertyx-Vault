'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import heroData from '@/data/hero.json';
import rowsData from '@/data/rows.json';
import { SEARCH_SUGGESTIONS_TYPING } from '@/data/navigation';
import type { ContentRowData, HeroSlide } from '@/types/content';

/** Resultado normalizado del índice local; el proveedor de catálogo se podrá intercambiar sin tocar la UI. */
export interface TmdbSearchItem {
  id: number;
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
  ...hero.map((item, index) => ({
    id: index,
    title: item.title,
    poster: item.thumbnail,
    href: item.detailHref || item.watchHref,
    media_type: mediaTypeFor(item.type),
    overview: item.desc,
  })),
  ...rows.flatMap((row, rowIndex) =>
    row.cards.map((item, cardIndex) => ({
      id: (rowIndex + 1) * 10_000 + cardIndex,
      title: item.title,
      poster: item.poster,
      href: item.href,
      media_type: mediaTypeFor(row.title),
      overview: row.title,
    })),
  ),
];

/** Búsqueda local temporal, aislada para una futura conexión a un catálogo autorizado. */
export function useLiveSearch() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const indexedContent = useMemo(() => searchIndex, []);

  const onInput = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    const normalizedQuery = value.trim().toLocaleLowerCase('es');
    if (normalizedQuery.length < 2) {
      setState({ status: 'idle' });
      return;
    }

    debounceRef.current = setTimeout(() => {
      const items = indexedContent
        .filter((item) => `${item.title} ${item.overview}`.toLocaleLowerCase('es').includes(normalizedQuery))
        .slice(0, 8);
      setState(items.length ? { status: 'results', items } : { status: 'empty' });
    }, 180);
  }, [indexedContent]);

  const clear = useCallback(() => {
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
  return item.href ?? '#';
}

export function searchItemMediaType(item: TmdbSearchItem): string {
  return item.media_type === 'tv' ? 'Serie' : 'Película';
}
