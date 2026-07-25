import { SESSION_COOKIE } from '@/server/session/cookies';

export async function POST() {
  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly` },
  });
}
