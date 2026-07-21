"use client";

import { useEffect, useState } from "react";

/**
 * One-shot session flag (e.g. "intro already played this session").
 * Returns [ready, alreadySet, markSet] — ready avoids SSR/client mismatch.
 */
export function useSessionFlag(key: string) {
  const [ready, setReady] = useState(false);
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    try {
      setIsSet(sessionStorage.getItem(key) === "1");
    } catch {
      setIsSet(true); // storage unavailable → behave as already set
    }
    setReady(true);
  }, [key]);

  const mark = () => {
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    setIsSet(true);
  };

  return { ready, isSet, mark };
}
