import { NextResponse } from 'next/server';
import { completeOAuthAuthorization, sessionCookie } from '@/server/session/oauth';
export async function GET(request: Request) { const result = await completeOAuthAuthorization(request, 'discord'); const response = NextResponse.redirect(result.redirect); if (result.profile) response.headers.set('Set-Cookie', sessionCookie(result.profile)); return response; }
