'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaSource } from '@/types/media';

interface MediaPlayerProps { source?: MediaSource; title: string; }

/** Reproductor desacoplado: cada proveedor autorizado entrega un `MediaSource` normalizado. */
export default function MediaPlayer({ source, title }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!source || source.kind !== 'hls' || !videoRef.current) return;
    const video = videoRef.current;
    if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = source.url; return; }
    let hls: import('hls.js').default | undefined;
    void import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) return;
      hls = new Hls();
      hls.loadSource(source.url);
      hls.attachMedia(video);
    }).catch(() => setError(true));
    return () => hls?.destroy();
  }, [source]);

  if (!source) return <div className="vault-player__empty"><span>Contenido disponible próximamente</span><small>Este título aún no tiene una fuente autorizada asociada.</small></div>;
  if (source.kind === 'embed') return <iframe className="vault-player__frame" src={source.url} title={source.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
  if (source.kind === 'dash') return <div className="vault-player__empty"><span>Fuente DASH preparada</span><small>Conecta el adaptador DASH del proveedor autorizado para reproducir {title}.</small></div>;
  if (error) return <div className="vault-player__empty"><span>No se pudo cargar la fuente</span><small>Verifica la disponibilidad del proveedor autorizado.</small></div>;
  return <video ref={videoRef} className="vault-player__frame" controls playsInline poster={source.poster} onError={() => setError(true)}>{source.kind === 'mp4' && <source src={source.url} type="video/mp4" />}</video>;
}
