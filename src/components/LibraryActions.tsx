'use client';

import { useEffect, useState } from 'react';
import { useLibraryStore } from '@/store/library';

export function FavoriteButton({ id }: { id: string }) {
  const favorites = useLibraryStore((state) => state.favorites);
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const saved = favorites.some((entry) => entry.id === id);
  return <button type="button" className="vault-action" onClick={() => toggleFavorite(id)} aria-pressed={saved}>{ready && saved ? 'Guardado en mi lista' : 'Guardar en mi lista'}</button>;
}

export function HistoryTracker({ id }: { id: string }) {
  const addToHistory = useLibraryStore((state) => state.addToHistory);
  useEffect(() => { addToHistory(id); }, [addToHistory, id]);
  return null;
}
