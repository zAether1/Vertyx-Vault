"use client";

import { useRef } from "react";
import { gsap, useGSAP, FULL_MOTION_QUERY } from "@/lib/gsap";

/**
 * Custom cursor: a small dot plus a trailing ring that swells over
 * interactive elements. Only rendered for fine pointers with full motion.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`(pointer: fine) and ${FULL_MOTION_QUERY}`, () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) return;

      document.documentElement.classList.add("vv-custom-cursor");
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

      const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

      let visible = false;
      const onMove = (e: PointerEvent) => {
        if (!visible) {
          visible = true;
          gsap.to([dot, ring], { opacity: 1, duration: 0.25 });
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);

        const target = e.target as Element | null;
        const interactive = target?.closest(
          "a, button, [role='button'], [role='option'], input, [data-cursor='expand']",
        );
        gsap.to(ring, {
          scale: interactive ? 1.9 : 1,
          borderColor: interactive ? "rgb(165 131 255 / 0.9)" : "rgb(165 131 255 / 0.45)",
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        visible = false;
        gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
      };
      const onDown = () => gsap.to(ring, { scale: 0.8, duration: 0.15 });
      const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: "vv-out-expo" });

      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);

      return () => {
        document.documentElement.classList.remove("vv-custom-cursor");
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
      };
    });
    return () => mm.revert();
  });

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-1.5 w-1.5 rounded-full bg-ink [@media(pointer:fine)]:block"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-8 w-8 rounded-full border border-primary-400/45 [@media(pointer:fine)]:block"
      />
      <style>{`.vv-custom-cursor, .vv-custom-cursor a, .vv-custom-cursor button { cursor: none; }`}</style>
    </>
  );
}
