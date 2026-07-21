import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HistoryEntry {
  id: string;
  progressSec: number;
  durationSec: number;
  watchedAt: number;
}

interface HistoryState {
  entries: HistoryEntry[];
  record: (entry: Omit<HistoryEntry, "watchedAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      record: ({ id, progressSec, durationSec }) =>
        set((s) => {
          const rest = s.entries.filter((e) => e.id !== id);
          return {
            entries: [
              { id, progressSec, durationSec, watchedAt: Date.now() },
              ...rest,
            ].slice(0, 60),
          };
        }),
      remove: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    { name: "vv-history" },
  ),
);
