import { NextResponse } from 'next/server';
import { createDemoProfile, encodeJsonCookie, cookieOptions, SESSION_COOKIE } from '@/server/session/cookies';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { name?: string };
  const profile = createDemoProfile(body.name ?? 'Usuario Vertyx');
  return new Response(JSON.stringify({ state: 'authenticated', profile }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${SESSION_COOKIE}=${encodeJsonCookie(profile)}; ${cookieOptions()}`,
    },
  });
}
