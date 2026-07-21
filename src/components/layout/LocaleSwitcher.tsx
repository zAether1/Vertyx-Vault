"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/config";

/** EN | ES pill with a sliding active indicator. */
export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = indicatorRef.current;
      if (!el) return;
      gsap.to(el, {
        xPercent: locale === "en" ? 0 : 100,
        duration: 0.32,
        ease: "vv-out-expo",
      });
    },
    { scope: rootRef, dependencies: [locale] },
  );

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    // Micro-crossfade of localized regions for a polished switch.
    gsap.fromTo(
      "[data-i18n-region]",
      { opacity: 0.35 },
      { opacity: 1, duration: 0.24, ease: "power2.out", overwrite: "auto" },
    );
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={t.profile.language}
      className="relative grid h-8 w-[104px] grid-cols-2 items-center rounded-pill border border-graphite-700 bg-graphite-900/70 text-micro font-mono uppercase tracking-[0.08em]"
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-1/2 rounded-pill bg-graphite-700/80"
        style={{ transform: locale === "es" ? "translateX(100%)" : undefined }}
      />
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={locale === l}
          className={`relative z-10 h-full cursor-pointer rounded-pill transition-colors duration-[var(--duration-fast)] ${
            locale === l ? "text-ink" : "text-ink-faint hover:text-ink-dim"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
