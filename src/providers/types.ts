import type { ContentItem } from "@/data/types";

/**
 * Video provider abstraction.
 *
 * The platform stores no video files. Providers deliver authorized sources in
 * any of these shapes; the player consumes only `ResolvedMedia` and never
 * needs to know where a stream came from or how it is packaged.
 */

export type VideoSourceKind = "mp4" | "hls" | "dash" | "iframe";

export interface VideoSource {
  kind: VideoSourceKind;
  url: string;
  quality?: "480p" | "720p" | "1080p" | "4K" | "auto";
  mimeType?: string;
}

export interface SubtitleTrack {
  lang: "en" | "es";
  label: string;
  src: string;
  default?: boolean;
}

export interface ThumbnailTrack {
  /** storyboard-vtt: sprite VTT from provider · generated: seeded client art */
  kind: "storyboard-vtt" | "generated";
  src?: string;
}

export interface ResolvedMedia {
  contentId: string;
  providerId: string;
  /** Preference-ordered; the engine picks the first playable source. */
  sources: VideoSource[];
  subtitles: SubtitleTrack[];
  thumbnails?: ThumbnailTrack;
  intro?: { endSec: number };
}

export interface VideoProvider {
  id: string;
  label: string;
  /** Lower is tried first. */
  priority: number;
  canResolve(item: ContentItem): boolean;
  resolve(item: ContentItem): Promise<ResolvedMedia>;
}

export class NoProviderError extends Error {
  constructor(contentId: string) {
    super(`No provider could resolve content "${contentId}"`);
    this.name = "NoProviderError";
  }
}
