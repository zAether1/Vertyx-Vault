import { cookieOptions, decodeJsonCookie, encodeJsonCookie, parseCookieHeader, readProfileFromRequest } from '@/server/session/cookies';
import { profileFromSession, type AdvancedProfile } from '@/types/profile';

export const PROFILE_COOKIE = 'vertyx_profile';

const profileApiUrl = process.env.VERTYX_PROFILE_API_URL?.replace(/\/$/, '');
const profileApiKey = process.env.VERTYX_PROFILE_API_KEY;

function requestHeaders(request?: Request) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(profileApiKey ? { Authorization: `Bearer ${profileApiKey}` } : {}),
    ...(request?.headers.get('cookie') ? { Cookie: request.headers.get('cookie') ?? '' } : {}),
  };
}

function readPersistedProfile(request: Request): Partial<AdvancedProfile> | undefined {
  const value = parseCookieHeader(request.headers.get('cookie')).get(PROFILE_COOKIE);
  return decodeJsonCookie<Partial<AdvancedProfile>>(value);
}

function stripInlineAsset(value?: string) {
  return value?.startsWith('data:') ? undefined : value;
}

export function sanitizeProfileDraft(profile: Partial<AdvancedProfile>): Partial<AdvancedProfile> {
  return {
    id: typeof profile.id === 'string' ? profile.id : undefined,
    username: profile.username?.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 32),
    displayName: profile.displayName?.trim().slice(0, 80),
    email: profile.email?.trim().slice(0, 160),
    bio: profile.bio?.trim().slice(0, 240),
    status: profile.status?.trim().slice(0, 120),
    pronouns: profile.pronouns?.trim().slice(0, 40),
    country: profile.country?.trim().slice(0, 80),
    theme: profile.theme ? {
      ...profile.theme,
      accent: profile.theme.accent,
      profileColor: profile.theme.profileColor,
      backgroundId: profile.theme.backgroundId,
      avatarFrameId: profile.theme.avatarFrameId,
      avatarUrl: stripInlineAsset(profile.theme.avatarUrl),
      bannerUrl: stripInlineAsset(profile.theme.bannerUrl),
    } : undefined,
    preferences: profile.preferences,
    stats: profile.stats,
    badges: profile.badges,
  };
}

export async function getAdvancedProfile(request: Request): Promise<{ profile: AdvancedProfile; source: 'remote' | 'local' | 'session' }> {
  const sessionProfile = readProfileFromRequest(request);
  const base = profileFromSession(sessionProfile);

  if (profileApiUrl) {
    try {
      const response = await fetch(`${profileApiUrl}/profile`, { headers: requestHeaders(request), cache: 'no-store' });
      if (response.ok) {
        const remoteProfile = await response.json() as AdvancedProfile;
        return { profile: { ...base, ...remoteProfile }, source: 'remote' };
      }
    } catch (error) {
      console.error('[profile-provider]', error);
    }
  }

  const persisted = readPersistedProfile(request);
  return persisted ? { profile: { ...base, ...persisted, stats: { ...base.stats, ...persisted.stats }, theme: { ...base.theme, ...persisted.theme }, preferences: { ...base.preferences, ...persisted.preferences } }, source: 'local' } : { profile: base, source: 'session' };
}

export async function saveAdvancedProfile(request: Request, profile: Partial<AdvancedProfile>): Promise<Response> {
  const current = await getAdvancedProfile(request);
  const draft = sanitizeProfileDraft(profile);
  const next = { ...current.profile, ...draft, stats: { ...current.profile.stats, ...draft.stats }, theme: { ...current.profile.theme, ...draft.theme }, preferences: { ...current.profile.preferences, ...draft.preferences } };

  if (profileApiUrl) {
    try {
      const response = await fetch(`${profileApiUrl}/profile`, { method: 'PUT', headers: requestHeaders(request), body: JSON.stringify(next), cache: 'no-store' });
      if (response.ok) return Response.json({ profile: await response.json() as AdvancedProfile, source: 'remote', persisted: true });
    } catch (error) {
      console.error('[profile-provider:save]', error);
    }
  }

  return Response.json({ profile: next, source: 'local', persisted: false, message: 'Perfil guardado en fallback local hasta conectar base de datos.' }, { headers: { 'Set-Cookie': `${PROFILE_COOKIE}=${encodeJsonCookie(sanitizeProfileDraft(next))}; ${cookieOptions(60 * 60 * 24 * 30)}` } });
}

export async function getPublicProfile(request: Request, username: string): Promise<Response> {
  if (profileApiUrl) {
    try {
      const response = await fetch(`${profileApiUrl}/profiles/${encodeURIComponent(username)}`, { headers: requestHeaders(request), cache: 'no-store' });
      if (response.ok) return Response.json({ profile: await response.json() as AdvancedProfile, source: 'remote' });
      if (response.status === 404) return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });
    } catch (error) {
      console.error('[profile-provider:public]', error);
    }
  }

  const { profile } = await getAdvancedProfile(request);
  if (profile.username !== username) return Response.json({ error: 'Perfil público no disponible en fallback local' }, { status: 404 });
  return Response.json({ profile, source: 'local' });
}
