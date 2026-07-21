"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { ButtonLink } from "@/components/ui/ButtonLink";

function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M10.3 19.5a2 2 0 0 0 3.4 0" />
    </svg>
  );
}

/** Notification bell with badge and a glass dropdown notice card. */
export function NoticeBell() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useGSAP(
    () => {
      if (!open || prefersReducedMotion()) return;
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -8, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "vv-out-expo" },
      );
    },
    { scope: rootRef, dependencies: [open] },
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t.notices.label}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setSeen(true);
        }}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-pill text-ink-dim transition-colors duration-[var(--duration-fast)] hover:bg-graphite-800 hover:text-ink"
      >
        <BellIcon />
        {!seen && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary-400 shadow-glow-purple"
          />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t.notices.title}
          className="glass absolute right-0 top-12 z-50 w-72 rounded-panel p-4 shadow-card"
          data-i18n-region
        >
          <p className="label-micro mb-2">{t.notices.title}</p>
          <p className="font-display text-caption font-semibold text-ink">✦ {t.brand.name}</p>
          <p className="mt-1.5 text-caption text-ink-dim">{t.notices.body}</p>
          <div className="mt-3">
            <ButtonLink href="/search" size="md" variant="glass" onClick={() => setOpen(false)}>
              {t.notices.cta}
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
