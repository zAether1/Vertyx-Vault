'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaSource, SubtitleTrack } from '@/types/media';

interface Props { source?: MediaSource; title: string; initialTime?: number; onProgress?: (currentTime: number, duration: number) => void; }

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MediaPlayer({ source, title, initialTime = 0, onProgress }: Props) {
  if (source?.url) {
    try {
      const u = new URL(source.url);
      if (u.hostname === 'voe.sx' || u.hostname === 'www.voe.sx') {
        const id = u.pathname.split('/').filter(Boolean).pop();
        if (id && id !== 'e') { // Avoid duplicating if it was already /e/id
          source = { ...source, kind: 'embed', title, url: `https://voe.sx/e/${id}` };
        } else if (id === 'e') {
          source = { ...source, kind: 'embed', title };
        }
      }
    } catch(e) {}
  }
  const vidRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [err, setErr] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [len, setLen] = useState(0);
  const [vol, setVol] = useState(100);
  const [mute, setMute] = useState(false);
  const [full, setFull] = useState(false);
  const [mini, setMini] = useState(false);
  const [ctrl, setCtrl] = useState(true);
  const [volUI, setVolUI] = useState(false);
  const [buf, setBuf] = useState(0);
  const [subLang, setSubLang] = useState<string>('off');
  const [subUI, setSubUI] = useState(false);

  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const SUB_OPTIONS: { code: string; label: string }[] = [
    { code: 'off', label: 'Desactivado' },
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
  ];

  // Get subtitles from source (if available)
  const subs: SubtitleTrack[] = source && source.kind !== 'embed' ? (source.subtitles ?? []) : [];

  // Reset error on source change
  useEffect(() => {
    setErr(false);
    setUseIframeFallback(false);
    setLen(0);
    setTime(0);
    setBuf(0);
  }, [source?.url]);

  // HLS & MP4 native source management
  useEffect(() => {
    if (!source || !vidRef.current || useIframeFallback) return;
    const v = vidRef.current;
    
    if (source.kind === 'mp4') {
      v.src = source.url;
      v.load();
      return;
    }
    
    if (source.kind === 'hls') {
      if (v.canPlayType('application/vnd.apple.mpegurl')) { 
        v.src = source.url; 
        return; 
      }
      let hls: import('hls.js').default | undefined;
      void import('hls.js').then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        hls = new Hls(); 
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS Error:', data);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setErr(true);
            } else {
              setErr(true);
              hls?.destroy();
            }
          }
        });

        hls.loadSource(source.url); 
        hls.attachMedia(v);
      }).catch(() => setErr(true));
      return () => hls?.destroy();
    }
  }, [source, useIframeFallback]);

  // Volume — simple video.volume (0 to 1)
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.volume = mute ? 0 : vol / 100;
    v.muted = mute;
  }, [vol, mute]);

  // Manage text tracks based on selected subtitle language
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    for (let i = 0; i < v.textTracks.length; i++) {
      const t = v.textTracks[i];
      t.mode = (subLang !== 'off' && t.language === subLang) ? 'showing' : 'hidden';
    }
  }, [subLang]);

  // Auto-hide controls
  const arm = useCallback(() => {
    setCtrl(true);
    clearTimeout(hideT.current);
    if (playing) hideT.current = setTimeout(() => setCtrl(false), 3000);
  }, [playing]);
  useEffect(() => { playing ? arm() : setCtrl(true); return () => clearTimeout(hideT.current); }, [playing, arm]);

  // Keyboard
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const v = vidRef.current;
      if (!v) return;
      if (!boxRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case 'ArrowLeft': e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); break;
        case 'ArrowRight': e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 10); break;
        case 'ArrowUp': e.preventDefault(); setVol(p => Math.min(100, p + 5)); break;
        case 'ArrowDown': e.preventDefault(); setVol(p => Math.max(0, p - 5)); break;
        case 'm': setMute(m => !m); break;
        case 'f': doFs(); break;
        case 'p': doPip(); break;
      }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  // Auto PiP when tab hidden
  useEffect(() => {
    const fn = () => {
      const v = vidRef.current;
      if (!v || v.paused) return;
      if (document.hidden && document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        v.requestPictureInPicture().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  // PiP events
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const enter = () => setMini(true);
    const leave = () => setMini(false);
    v.addEventListener('enterpictureinpicture', enter);
    v.addEventListener('leavepictureinpicture', leave);
    return () => { v.removeEventListener('enterpictureinpicture', enter); v.removeEventListener('leavepictureinpicture', leave); };
  }, []);

  // Fullscreen
  useEffect(() => {
    const fn = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  const doPlay = useCallback(() => {
    const v = vidRef.current; if (!v) return;
    v.paused ? v.play() : v.pause();
  }, []);

  const doFs = () => { const b = boxRef.current; if (!b) return; document.fullscreenElement ? document.exitFullscreen() : b.requestFullscreen(); };
  const doPip = () => { const v = vidRef.current; if (!v) return; document.pictureInPictureElement ? document.exitPictureInPicture() : v.requestPictureInPicture().catch(() => {}); };

  const seekTo = (clientX: number) => {
    const v = vidRef.current, b = seekRef.current;
    if (!v || !b || !Number.isFinite(v.duration)) return;
    const r = b.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    v.currentTime = ratio * v.duration;
  };

  const onSeekDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    seekTo(e.clientX);
    const onMove = (ev: MouseEvent) => seekTo(ev.clientX);
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const onTime = () => {
    const v = vidRef.current; if (!v) return;
    setTime(v.currentTime);
    // Aggressively capture duration — HLS streams may report it late
    if (v.duration > 0 && Number.isFinite(v.duration)) setLen(v.duration);
    if (Number.isFinite(v.duration) && v.currentTime > 0) onProgress?.(v.currentTime, v.duration);
    if (v.buffered.length > 0) setBuf(v.buffered.end(v.buffered.length - 1) / (v.duration || 1) * 100);
  };

  const onMeta = () => { const v = vidRef.current; if (!v) return; if (v.duration > 0 && Number.isFinite(v.duration)) setLen(v.duration); if (initialTime > 0 && v.currentTime === 0) v.currentTime = initialTime; };
  const onDurChange = () => { const v = vidRef.current; if (v && v.duration > 0 && Number.isFinite(v.duration)) setLen(v.duration); };

  // Fallback: poll for duration if not captured yet (some HLS sources are slow)
  useEffect(() => {
    if (len > 0) return;
    const id = setInterval(() => {
      const v = vidRef.current;
      if (v && v.duration > 0 && Number.isFinite(v.duration)) { setLen(v.duration); clearInterval(id); }
    }, 500);
    return () => clearInterval(id);
  }, [len]);

  const pct = len > 0 ? (time / len) * 100 : 0;

  if (useIframeFallback && source) return <iframe className="vp__frame" src={source.url} title={title} allow="autoplay *; fullscreen *; picture-in-picture *; xr-spatial-tracking *; clipboard-write *" allowFullScreen />;
  if (!source) return <div className="vp__empty"><span>Contenido disponible próximamente</span><small>Este título aún no tiene una fuente autorizada asociada.</small></div>;
  if (source.kind === 'embed') return <iframe className="vp__frame" src={source.url} title={source.title} allow="autoplay *; fullscreen *; picture-in-picture *; xr-spatial-tracking *; clipboard-write *" allowFullScreen />;
  if (source.kind === 'dash') return <div className="vp__empty"><span>Fuente DASH</span><small>Conecta el adaptador DASH para reproducir {title}.</small></div>;
  if (err) return (
    <div className="vp__empty">
      <span>Error de reproducción</span>
      <small>La fuente nativa falló o fue bloqueada (CORS/404). Si el enlace es una página web externa, intenta abrirlo como sitio incrustado (Iframe).</small>
      <button className="vp__btn vp__btn--fallback" style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} onClick={() => {
        if (vidRef.current) {
          vidRef.current.pause();
          vidRef.current.removeAttribute('src');
          vidRef.current.load();
        }
        setUseIframeFallback(true);
        setErr(false);
      }}>
        Intentar como Iframe
      </button>
    </div>
  );

  return (
    <div ref={boxRef} className={`vp${ctrl ? '' : ' vp--hide'}${full ? ' vp--fs' : ''}`} onMouseMove={arm} onMouseLeave={() => playing && setCtrl(false)}>
      <video ref={vidRef} className="vp__video" playsInline poster={source.poster}
        onClick={doPlay} onDoubleClick={doFs}
        onLoadedMetadata={onMeta} onDurationChange={onDurChange} onTimeUpdate={onTime}
        onPlay={() => setPlaying(true)}
        onPause={() => { setPlaying(false); const v = vidRef.current; if (v) onProgress?.(v.currentTime, v.duration); }}
        onError={() => setErr(true)}
      >
        {subs.map(s => <track key={s.lang} kind="subtitles" src={s.url} srcLang={s.lang} label={s.label} />)}
      </video>

      <div className="vp__shade" />

      {!playing && <button className="vp__center" onClick={(e) => { e.stopPropagation(); doPlay(); }}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </button>}

      <div className="vp__head">{title}</div>

      <div className="vp__bar" onClick={e => e.stopPropagation()}>
        <div className="vp__seek" ref={seekRef} onMouseDown={onSeekDown}>
          <div className="vp__seek-buf" style={{ width: `${buf}%` }} />
          <div className="vp__seek-val" style={{ width: `${pct}%` }} />
          <div className="vp__seek-dot" style={{ left: `${pct}%` }} />
        </div>
        <div className="vp__row">
          <div className="vp__left">
            <button className="vp__btn" onClick={doPlay}>{playing
              ? <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}</button>
            <button className="vp__btn" onClick={() => { const v = vidRef.current; if(v) v.currentTime = Math.max(0, v.currentTime-10); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 2v6h6"/><path d="M2.5 8a10 10 0 1 1 .5 4"/><text x="12" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" textAnchor="middle">10</text></svg></button>
            <button className="vp__btn" onClick={() => { const v = vidRef.current; if(v) v.currentTime = Math.min(v.duration, v.currentTime+10); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6"/><path d="M21.5 8A10 10 0 1 0 21 12"/><text x="12" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" textAnchor="middle">10</text></svg></button>
            <div className="vp__vol" onMouseEnter={() => setVolUI(true)} onMouseLeave={() => setVolUI(false)}>
              <button className="vp__btn" onClick={() => setMute(m => !m)}>
                {mute || vol === 0
                  ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a9 9 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                  : vol <= 50
                    ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                    : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-3-7.86-7-8.77z"/></svg>}
              </button>
              {volUI && <div className="vp__vol-box">
                <input type="range" className="vp__vol-range" min="0" max="100" value={mute ? 0 : vol}
                  onChange={e => { setVol(Number(e.target.value)); setMute(false); }} />
                <span className="vp__vol-pct">{mute ? 0 : vol}%</span>
              </div>}
            </div>
            <span className="vp__time">{fmt(time)} / {fmt(len)}</span>
          </div>
          <div className="vp__right">
            {/* Subtítulos */}
            <div className="vp__sub" onMouseEnter={() => setSubUI(true)} onMouseLeave={() => setSubUI(false)}>
              <button className={`vp__btn${subLang !== 'off' ? ' vp__btn--active' : ''}`} title="Subtítulos">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z"/></svg>
              </button>
              {subUI && <div className="vp__sub-menu">
                <div className="vp__sub-title">Subtítulos</div>
                {SUB_OPTIONS.map(opt => {
                  const available = opt.code === 'off' || subs.some(s => s.lang === opt.code);
                  return <button key={opt.code}
                    className={`vp__sub-opt${subLang === opt.code ? ' vp__sub-opt--on' : ''}${!available && opt.code !== 'off' ? ' vp__sub-opt--na' : ''}`}
                    onClick={() => { if (available || opt.code === 'off') setSubLang(opt.code); }}
                  >{subLang === opt.code && <svg viewBox="0 0 24 24" fill="currentColor" className="vp__sub-check"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}{opt.label}{!available && opt.code !== 'off' && <span className="vp__sub-na">No disponible</span>}</button>;
                })}
              </div>}
            </div>
            <button className="vp__btn" onClick={doPip} title="Mini reproductor">
              <svg viewBox="0 0 24 24" fill="currentColor">{mini
                ? <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14z"/>
                : <path d="M19 11h-8v6h8v-6zm4 8V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2zm-2 .02H3V4.97h18v14.05z"/>}</svg>
            </button>
            <button className="vp__btn" onClick={doFs} title="Pantalla completa">
              <svg viewBox="0 0 24 24" fill="currentColor">{full
                ? <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                : <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>}</svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
