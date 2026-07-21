"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, FULL_MOTION_QUERY } from "@/lib/gsap";

/**
 * Remounts on every navigation → gentle cinematic page entrance
 * (rise + fade + blur dissolve), then refreshes scroll triggers.
 */
export default function Template({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(
          rootRef.current,
          { y: 24, opacity: 0, filter: "blur(6px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "vv-out-expo",
            clearProps: "filter,transform",
            onComplete: () => ScrollTrigger.refresh(),
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
