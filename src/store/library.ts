'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LibraryEntry { id: string; addedAt: number; }
export interface PlaybackEntry { id: string; currentTime: number; duration: number; updatedAt: number; }
interface LibraryState {
  favorites: LibraryEntry[];
  history: LibraryEntry[];
  progress: PlaybackEntry[];
  toggleFavorite: (id: string) => void;
  addToHistory: (id: string) => void;
  saveProgress: (id: string, currentTime: number, duration: number) => void;
}

export const useLibraryStore = create<LibraryState>()(persist((set) => ({
  favorites: [], history: [], progress: [],
  toggleFavorite: (id) => set((state) => ({ favorites: state.favorites.some((entry) => entry.id === id) ? state.favorites.filter((entry) => entry.id !== id) : [{ id, addedAt: Date.now() }, ...state.favorites] })),
  addToHistory: (id) => set((state) => ({ history: [{ id, addedAt: Date.now() }, ...state.history.filter((entry) => entry.id !== id)].slice(0, 24) })),
  saveProgress: (id, currentTime, duration) => set((state) => ({ progress: [{ id, currentTime, duration, updatedAt: Date.now() }, ...state.progress.filter((entry) => entry.id !== id)].slice(0, 24) })),
}), { name: 'vertyx-library' }));
