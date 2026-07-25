import type { MediaSource } from '@/types/media';

/**
 * Registro manual de fuentes de vídeo autorizadas.
 *
 * Añade aquí una URL por película usando su `id` de `/title/<id>`.
 * Para episodios, usa `${titleId}:${episodeId}`. La entrada de episodio
 * tiene prioridad sobre la del título.
 *
 * No incluyas tokens de proveedor en estas URLs. Si una fuente requiere
 * credenciales, entrégala desde un backend autorizado.
 */
export const mediaSources: Readonly<Record<string, MediaSource>> = {
  // Película MP4:
  // '12345': { kind: 'mp4', url: 'https://media.example.com/12345.mp4', poster: '/t/p/w500/poster.jpg' },

  // Película HLS:
  // '12345': { kind: 'hls', url: 'https://media.example.com/12345/master.m3u8', poster: '/t/p/w500/poster.jpg' },

  // Serie por episodio (prioridad sobre la fuente general de la serie):
  // '12345:12345-s1e1': { kind: 'hls', url: 'https://media.example.com/12345/s01/e01/master.m3u8' },

  // Reproductor embebido autorizado:
  // '12345': { kind: 'embed', url: 'https://player.example.com/embed/12345', title: 'Título autorizado' },

  // DASH requiere un adaptador de reproducción adicional en el cliente:
  // '12345': { kind: 'dash', url: 'https://media.example.com/12345/manifest.mpd', poster: '/t/p/w500/poster.jpg' },
};

export function mediaSourceKey(titleId: string, episodeId?: string): string {
  return episodeId ? `${titleId}:${episodeId}` : titleId;
}

export function getLocalMediaSource(titleId: string, episodeId?: string): MediaSource | undefined {
  return mediaSources[mediaSourceKey(titleId, episodeId)] ?? mediaSources[titleId];
}
