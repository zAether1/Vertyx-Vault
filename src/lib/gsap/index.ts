"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";

/**
 * Single GSAP entry point for the whole app.
 * Import gsap ONLY from "@/lib/gsap" — never from "gsap" directly.
 */
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText,
  Flip,
  Observer,
  Draggable,
  InertiaPlugin,
  CustomEase,
);

gsap.defaults({ ease: "power3.out", duration: 0.32 });

/* Custom eases mirroring the CSS --ease-* tokens */
CustomEase.create("vv-out-expo", "0.16, 1, 0.3, 1");
CustomEase.create("vv-out-quart", "0.25, 1, 0.5, 1");
CustomEase.create("vv-in-out-soft", "0.65, 0, 0.35, 1");

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const FULL_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  Flip,
  Observer,
  Draggable,
  CustomEase,
};
