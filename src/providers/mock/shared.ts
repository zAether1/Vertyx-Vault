import { createRng, range } from "@/lib/seeded";

/** Simulated network latency so loading choreography behaves like production. */
export function mockLatency(seed: string): Promise<void> {
  const rng = createRng(seed);
  const ms = range(rng, 150, 400);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const SUBTITLE_TRACKS = [
  { lang: "en" as const, label: "English", src: "/subtitles/sample.en.vtt" },
  { lang: "es" as const, label: "Español", src: "/subtitles/sample.es.vtt" },
];
