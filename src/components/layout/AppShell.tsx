"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, ScrollSmoother, ScrollTrigger, FULL_MOTION_QUERY } from "@/lib/gsap";

/**
 * App shell: creates ScrollSmoother (full-motion users only; reduced-motion
 * falls back to native scroll). Fixed chrome (navbar/cursor/intro/grain) must
 * live OUTSIDE this wrapper — it only wraps the scrollable page content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWatch = pathname?.startsWith("/watch");

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION_QUERY, () => {
      // The player page manages its own viewport; no smoother there.
      if (isWatch) return;
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.1,
        smoothTouch: false,
        effects: true,
      });
      return () => smoother.kill();
    });
    return () => mm.revert();
  }, [isWatch, pathname]);

  useGSAP(() => {
    // New page → recalc triggers after layout settles.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (isWatch) {
    return <main id="main">{children}</main>;
  }

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
