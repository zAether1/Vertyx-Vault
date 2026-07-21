# Vertyx Vault

A cinematic platform to discover and organize audiovisual content. Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and GSAP.

## Stack

- **Next.js + React + TypeScript** (strict, `noUncheckedIndexedAccess`)
- **Tailwind CSS v4** — CSS-first design system in `src/app/globals.css` (`@theme`)
- **GSAP 3.15** — all premium plugins (ScrollSmoother, SplitText, Flip, Draggable…) via the single entry point `src/lib/gsap`
- **zustand** — favorites / history / player prefs with localStorage persistence
- **hls.js** — adaptive streaming (dynamically imported only on the player route)

## Commands

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # strict TypeScript check
```

## Architecture notes

- **i18n**: bilingual EN/ES. `src/lib/i18n/dictionaries/en.ts` is the source-of-truth type; `es.ts` must match structurally (compile error otherwise). Locale persists in the `vv-locale` cookie and is read server-side in the root layout (`<html lang>`, no flash).
- **Video providers** (`src/providers/`): the platform stores no video files. `VideoProvider` adapters resolve authorized sources (`mp4 | hls | dash | iframe`) through a priority registry with failover. The player consumes only `ResolvedMedia`.
- **Poster art**: `GenerativePoster` renders deterministic seeded SVG art (brand-constrained hues + genre motifs + grain) — zero network requests, SSR-stable.
- **Motion**: import GSAP only from `@/lib/gsap`. Every non-trivial animation runs inside `gsap.matchMedia` under `prefers-reduced-motion: no-preference`; reduced-motion users get a native-scroll, fade-only experience.
- **ScrollSmoother** wraps page content in `AppShell`; fixed chrome (navbar, cursor, grain, intro) lives outside the wrapper. The `/watch` route opts out entirely.
