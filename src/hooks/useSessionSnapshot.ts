'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SessionSnapshot } from '@/types/session';

const guestSession: SessionSnapshot = {
  state: 'guest',
  librarySyncEnabled: false,
  localLibraryEnabled: true,
  catalogProviderEnabled: false,
};

export function useSessionSnapshot() {
  const [session, setSession] = useState<SessionSnapshot>(guestSession);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/session');
    const snapshot = response.ok ? await response.json() as SessionSnapshot : guestSession;
    setSession(snapshot);
    setReady(true);
    return snapshot;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/session', { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<SessionSnapshot> : guestSession)
      .then((snapshot) => setSession(snapshot))
      .catch(() => setSession(guestSession))
      .finally(() => setReady(true));
    return () => controller.abort();
  }, []);

  return { session, ready, refresh };
}
