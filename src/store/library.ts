'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LibraryEntry, LibrarySnapshot, PlaybackEntry } from '@/types/library';

export type { LibraryEntry, PlaybackEntry } from '@/types/library';

interface LibraryState extends LibrarySnapshot {
  toggleFavorite: (id: string) => void;
  addToHistory: (id: string) => void;
  saveProgress: (id: string, currentTime: number, duration: number) => void;
  replaceLibrary: (snapshot: LibrarySnapshot) => void;
}

export const useLibraryStore = create<LibraryState>()(persist((set) => ({
  favorites: [], history: [], progress: [],
  toggleFavorite: (id) => set((state) => ({ favorites: state.favorites.some((entry) => entry.id === id) ? state.favorites.filter((entry) => entry.id !== id) : [{ id, addedAt: Date.now() }, ...state.favorites] })),
  addToHistory: (id) => set((state) => ({ history: [{ id, addedAt: Date.now() }, ...state.history.filter((entry) => entry.id !== id)].slice(0, 24) })),
  saveProgress: (id, currentTime, duration) => set((state) => ({ progress: [{ id, currentTime, duration, updatedAt: Date.now() }, ...state.progress.filter((entry) => entry.id !== id)].slice(0, 24) })),
  replaceLibrary: (snapshot) => set({ favorites: snapshot.favorites, history: snapshot.history, progress: snapshot.progress }),
}), { name: 'vertyx-library' }));
