import type { LibrarySnapshot } from '@/types/library';
import type { UserProfile } from '@/types/session';

export const SESSION_COOKIE = 'vertyx_session';
export const LIBRARY_COOKIE = 'vertyx_library';

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function encodeJsonCookie(value: unknown) {
  return toBase64Url(JSON.stringify(value));
}

export function decodeJsonCookie<T>(value?: string | null): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(fromBase64Url(value)) as T;
  } catch {
    return undefined;
  }
}

export function parseCookieHeader(header?: string | null) {
  const cookies = new Map<string, string>();
  header?.split(';').forEach((part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey || !rest.length) return;
    cookies.set(rawKey, rest.join('='));
  });
  return cookies;
}

export function cookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`;
}

export function readProfileFromRequest(request?: Request): UserProfile | undefined {
  const cookies = parseCookieHeader(request?.headers.get('cookie'));
  return decodeJsonCookie<UserProfile>(cookies.get(SESSION_COOKIE));
}

export function readLibraryFromRequest(request?: Request): LibrarySnapshot | undefined {
  const cookies = parseCookieHeader(request?.headers.get('cookie'));
  return decodeJsonCookie<LibrarySnapshot>(cookies.get(LIBRARY_COOKIE));
}

export function sanitizeLibrarySnapshot(snapshot: Partial<LibrarySnapshot>): LibrarySnapshot {
  const favorites = Array.isArray(snapshot.favorites) ? snapshot.favorites.filter((entry) => typeof entry.id === 'string').slice(0, 100) : [];
  const history = Array.isArray(snapshot.history) ? snapshot.history.filter((entry) => typeof entry.id === 'string').slice(0, 100) : [];
  const progress = Array.isArray(snapshot.progress) ? snapshot.progress.filter((entry) => typeof entry.id === 'string' && Number.isFinite(entry.currentTime) && Number.isFinite(entry.duration)).slice(0, 100) : [];
  return { favorites, history, progress };
}

export function createDemoProfile(name: string): UserProfile {
  const trimmed = name.trim().slice(0, 60) || 'Usuario Vertyx';
  return {
    id: `local-${crypto.randomUUID()}`,
    name: trimmed,
    plan: 'Local',
    createdAt: new Date().toISOString(),
  };
}

