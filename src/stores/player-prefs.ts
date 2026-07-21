import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SubtitlePref = "off" | "en" | "es";

interface PlayerPrefsState {
  volume: number;
  muted: boolean;
  speed: number;
  subtitles: SubtitlePref;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setSpeed: (s: number) => void;
  setSubtitles: (s: SubtitlePref) => void;
  reset: () => void;
}

const defaults = { volume: 1, muted: false, speed: 1, subtitles: "off" as SubtitlePref };

export const usePlayerPrefs = create<PlayerPrefsState>()(
  persist(
    (set) => ({
      ...defaults,
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ muted }),
      setSpeed: (speed) => set({ speed }),
      setSubtitles: (subtitles) => set({ subtitles }),
      reset: () => set(defaults),
    }),
    { name: "vv-player-prefs" },
  ),
);
