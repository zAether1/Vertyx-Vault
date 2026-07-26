import { NextResponse } from 'next/server';
import { createDemoProfile, createGuestProfile, encodeSessionCookie, cookieOptions, SESSION_COOKIE } from '@/server/session/cookies';
import { hasDatabase, resolveProfileUsername, saveProfile } from '@/server/database/repositories';
import { profileFromSession } from '@/types/profile';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { name?: string; mode?: 'guest' | 'local' };
  const profile = body.mode === 'guest' ? createGuestProfile() : createDemoProfile(body.name ?? 'Usuario Vertyx');
  if (profile.provider === 'local') {
    if (!hasDatabase()) return NextResponse.json({ error: 'El registro requiere la base de datos.' }, { status: 503 });
    const storedProfile = profileFromSession(profile);
    const username = await resolveProfileUsername(profile.id, storedProfile.username);
    await saveProfile({ ...storedProfile, username });
    profile.username = username;
  }
  return NextResponse.json({ state: profile.role === 'guest' ? 'guest' : 'authenticated', profile }, {
    headers: { 'Set-Cookie': `${SESSION_COOKIE}=${encodeSessionCookie(profile)}; ${cookieOptions()}` },
  });
}
