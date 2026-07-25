import { hasRemoteCatalogProvider } from '@/server/catalog/remote';
import { hasLibrarySyncProvider } from '@/server/library/sync';
import { readProfileFromRequest } from '@/server/session/cookies';
import type { SessionSnapshot, UserProfile } from '@/types/session';

const authUrl = process.env.VERTYX_AUTH_API_URL?.replace(/\/$/, '');
const authKey = process.env.VERTYX_AUTH_API_KEY;

function requestHeaders(request?: Request) {
  return {
    Accept: 'application/json',
    ...(authKey ? { Authorization: `Bearer ${authKey}` } : {}),
    ...(request?.headers.get('cookie') ? { Cookie: request.headers.get('cookie') ?? '' } : {}),
  };
}

export function hasAuthProvider() {
  return Boolean(authUrl);
}

function baseSession(): Omit<SessionSnapshot, 'state' | 'profile'> {
  return {
    librarySyncEnabled: hasLibrarySyncProvider(),
    localLibraryEnabled: true,
    catalogProviderEnabled: hasRemoteCatalogProvider(),
  };
}

export async function getSessionSnapshot(request?: Request): Promise<SessionSnapshot> {
  const base = baseSession();
  const localProfile = readProfileFromRequest(request);
  if (localProfile) return { ...base, state: localProfile.role === 'guest' ? 'guest' : 'authenticated', profile: localProfile };

  if (!authUrl) return { ...base, state: 'guest' };

  try {
    const response = await fetch(`${authUrl}/session`, {
      headers: requestHeaders(request),
      cache: 'no-store',
    });
    if (response.status === 401 || response.status === 404) return { ...base, state: 'guest' };
    if (!response.ok) throw new Error(`Auth provider responded with ${response.status}`);
    const profile = await response.json() as UserProfile;
    return { ...base, state: 'authenticated', profile };
  } catch (error) {
    console.error('[session-provider]', error);
    return { ...base, state: 'guest' };
  }
}
