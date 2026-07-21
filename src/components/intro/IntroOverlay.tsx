"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { useSessionFlag } from "@/hooks/useSessionFlag";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { VertyxMark } from "@/components/ui/icons";

/**
 * Cinematic first-load intro: mark draws in, wordmark letters rise through a
 * mask, tagline fades, then the whole overlay wipes upward. Plays once per
 * session; Esc or click skips; reduced motion gets a short plain fade.
 */
export function IntroOverlay() {
  const { ready, isSet, mark } = useSessionFlag("vv-intro-played");
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const { t } = useI18n();

  const finish = useCallback(() => {
    mark();
    setDone(true);
  }, [mark]);

  const skip = useCallback(() => {
    const tl = tlRef.current;
    if (tl && tl.progress() < 1) {
      tl.progress(1); // jump to the end — onComplete fires finish()
    } else {
      finish();
    }
  }, [finish]);

  useEffect(() => {
    if (!ready || isSet || done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, isSet, done, skip]);

  useGSAP(
    () => {
      if (!ready || isSet || done) return;
      const root = rootRef.current;
      if (!root) return;

      document.documentElement.style.overflow = "hidden";
      const release = () => {
        document.documentElement.style.overflow = "";
      };

      if (prefersReducedMotion()) {
        const tl = gsap.timeline({
          onComplete: () => {
            release();
            finish();
          },
        });
        tl.to(root, { opacity: 0, duration: 0.3, delay: 0.9 });
        tlRef.current = tl;
        return () => release();
      }

      const split = new SplitText("[data-intro-word]", { type: "chars", mask: "chars" });

      const tl = gsap.timeline({
        defaults: { ease: "vv-out-expo" },
        onComplete: () => {
          release();
          finish();
        },
      });

      tl.fromTo(
        "[data-intro-mark]",
        { scale: 0.6, opacity: 0, filter: "blur(12px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.9 },
      )
        .from(
          split.chars,
          { yPercent: 110, opacity: 0, stagger: 0.035, duration: 0.7 },
          "-=0.35",
        )
        .fromTo(
          "[data-intro-tagline]",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.25",
        )
        .to("[data-intro-glow]", { opacity: 0.7, duration: 0.6 }, "<")
        .to({}, { duration: 0.55 }) // hold
        .to("[data-intro-stage]", {
          y: -40,
          opacity: 0,
          filter: "blur(8px)",
          duration: 0.5,
          ease: "power2.in",
        })
        .to(root, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.7,
          ease: "vv-in-out-soft",
        });

      tlRef.current = tl;
      return () => {
        release();
        split.revert();
      };
    },
    { scope: rootRef, dependencies: [ready, isSet, done] },
  );

  if (!ready || isSet || done) return null;

  return (
    <div
      ref={rootRef}
      onClick={skip}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-void"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      role="presentation"
    >
      <div
        data-intro-glow
        aria-hidden="true"
        className="absolute h-[26rem] w-[26rem] rounded-full bg-primary-700/25 opacity-0 blur-[120px]"
      />
      <div data-intro-stage className="relative flex flex-col items-center gap-5 px-6 text-center">
        <div data-intro-mark className="text-ink">
          <VertyxMark size={64} />
        </div>
        <p
          data-intro-word
          className="font-display text-display-md font-semibold text-ink sm:text-display-lg"
        >
          Vertyx Vault
        </p>
        <p data-intro-tagline className="label-micro !text-ink-dim">
          {t.brand.tagline}
        </p>
      </div>
      <span className="absolute bottom-8 right-8 label-micro opacity-60">
        {t.intro.skip} · Esc
      </span>
    </div>
  );
}
