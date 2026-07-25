'use client';

import { useEffect, useRef, useState } from 'react';
import type { DashPlayer } from 'dashjs';
import type { MediaSource } from '@/types/media';

interface MediaPlayerProps {
  source?: MediaSource;
  title: string;
  initialTime?: number;
  onProgress?: (currentTime: number, duration: number) => void;
}

/** Reproductor desacoplado: cada proveedor autorizado entrega un `MediaSource` normalizado. */
export default function MediaPlayer({ source, title, initialTime = 0, onProgress }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    const video = videoRef.current;
    if (!source || source.kind === 'embed' || !video) return;

    if (source.kind === 'mp4') {
      video.src = source.url;
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }

    if (source.kind === 'hls') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
        return () => {
          video.removeAttribute('src');
          video.load();
        };
      }

      let hls: import('hls.js').default | undefined;
      let cancelled = false;
      void import('hls.js').then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) {
          if (!cancelled) setError(true);
          return;
        }
        hls = new Hls();
        hls.loadSource(source.url);
        hls.attachMedia(video);
      }).catch(() => {
        if (!cancelled) setError(true);
      });
      return () => {
        cancelled = true;
        hls?.destroy();
      };
    }

    let dash: DashPlayer | undefined;
    let cancelled = false;
    void import('dashjs').then(({ default: dashjs }) => {
      if (cancelled) return;
      dash = dashjs.MediaPlayer().create();
      dash.initialize(video, source.url, false);
    }).catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
      dash?.reset();
    };
  }, [source]);

  const resume = () => {
    const video = videoRef.current;
    if (video && initialTime > 0 && video.currentTime === 0) video.currentTime = initialTime;
  };

  const reportProgress = () => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.currentTime > 0) onProgress?.(video.currentTime, video.duration);
  };

  if (!source) return <div className="vault-player__empty"><span>Contenido disponible próximamente</span><small>Este título aún no tiene una fuente autorizada asociada.</small></div>;
  if (source.kind === 'embed') return <iframe className="vault-player__frame" src={source.url} title={source.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
  if (error) return <div className="vault-player__empty" role="alert"><span>No se pudo cargar la fuente</span><small>Verifica la disponibilidad del proveedor autorizado.</small></div>;

  return (
    <video
      ref={videoRef}
      className="vault-player__frame"
      controls
      playsInline
      preload="metadata"
      poster={source.poster}
      aria-label={`Reproductor de ${title}`}
      onLoadedMetadata={resume}
      onTimeUpdate={reportProgress}
      onPause={reportProgress}
      onError={() => setError(true)}
    >
      Tu navegador no admite la reproducción de vídeo.
    </video>
  );
}
