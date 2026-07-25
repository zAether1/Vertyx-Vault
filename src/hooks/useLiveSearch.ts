'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AJAX_URL, SEARCH_SUGGESTIONS_TYPING } from '@/data/navigation';

/** Resultado del endpoint tmdb_live_search del template original. */
export interface TmdbSearchItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  media_type?: 'movie' | 'tv' | 'person';
  popularity?: number;
  overview?: string;
}

interface TmdbSearchResponse {
  success: boolean;
  data: TmdbSearchItem[];
}

export type SearchState =
  | { status: 'idle' }
  | { status: 'results'; items: TmdbSearchItem[] }
  | { status: 'empty' }
  | { status: 'error' };

/**
 * Live search con debounce de 300ms contra el endpoint AJAX,
 * réplica del comportamiento de los scripts inline del template.
 */
export function useLiveSearch() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onInput = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setState({ status: 'idle' });
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${AJAX_URL}?action=tmdb_live_search&query=${encodeURIComponent(q)}`,
        );
        const result = (await response.json()) as TmdbSearchResponse;
        if (!result.success || result.data.length === 0) {
          setState({ status: 'empty' });
          return;
        }
        setState({ status: 'results', items: result.data });
      } catch (error) {
        setState({ status: 'error' });
        console.error(error);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    clearTimeout(debounceRef.current);
    setQuery('');
    setState({ status: 'idle' });
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return { query, state, onInput, clear };
}

/**
 * Placeholder animado con efecto máquina de escribir,
 * réplica del script typePlaceholder del template (80ms/40ms, pausa 1500ms).
 */
export function useTypingPlaceholder(enabled = true) {
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let currentIndex = 0;
    let charIndex = 0;
    let typingForward = true;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function typePlaceholder() {
      if (cancelled) return;
      const currentText = SEARCH_SUGGESTIONS_TYPING[currentIndex];
      if (typingForward) {
        charIndex++;
        if (charIndex <= currentText.length) {
          setPlaceholder(currentText.substring(0, charIndex));
        } else {
          typingForward = false;
          timer = setTimeout(typePlaceholder, 1500);
          return;
        }
      } else {
        charIndex--;
        if (charIndex >= 0) {
          setPlaceholder(currentText.substring(0, charIndex));
        } else {
          typingForward = true;
          currentIndex = (currentIndex + 1) % SEARCH_SUGGESTIONS_TYPING.length;
        }
      }
      const delay = typingForward ? 80 : 40;
      timer = setTimeout(typePlaceholder, delay);
    }

    typePlaceholder();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled]);

  return placeholder;
}

export function searchItemLink(item: TmdbSearchItem): string {
  if (item.media_type === 'movie') return `/watch/?type=movie&id=${item.id}`;
  if (item.media_type === 'tv') return `/watch/?type=tv&id=${item.id}&season=1&episode=1`;
  return '#';
}

const MEDIA_TYPE_MAP: Record<string, string> = {
  movie: 'Película',
  tv: 'Serie',
  person: 'Persona',
};

export function searchItemMediaType(item: TmdbSearchItem): string {
  return item.media_type
    ? (MEDIA_TYPE_MAP[item.media_type] ?? 'Desconocido')
    : 'No disponible';
}
