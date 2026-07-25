/** Fuente declarada por un proveedor autorizado. Nunca se infiere desde la interfaz. */
export type MediaSource =
  | { kind: 'mp4'; url: string; poster?: string }
  | { kind: 'hls'; url: string; poster?: string }
  | { kind: 'dash'; url: string; poster?: string }
  | { kind: 'embed'; url: string; title: string };
