import type { Locale } from "@/lib/i18n/config";

export type LocalizedText = Record<Locale, string>;

export type GenreId =
  | "scifi"
  | "thriller"
  | "drama"
  | "documentary"
  | "animation"
  | "noir";

export type ContentKind = "film" | "series";

export type StreamKindHint = "hls" | "mp4" | "iframe";

export interface ContentItem {
  id: string;
  slug: string;
  kind: ContentKind;
  title: LocalizedText;
  synopsis: LocalizedText;
  genre: GenreId;
  year: number;
  /** Runtime in minutes (films) or per-episode average (series) */
  runtime: number;
  rating: "TV-14" | "TV-MA" | "PG" | "PG-13" | "R";
  score: number; // 0–100 critic score
  /** Which mock provider family serves this title */
  streamHint: StreamKindHint;
  featured?: boolean;
}

export interface Genre {
  id: GenreId;
  label: LocalizedText;
}
