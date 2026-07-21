"use client";

import { useRef } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { IconButton } from "@/components/ui/IconButton";
import { VolumeIcon } from "@/components/ui/icons";

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, muted, onVolumeChange, onToggleMute }: VolumeControlProps) {
  const { t } = useI18n();
  const barRef = useRef<HTMLDivElement | null>(null);
  const effective = muted ? 0 : volume;

  const fromEvent = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return volume;
    const rect = bar.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  return (
    <div className="group/vol flex items-center">
      <IconButton
        label={muted ? t.player.unmute : t.player.mute}
        onClick={onToggleMute}
        className="text-ink"
      >
        <VolumeIcon size={18} level={effective} />
      </IconButton>
      <div className="w-0 overflow-hidden transition-[width] duration-[var(--duration-base)] group-hover/vol:w-24 group-focus-within/vol:w-24">
        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label={t.a11y.volumeLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(effective * 100)}
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            onVolumeChange(fromEvent(e.clientX));
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) onVolumeChange(fromEvent(e.clientX));
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onVolumeChange(Math.min(1, effective + 0.1));
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onVolumeChange(Math.max(0, effective - 0.1));
            }
          }}
          className="relative mx-2 flex h-6 cursor-pointer items-center"
        >
          <div className="h-1 w-full rounded-pill bg-graphite-700">
            <div
              className="h-full rounded-pill bg-ink"
              style={{ width: `${effective * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
