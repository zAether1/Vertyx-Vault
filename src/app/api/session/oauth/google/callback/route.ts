import { NextResponse } from 'next/server';
import { completeOAuthAuthorization } from '@/server/session/oauth';

export async function GET(request: Request) {
  return NextResponse.redirect(await completeOAuthAuthorization(request, 'google'));
}
