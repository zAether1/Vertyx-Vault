import { createHmac, timingSafeEqual } from 'node:crypto';
import type { LibrarySnapshot } from '@/types/library';
import type { UserProfile } from '@/types/session';

export const SESSION_COOKIE = 'vertyx_session';
export const LIBRARY_COOKIE = 'vertyx_library';
export const SUBMISSIONS_COOKIE = 'vertyx_submissions';

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

function sessionSecret() {
  return process.env.VERTYX_SESSION_SECRET ?? process.env.DATABASE_URL;
}

function sessionSignature(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function encodeSessionCookie(profile: UserProfile) {
  const secret = sessionSecret();
  if (!secret) throw new Error('Missing server-side session secret.');
  const payload = encodeJsonCookie(profile);
  return `${payload}.${sessionSignature(payload, secret)}`;
}

export function decodeSessionCookie(value?: string | null): UserProfile | undefined {
  const secret = sessionSecret();
  if (!value || !secret) return undefined;
  const separator = value.lastIndexOf('.');
  if (separator < 1) return undefined;
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = sessionSignature(payload, secret);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return undefined;
  return decodeJsonCookie<UserProfile>(payload);
}

export function cookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function readProfileFromRequest(request?: Request): UserProfile | undefined {
  const cookies = parseCookieHeader(request?.headers.get('cookie'));
  return decodeSessionCookie(cookies.get(SESSION_COOKIE));
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
    id: `user-${crypto.randomUUID()}`,
    name: trimmed,
    plan: 'free',
    role: 'user',
    provider: 'local',
    createdAt: new Date().toISOString(),
  };
}

export function createGuestProfile(): UserProfile {
  const id = crypto.randomUUID();
  return {
    id: `guest-${id}`,
    name: `Invitado ${id.slice(0, 6).toUpperCase()}`,
    plan: 'free',
    role: 'guest',
    provider: 'guest',
    createdAt: new Date().toISOString(),
  };
}

