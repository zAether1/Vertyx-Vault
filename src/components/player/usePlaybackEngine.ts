"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type Hls from "hls.js";
import type { ResolvedMedia, VideoSource } from "@/providers/types";

export interface QualityLevel {
  id: number; // -1 = auto
  label: string;
  height?: number;
}

export interface PlaybackState {
  ready: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  buffered: number; // seconds buffered ahead-of-zero (max buffered end)
  waiting: boolean;
  error: string | null;
}

/**
 * Playback engine: attaches the right pipeline for the first playable source
 * (native MP4, hls.js or native HLS). The UI consumes only this hook's state
 * and controls — it never touches source internals.
 */
export function usePlaybackEngine(
  videoRef: RefObject<HTMLVideoElement | null>,
  media: ResolvedMedia | null,
) {
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlaybackState>({
    ready: false,
    playing: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    waiting: false,
    error: null,
  });
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [activeLevel, setActiveLevel] = useState(-1);

  const source: VideoSource | null = media?.sources[0] ?? null;
  const isEmbed = source?.kind === "iframe";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source || source.kind === "iframe") return;

    let cancelled = false;

    const onLoadedMetadata = () =>
      setState((s) => ({ ...s, ready: true, duration: video.duration || 0 }));
    const onTimeUpdate = () =>
      setState((s) => ({ ...s, currentTime: video.currentTime }));
    const onPlay = () => setState((s) => ({ ...s, playing: true }));
    const onPause = () => setState((s) => ({ ...s, playing: false }));
    const onWaiting = () => setState((s) => ({ ...s, waiting: true }));
    const onPlaying = () => setState((s) => ({ ...s, waiting: false, playing: true }));
    const onProgress = () => {
      const b = video.buffered;
      setState((s) => ({
        ...s,
        buffered: b.length > 0 ? b.end(b.length - 1) : 0,
      }));
    };
    const onError = () =>
      setState((s) => ({ ...s, error: "media-error", waiting: false }));
    const onDurationChange = () =>
      setState((s) => ({ ...s, duration: video.duration || 0 }));

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("progress", onProgress);
    video.addEventListener("error", onError);
    video.addEventListener("durationchange", onDurationChange);

    const attach = async () => {
      if (source.kind === "mp4" || source.kind === "dash") {
        // DASH demo fallback: treated as direct URL (dashjs is an extension point).
        video.src = source.url;
        return;
      }
      // HLS
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source.url; // Safari native HLS
        return;
      }
      const { default: HlsCtor } = await import("hls.js");
      if (cancelled) return;
      if (!HlsCtor.isSupported()) {
        setState((s) => ({ ...s, error: "hls-unsupported" }));
        return;
      }
      const hls = new HlsCtor({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(source.url);
      hls.attachMedia(video);
      hls.on(HlsCtor.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        const parsed: QualityLevel[] = hls.levels.map((lvl, i) => ({
          id: i,
          label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)} kbps`,
          height: lvl.height,
        }));
        setLevels(parsed);
      });
      hls.on(HlsCtor.Events.LEVEL_SWITCHED, (_evt, data) => {
        if (!cancelled && hls.autoLevelEnabled === false) setActiveLevel(data.level);
      });
      hls.on(HlsCtor.Events.ERROR, (_evt, data) => {
        if (cancelled) return;
        if (data.fatal) {
          if (data.type === "networkError") hls.startLoad();
          else if (data.type === "mediaError") hls.recoverMediaError();
          else setState((s) => ({ ...s, error: "hls-fatal" }));
        }
      });
    };

    void attach();

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("error", onError);
      video.removeEventListener("durationchange", onDurationChange);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute("src");
      video.load();
      setLevels([]);
      setActiveLevel(-1);
      setState({
        ready: false,
        playing: false,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        waiting: false,
        error: null,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.url, source?.kind]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }, [videoRef]);

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(time)) return;
      video.currentTime = Math.min(Math.max(0, time), video.duration || time);
      setState((s) => ({ ...s, currentTime: video.currentTime }));
    },
    [videoRef],
  );

  const seekBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      seek(video.currentTime + delta);
    },
    [videoRef, seek],
  );

  const setLevel = useCallback((id: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = id; // -1 → auto
    setActiveLevel(id);
  }, []);

  const setRate = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (video) video.playbackRate = rate;
    },
    [videoRef],
  );

  return { state, levels, activeLevel, isEmbed, togglePlay, seek, seekBy, setLevel, setRate };
}
