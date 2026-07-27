/** Fuente declarada por un proveedor autorizado. Nunca se infiere desde la interfaz. */
export type SubtitleTrack = { lang: string; label: string; url: string };
export type MediaSource =
  | { kind: 'mp4'; url: string; poster?: string; subtitles?: SubtitleTrack[] }
  | { kind: 'hls'; url: string; poster?: string; subtitles?: SubtitleTrack[] }
  | { kind: 'dash'; url: string; poster?: string; subtitles?: SubtitleTrack[] }
  | { kind: 'embed'; url: string; title: string };
