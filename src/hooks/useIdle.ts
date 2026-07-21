"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Tracks user inactivity inside a container (pointer/keys reset the timer). */
export function useIdle(timeoutMs: number, enabled = true) {
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poke = useCallback(() => {
    setIdle(false);
    if (timer.current) clearTimeout(timer.current);
    if (!enabled) return;
    timer.current = setTimeout(() => setIdle(true), timeoutMs);
  }, [timeoutMs, enabled]);

  useEffect(() => {
    poke();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [poke]);

  return { idle, poke };
}
