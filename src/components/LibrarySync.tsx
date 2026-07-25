'use client';

import { useEffect, useRef } from 'react';
import { useLibraryStore } from '@/store/library';

/** Sincroniza biblioteca solo cuando existe un backend autorizado configurado. */
export default function LibrarySync() {
  const ready = useRef(false);
  const favorites = useLibraryStore((state) => state.favorites);
  const history = useLibraryStore((state) => state.history);
  const progress = useLibraryStore((state) => state.progress);
  const replaceLibrary = useLibraryStore((state) => state.replaceLibrary);

  useEffect(() => {
    void fetch('/api/library')
      .then((response) => response.ok ? response.json() : undefined)
      .then((snapshot) => {
        if (snapshot && Array.isArray(snapshot.favorites) && Array.isArray(snapshot.history) && Array.isArray(snapshot.progress)) replaceLibrary(snapshot);
        ready.current = true;
      })
      .catch(() => { ready.current = true; });
  }, [replaceLibrary]);

  useEffect(() => {
    if (!ready.current) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch('/api/library', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites, history, progress }),
        signal: controller.signal,
      }).catch(() => undefined);
    }, 500);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [favorites, history, progress]);

  return null;
}
