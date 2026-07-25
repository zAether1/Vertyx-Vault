import { NextResponse } from 'next/server';
import { hasLibrarySyncProvider, readLibrarySnapshot, writeLibrarySnapshot } from '@/server/library/sync';
import { encodeJsonCookie, cookieOptions, LIBRARY_COOKIE, sanitizeLibrarySnapshot } from '@/server/session/cookies';
import { readLocalLibrarySnapshot } from '@/server/library/local-cookie';
import type { LibrarySnapshot } from '@/types/library';

export async function GET(request: Request) {
  if (hasLibrarySyncProvider()) {
    const snapshot = await readLibrarySnapshot(request);
    return NextResponse.json(snapshot ?? { favorites: [], history: [], progress: [] });
  }
  return NextResponse.json(readLocalLibrarySnapshot(request));
}

export async function PUT(request: Request) {
  const snapshot = sanitizeLibrarySnapshot(await request.json().catch(() => ({})) as Partial<LibrarySnapshot>);
  if (hasLibrarySyncProvider()) {
    await writeLibrarySnapshot(snapshot, request);
    return new Response(null, { status: 204 });
  }
  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': `${LIBRARY_COOKIE}=${encodeJsonCookie(snapshot)}; ${cookieOptions()}` },
  });
}
