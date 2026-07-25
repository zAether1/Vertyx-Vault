import { NextResponse } from 'next/server';
import { hasLibrarySyncProvider, readLibrarySnapshot, writeLibrarySnapshot } from '@/server/library/sync';
import { hasDatabase, readLibrary, saveLibrary, saveProfile } from '@/server/database/repositories';
import { encodeJsonCookie, cookieOptions, LIBRARY_COOKIE, readProfileFromRequest, sanitizeLibrarySnapshot } from '@/server/session/cookies';
import { profileFromSession } from '@/types/profile';
import { readLocalLibrarySnapshot } from '@/server/library/local-cookie';
import type { LibrarySnapshot } from '@/types/library';

const emptySnapshot: LibrarySnapshot = { favorites: [], history: [], progress: [] };

export async function GET(request: Request) {
  const profile = readProfileFromRequest(request);
  if (hasDatabase() && profile) {
    try {
      return NextResponse.json(await readLibrary(profile.id) ?? emptySnapshot);
    } catch (error) {
      console.error('[library-database]', error);
    }
  }
  if (hasLibrarySyncProvider()) {
    const snapshot = await readLibrarySnapshot(request);
    return NextResponse.json(snapshot ?? emptySnapshot);
  }
  return NextResponse.json(readLocalLibrarySnapshot(request));
}

export async function PUT(request: Request) {
  const snapshot = sanitizeLibrarySnapshot(await request.json().catch(() => ({})) as Partial<LibrarySnapshot>);
  const profile = readProfileFromRequest(request);
  if (hasDatabase() && profile) {
    try {
      await saveProfile(profileFromSession(profile));
      await saveLibrary(profile.id, snapshot);
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('[library-database:save]', error);
    }
  }
  if (hasLibrarySyncProvider()) {
    await writeLibrarySnapshot(snapshot, request);
    return new Response(null, { status: 204 });
  }
  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': `${LIBRARY_COOKIE}=${encodeJsonCookie(snapshot)}; ${cookieOptions()}` },
  });
}
