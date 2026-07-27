'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaSource } from '@/types/media';

interface MediaPlayerProps { source?: MediaSource; title: string; initialTime?: number; onProgress?: (currentTime: number, duration: number) => void; }

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
}

/** Reproductor personalizado estilo Netflix con controles propios y volumen hasta 200%. */
export default function MediaPlayer({ source, title, initialTime = 0, onProgress }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [buffered, setBuffered] = useState(0);

  // HLS setup
  useEffect(() => {
    if (!source || source.kind !== 'hls' || !videoRef.current) return;
    const video = videoRef.current;
    if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = source.url; return; }
    let hls: import('hls.js').default | undefined;
    void import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) return;
      hls = new Hls(); hls.loadSource(source.url); hls.attachMedia(video);
    }).catch(() => setError(true));
    return () => hls?.destroy();
  }, [source]);

  // Web Audio API for volume boost up to 200%
  const setupAudioBoost = useCallback(() => {
    const video = videoRef.current;
    if (!video || audioCtxRef.current) return;
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaElementSource(video);
      const gain = ctx.createGain();
      src.connect(gain);
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      gain.gain.value = volume / 100;
    } catch { /* Audio boost not available */ }
  }, []);

  // Apply volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (gainNodeRef.current) {
      video.volume = 1;
      gainNodeRef.current.gain.value = muted ? 0 : volume / 100;
    } else {
      video.volume = Math.min(volume / 100, 1);
      video.muted = muted;
    }
  }, [volume, muted]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, [playing]);

  useEffect(() => {
    if (playing) resetHideTimer();
    else setShowControls(true);
    return () => clearTimeout(hideTimer.current);
  }, [playing, resetHideTimer]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video || !containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); video.paused ? video.play() : video.pause(); break;
        case 'ArrowLeft': e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); break;
        case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 10); break;
        case 'ArrowUp': e.preventDefault(); setVolume((v) => Math.min(200, v + 10)); break;
        case 'ArrowDown': e.preventDefault(); setVolume((v) => Math.max(0, v - 10)); break;
        case 'm': setMuted((m) => !m); break;
        case 'f': toggleFullscreen(); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setupAudioBoost();
    if (video.paused) void video.play(); else video.pause();
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (Number.isFinite(video.duration) && video.currentTime > 0) onProgress?.(video.currentTime, video.duration);
    // buffered
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1) / (video.duration || 1) * 100);
    }
  };

  const resume = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    if (initialTime > 0 && video.currentTime === 0) video.currentTime = initialTime;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!source) return <div className="vp__empty"><span>Contenido disponible próximamente</span><small>Este título aún no tiene una fuente autorizada asociada.</small></div>;
  if (source.kind === 'embed') return <iframe className="vp__frame" src={source.url} title={source.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
  if (source.kind === 'dash') return <div className="vp__empty"><span>Fuente DASH preparada</span><small>Conecta el adaptador DASH del proveedor autorizado para reproducir {title}.</small></div>;
  if (error) return <div className="vp__empty"><span>No se pudo cargar la fuente</span><small>Verifica la disponibilidad del proveedor autorizado.</small></div>;

  return (
    <div
      ref={containerRef}
      className={`vp ${showControls ? '' : 'vp--hide'} ${fullscreen ? 'vp--fs' : ''}`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => { if ((e.target as HTMLElement).closest('.vp__bar,.vp__vol-popup')) return; togglePlay(); }}
    >
      <video
        ref={videoRef}
        className="vp__video"
        playsInline
        poster={source.poster}
        onLoadedMetadata={resume}
        onTimeUpdate={onTimeUpdate}
        onPause={() => { setPlaying(false); onProgress?.(videoRef.current?.currentTime ?? 0, videoRef.current?.duration ?? 0); }}
        onPlay={() => { setPlaying(true); setupAudioBoost(); }}
        onError={() => setError(true)}
      >
        {source.kind === 'mp4' && <source src={source.url} type="video/mp4" />}
      </video>

      {/* Gradient overlay */}
      <div className="vp__gradient" />

      {/* Center play icon on pause */}
      {!playing && <button className="vp__big-play" onClick={togglePlay} aria-label="Reproducir">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </button>}

      {/* Title overlay */}
      <div className="vp__title">{title}</div>

      {/* Controls bar */}
      <div className="vp__bar">
        {/* Progress bar */}
        <div className="vp__progress" ref={progressRef} onClick={seek}>
          <div className="vp__progress-buffered" style={{ width: `${buffered}%` }} />
          <div className="vp__progress-fill" style={{ width: `${progress}%` }} />
          <div className="vp__progress-thumb" style={{ left: `${progress}%` }} />
        </div>

        <div className="vp__controls">
          {/* Left controls */}
          <div className="vp__left">
            {/* Play/Pause */}
            <button className="vp__btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }} aria-label={playing ? 'Pausar' : 'Reproducir'}>
              {playing ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            {/* Rewind 10s */}
            <button className="vp__btn" onClick={(e) => { e.stopPropagation(); const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }} aria-label="Retroceder 10s">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5H17c0 2.5-2 4.5-4.5 4.5S8 17 8 14.5 10 10 12.5 10V8z" /><path d="M12.5 8V3L8 7l4.5 4.5V8z" /><text x="10" y="16.5" fontSize="5.5" fontWeight="700" fill="currentColor" textAnchor="middle">10</text></svg>
            </button>

            {/* Forward 10s */}
            <button className="vp__btn" onClick={(e) => { e.stopPropagation(); const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }} aria-label="Adelantar 10s">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 8c3.6 0 6.5 2.9 6.5 6.5s-2.9 6.5-6.5 6.5S5 18.1 5 14.5H7c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5-2-4.5-4.5-4.5V8z" /><path d="M11.5 8V3l4.5 4-4.5 4.5V8z" /><text x="14" y="16.5" fontSize="5.5" fontWeight="700" fill="currentColor" textAnchor="middle">10</text></svg>
            </button>

            {/* Volume */}
            <div className="vp__vol" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
              <button className="vp__btn" onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
                {muted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                ) : volume <= 50 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                )}
              </button>
              {showVolume && <div className="vp__vol-popup" onClick={(e) => e.stopPropagation()}>
                <input
                  type="range"
                  className="vp__vol-slider"
                  min="0"
                  max="200"
                  value={muted ? 0 : volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); setupAudioBoost(); }}
                />
                <span className="vp__vol-label">{muted ? 0 : volume}%</span>
              </div>}
            </div>

            {/* Time */}
            <span className="vp__time">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          {/* Right controls */}
          <div className="vp__right">
            {/* Fullscreen */}
            <button className="vp__btn" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
              {fullscreen ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
