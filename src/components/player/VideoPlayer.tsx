"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { ContentItem } from "@/data/types";
import type { ResolvedMedia } from "@/providers/types";
import { resolveMedia } from "@/providers/registry";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { useHistory } from "@/stores/history";
import { usePlayerPrefs } from "@/stores/player-prefs";
import { useIdle } from "@/hooks/useIdle";
import { useFullscreen } from "@/hooks/useFullscreen";
import { usePlaybackEngine } from "./usePlaybackEngine";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { EmbedFrame } from "./EmbedFrame";
import { Menu } from "@/components/ui/Menu";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { formatTimecode } from "@/lib/format";
import {
  ArrowLeftIcon,
  CaptionsIcon,
  CinemaIcon,
  FullscreenIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeedIcon,
  VertyxMark,
} from "@/components/ui/icons";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ item }: { item: ContentItem }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const resumedRef = useRef(false);

  const [media, setMedia] = useState<ResolvedMedia | null>(null);
  const [resolveError, setResolveError] = useState(false);
  const [cinema, setCinema] = useState(false);

  const prefs = usePlayerPrefs();
  const recordHistory = useHistory((s) => s.record);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef);
  const engine = usePlaybackEngine(videoRef, media);
  const { state } = engine;

  const { idle, poke } = useIdle(2800, state.playing);
  const controlsHidden = idle && state.playing;

  /* Resolve media via the provider registry */
  useEffect(() => {
    let cancelled = false;
    setMedia(null);
    setResolveError(false);
    resolveMedia(item)
      .then((m) => {
        if (!cancelled) setMedia(m);
      })
      .catch(() => {
        if (!cancelled) setResolveError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [item]);

  /* Apply persisted prefs + resume position once metadata is ready */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !state.ready || resumedRef.current) return;
    resumedRef.current = true;
    video.volume = prefs.volume;
    video.muted = prefs.muted;
    video.playbackRate = prefs.speed;
    const tParam = Number(searchParams.get("t"));
    if (Number.isFinite(tParam) && tParam > 0 && tParam < (video.duration || Infinity)) {
      video.currentTime = tParam;
    }
    void video.play().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready]);

  /* Subtitles: toggle text tracks to match preference */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    for (const track of Array.from(video.textTracks)) {
      track.mode = track.language === prefs.subtitles ? "showing" : "hidden";
    }
  }, [prefs.subtitles, state.ready]);

  /* Throttled history recording + flush on leave */
  useEffect(() => {
    const write = () => {
      const video = videoRef.current;
      if (!video || !video.duration || video.currentTime < 3) return;
      recordHistory({
        id: item.id,
        progressSec: video.currentTime,
        durationSec: video.duration,
      });
    };
    const interval = setInterval(write, 5000);
    window.addEventListener("pagehide", write);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", write);
      write();
    };
  }, [item.id, recordHistory]);

  /* Keyboard map */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, [role='slider'], [role='listbox']")) return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          engine.togglePlay();
          break;
        case "arrowright":
          e.preventDefault();
          engine.seekBy(10);
          break;
        case "arrowleft":
          e.preventDefault();
          engine.seekBy(-10);
          break;
        case "arrowup": {
          e.preventDefault();
          const v = Math.min(1, (videoRef.current?.volume ?? 1) + 0.1);
          if (videoRef.current) videoRef.current.volume = v;
          prefs.setVolume(v);
          break;
        }
        case "arrowdown": {
          e.preventDefault();
          const v = Math.max(0, (videoRef.current?.volume ?? 1) - 0.1);
          if (videoRef.current) videoRef.current.volume = v;
          prefs.setVolume(v);
          break;
        }
        case "f":
          e.preventDefault();
          void toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "c":
          e.preventDefault();
          setCinema((c) => !c);
          break;
        case "escape":
          if (!document.fullscreenElement) router.push(`/title/${item.slug}`);
          break;
      }
      poke();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.togglePlay, engine.seekBy, toggleFullscreen, item.slug]);

  /* Controls fade with GSAP */
  useGSAP(
    () => {
      const el = controlsRef.current;
      if (!el) return;
      gsap.to(el, {
        autoAlpha: controlsHidden ? 0 : 1,
        y: controlsHidden ? 12 : 0,
        duration: prefersReducedMotion() ? 0 : 0.35,
        ease: "vv-out-quart",
      });
    },
    { scope: containerRef, dependencies: [controlsHidden] },
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    prefs.setMuted(video.muted);
  }, [prefs]);

  const setVolume = useCallback(
    (v: number) => {
      const video = videoRef.current;
      if (video) {
        video.volume = v;
        video.muted = v === 0;
      }
      prefs.setVolume(v);
      prefs.setMuted(v === 0);
    },
    [prefs],
  );

  const showSkipIntro =
    media?.intro &&
    state.currentTime > 1 &&
    state.currentTime < media.intro.endSec &&
    state.playing;

  const title = item.title[locale];

  /* ── Error / embed variants ─────────────────────────────────── */

  if (resolveError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-5 bg-void px-6 text-center">
        <VertyxMark size={44} className="opacity-50" />
        <p className="text-body text-ink-dim">{t.player.providerError}</p>
        <Link href={`/title/${item.slug}`} className="text-caption text-primary-400 hover:text-primary-300">
          ← {t.player.back}
        </Link>
      </div>
    );
  }

  if (media && engine.isEmbed) {
    const src = media.sources[0]?.url ?? "";
    return (
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center gap-6 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <IconButton label={t.player.back} onClick={() => router.push(`/title/${item.slug}`)}>
            <ArrowLeftIcon size={18} />
          </IconButton>
          <div>
            <p className="label-micro">{t.player.nowPlaying}</p>
            <h1 className="font-display text-title font-semibold text-ink">{title}</h1>
          </div>
        </div>
        <EmbedFrame src={src} title={title} />
      </div>
    );
  }

  /* ── Full custom player ─────────────────────────────────────── */

  return (
    <div
      className={`flex min-h-svh items-center justify-center bg-void transition-[padding] duration-[var(--duration-base)] ${
        cinema || isFullscreen ? "p-0" : "p-4 sm:p-8 lg:p-14"
      }`}
    >
      <div
        ref={containerRef}
        onPointerMove={poke}
        onPointerDown={poke}
        className={`group/player relative w-full overflow-hidden bg-black ${
          cinema || isFullscreen
            ? "h-svh rounded-none"
            : "aspect-video max-h-[calc(100svh-7rem)] rounded-panel border border-graphite-800 shadow-card"
        } ${controlsHidden ? "cursor-none" : ""}`}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          playsInline
          crossOrigin="anonymous"
          onClick={engine.togglePlay}
          onDoubleClick={() => void toggleFullscreen()}
        >
          {media?.subtitles.map((track) => (
            <track
              key={track.lang}
              kind="subtitles"
              srcLang={track.lang}
              label={track.label}
              src={track.src}
            />
          ))}
        </video>

        {/* Loading veil — brand mark pulse, no spinner */}
        {(!media || (!state.ready && !state.error)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void">
            <VertyxMark size={48} className="animate-pulse text-ink" />
            <p className="label-micro">{t.player.loading}…</p>
          </div>
        )}

        {state.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void/95">
            <p className="text-body text-ink-dim">{t.player.providerError}</p>
            <Button variant="glass" onClick={() => router.push(`/title/${item.slug}`)}>
              {t.player.back}
            </Button>
          </div>
        )}

        {/* Buffering shimmer on the brand mark */}
        {state.waiting && state.ready && !state.error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <VertyxMark size={40} className="animate-pulse text-ink/80" />
          </div>
        )}

        {/* Skip intro */}
        {showSkipIntro && media?.intro && (
          <div className="absolute bottom-28 right-6 z-20">
            <Button variant="glass" onClick={() => engine.seek(media.intro!.endSec)}>
              {t.player.skipIntro}
            </Button>
          </div>
        )}

        {/* Top gradient + back/title */}
        <div
          ref={controlsRef}
          className="absolute inset-0 flex flex-col justify-between"
        >
          <div className="bg-gradient-to-b from-void/85 to-transparent p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <IconButton label={t.player.back} onClick={() => router.push(`/title/${item.slug}`)} className="text-ink">
                <ArrowLeftIcon size={18} />
              </IconButton>
              <div>
                <p className="label-micro">{t.player.nowPlaying}</p>
                <h1 className="font-display text-[1.05rem] font-semibold text-ink">{title}</h1>
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="space-y-1 bg-gradient-to-t from-void/90 via-void/50 to-transparent p-4 pt-10 sm:p-6">
            <SeekBar
              currentTime={state.currentTime}
              duration={state.duration}
              buffered={state.buffered}
              seed={item.id}
              genre={item.genre}
              onSeek={engine.seek}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <IconButton
                  label={state.playing ? t.player.pause : t.player.play}
                  onClick={engine.togglePlay}
                  className="text-ink"
                >
                  {state.playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                </IconButton>
                <IconButton label={t.player.seekBackward} onClick={() => engine.seekBy(-10)} className="text-ink">
                  <SkipBackIcon size={18} />
                </IconButton>
                <IconButton label={t.player.seekForward} onClick={() => engine.seekBy(10)} className="text-ink">
                  <SkipForwardIcon size={18} />
                </IconButton>
                <VolumeControl
                  volume={prefs.volume}
                  muted={prefs.muted}
                  onVolumeChange={setVolume}
                  onToggleMute={toggleMute}
                />
                <span className="ml-2 hidden font-mono text-micro text-ink-dim sm:inline">
                  {formatTimecode(state.currentTime)}
                  <span className="mx-1 text-ink-faint">/</span>
                  {formatTimecode(state.duration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {engine.levels.length > 0 && (
                  <Menu
                    label={t.player.quality}
                    value={engine.activeLevel}
                    onChange={engine.setLevel}
                    options={[
                      { value: -1, label: t.player.auto },
                      ...engine.levels
                        .slice()
                        .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
                        .map((l) => ({ value: l.id, label: l.label })),
                    ]}
                    trigger={<SettingsIcon size={18} />}
                  />
                )}
                <Menu
                  label={t.player.speed}
                  value={prefs.speed}
                  onChange={(s) => {
                    prefs.setSpeed(s);
                    engine.setRate(s);
                  }}
                  options={SPEEDS.map((s) => ({
                    value: s,
                    label: s === 1 ? t.player.normal : `${s}×`,
                  }))}
                  trigger={<SpeedIcon size={18} />}
                />
                {(media?.subtitles.length ?? 0) > 0 && (
                  <Menu
                    label={t.player.subtitles}
                    value={prefs.subtitles}
                    onChange={prefs.setSubtitles}
                    options={[
                      { value: "off" as const, label: t.player.subtitlesOff },
                      ...(media?.subtitles.map((s) => ({
                        value: s.lang,
                        label: s.label,
                      })) ?? []),
                    ]}
                    trigger={<CaptionsIcon size={18} />}
                  />
                )}
                <IconButton
                  label={cinema ? t.player.exitCinemaMode : t.player.cinemaMode}
                  onClick={() => setCinema((c) => !c)}
                  className={cinema ? "text-primary-400" : "text-ink"}
                >
                  <CinemaIcon size={18} />
                </IconButton>
                <IconButton
                  label={isFullscreen ? t.player.exitFullscreen : t.player.fullscreen}
                  onClick={() => void toggleFullscreen()}
                  className="text-ink"
                >
                  <FullscreenIcon size={18} exit={isFullscreen} />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
