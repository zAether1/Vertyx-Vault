"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { SearchIcon } from "@/components/ui/icons";

/** Inline navbar search with a GSAP-rotating placeholder hint. */
export function NavSearch() {
  const { t } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const hintRef = useRef<HTMLSpanElement | null>(null);
  const hintIndex = useRef(0);
  const hints = t.search.hints.split("|");

  useEffect(() => {
    if (prefersReducedMotion() || hints.length < 2) return;
    const el = hintRef.current;
    if (!el) return;
    el.textContent = hints[0] ?? "";
    const cycle = () => {
      hintIndex.current = (hintIndex.current + 1) % hints.length;
      const tl = gsap.timeline();
      tl.to(el, { yPercent: -60, opacity: 0, duration: 0.3, ease: "power2.in" })
        .add(() => {
          el.textContent = hints[hintIndex.current] ?? "";
        })
        .fromTo(
          el,
          { yPercent: 60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.35, ease: "vv-out-quart" },
        );
    };
    const interval = setInterval(cycle, 3600);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className="relative hidden h-9 w-56 items-center gap-2 rounded-pill border border-graphite-700 bg-graphite-900/70 px-3.5 transition-[border-color,box-shadow,width] duration-[var(--duration-base)] focus-within:w-72 focus-within:border-primary-500/50 focus-within:shadow-glow-purple lg:flex xl:w-64"
    >
      <SearchIcon size={15} className="shrink-0 text-ink-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={t.search.title}
        className="peer w-full bg-transparent text-caption text-ink outline-none"
      />
      {value === "" && !focused && (
        <span
          ref={hintRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-9 text-caption text-ink-faint"
        >
          {hints[0]}
        </span>
      )}
    </form>
  );
}
