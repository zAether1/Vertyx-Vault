"use client";

import { useCallback, useRef, useState } from "react";
import { formatTimecode } from "@/lib/format";
import { GenerativePoster } from "@/components/cards/GenerativePoster";
import type { GenreId } from "@/data/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  seed: string;
  genre: GenreId;
  onSeek: (time: number) => void;
}

/**
 * Seek bar: buffered range, played range, hover thumbnail preview with
 * timecode, pointer scrubbing and full keyboard support (slider pattern).
 */
export function SeekBar({ currentTime, duration, buffered, seed, genre, onSeek }: SeekBarProps) {
  const { t } = useI18n();
  const barRef = useRef<HTMLDivElement | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0;
  const hoverTime = hoverX !== null && duration > 0 ? hoverX * duration : null;

  const positionFromEvent = useCallback((clientX: number) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    const p = positionFromEvent(e.clientX);
    setHoverX(p);
    if (scrubbing && duration > 0) onSeek(p * duration);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setScrubbing(true);
    if (duration > 0) onSeek(positionFromEvent(e.clientX) * duration);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (duration <= 0) return;
    const step = e.shiftKey ? 30 : 5;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onSeek(Math.min(duration, currentTime + step));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(duration - 0.5);
    }
  };

  return (
    <div className="group/seek relative w-full px-1">
      {/* Thumbnail preview */}
      {hoverTime !== null && (
        <div
          className="pointer-events-none absolute bottom-6 z-10 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/seek:opacity-100"
          style={{ left: `${(hoverX ?? 0) * 100}%` }}
          aria-hidden="true"
        >
          <div className="overflow-hidden rounded-lg border border-graphite-600 shadow-card">
            <div className="relative h-20 w-36">
              <GenerativePoster
                seed={`${seed}-frame-${Math.floor((hoverTime / Math.max(1, duration)) * 12)}`}
                genre={genre}
                mode="backdrop"
                className="h-full w-full"
              />
            </div>
          </div>
          <p className="mt-1.5 text-center font-mono text-micro text-ink">
            {formatTimecode(hoverTime)}
          </p>
        </div>
      )}

      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label={t.a11y.progressLabel}
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(currentTime)}
        aria-valuetext={`${formatTimecode(currentTime)} ${t.common.of} ${formatTimecode(duration)}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          setHoverX(null);
          setScrubbing(false);
        }}
        onPointerDown={onPointerDown}
        onPointerUp={() => setScrubbing(false)}
        onKeyDown={onKeyDown}
        className="relative flex h-6 cursor-pointer items-center"
      >
        <div className="relative h-1 w-full overflow-hidden rounded-pill bg-graphite-700/80 transition-[height] duration-150 group-hover/seek:h-1.5">
          <div
            className="absolute inset-y-0 left-0 bg-graphite-600"
            style={{ width: `${bufferedPct}%` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-400"
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-ink opacity-0 shadow-glow-purple transition-opacity duration-150 group-hover/seek:opacity-100"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
