"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function useFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (targetRef.current) {
        await targetRef.current.requestFullscreen();
      }
    } catch {
      // Fullscreen can be denied (iframe policies, user agent) — fail quietly.
    }
  }, [targetRef]);

  return { isFullscreen, toggle };
}
