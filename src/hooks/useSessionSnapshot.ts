'use client';

import { useEffect, useState } from 'react';
import type { SessionSnapshot } from '@/types/session';

const guestSession: SessionSnapshot = {
  state: 'guest',
  librarySyncEnabled: false,
  catalogProviderEnabled: false,
};

export function useSessionSnapshot() {
  const [session, setSession] = useState<SessionSnapshot>(guestSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/session', { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<SessionSnapshot> : guestSession)
      .then((snapshot) => setSession(snapshot))
      .catch(() => setSession(guestSession))
      .finally(() => setReady(true));
    return () => controller.abort();
  }, []);

  return { session, ready };
}
