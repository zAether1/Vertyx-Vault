'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LibraryEntry { id: string; addedAt: number; }
interface LibraryState {
  favorites: LibraryEntry[];
  history: LibraryEntry[];
  toggleFavorite: (id: string) => void;
  addToHistory: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(persist((set) => ({
  favorites: [],
  history: [],
  toggleFavorite: (id) => set((state) => ({ favorites: state.favorites.some((entry) => entry.id === id) ? state.favorites.filter((entry) => entry.id !== id) : [{ id, addedAt: Date.now() }, ...state.favorites] })),
  addToHistory: (id) => set((state) => ({ history: [{ id, addedAt: Date.now() }, ...state.history.filter((entry) => entry.id !== id)].slice(0, 24) })),
}), { name: 'vertyx-library' }));
