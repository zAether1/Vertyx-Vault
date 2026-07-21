"use client";

import { useRef } from "react";
import { gsap, useGSAP, FULL_MOTION_QUERY } from "@/lib/gsap";

/**
 * Ambient background: three slow drifting light blobs, transform-only tweens.
 * Paused automatically while the tab is hidden.
 */
export function AmbientBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]");
        const tweens = blobs.map((blob, i) =>
          gsap.to(blob, {
            x: () => gsap.utils.random(-120, 120),
            y: () => gsap.utils.random(-80, 80),
            scale: () => gsap.utils.random(0.85, 1.2),
            duration: () => gsap.utils.random(18, 28),
            delay: i * 2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
          }),
        );

        const onVisibility = () => {
          const hidden = document.hidden;
          tweens.forEach((tw) => (hidden ? tw.pause() : tw.resume()));
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
          document.removeEventListener("visibilitychange", onVisibility);
          tweens.forEach((tw) => tw.kill());
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        data-blob
        className="absolute -left-40 top-[-10%] h-[34rem] w-[34rem] rounded-full bg-primary-900/50 blur-[140px]"
      />
      <div
        data-blob
        className="absolute right-[-15%] top-[30%] h-[28rem] w-[28rem] rounded-full bg-accent-700/30 blur-[130px]"
      />
      <div
        data-blob
        className="absolute bottom-[-20%] left-[30%] h-[30rem] w-[30rem] rounded-full bg-primary-700/25 blur-[150px]"
      />
    </div>
  );
}
