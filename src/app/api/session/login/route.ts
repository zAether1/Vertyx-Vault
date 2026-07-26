import { createDemoProfile, createGuestProfile, encodeSessionCookie, cookieOptions, SESSION_COOKIE } from '@/server/session/cookies';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { name?: string; mode?: 'guest' | 'local' };
  const profile = body.mode === 'guest' ? createGuestProfile() : createDemoProfile(body.name ?? 'Usuario Vertyx');
  return new Response(JSON.stringify({ state: profile.role === 'guest' ? 'guest' : 'authenticated', profile }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${SESSION_COOKIE}=${encodeSessionCookie(profile)}; ${cookieOptions()}`,
    },
  });
}
