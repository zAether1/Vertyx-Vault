import { NextResponse } from 'next/server';
import { hasLibrarySyncProvider, readLibrarySnapshot, writeLibrarySnapshot } from '@/server/library/sync';
import type { LibrarySnapshot } from '@/types/library';

export async function GET(request: Request) {
  if (!hasLibrarySyncProvider()) return new Response(null, { status: 204 });
  const snapshot = await readLibrarySnapshot(request);
  return NextResponse.json(snapshot ?? { favorites: [], history: [], progress: [] });
}

export async function PUT(request: Request) {
  if (!hasLibrarySyncProvider()) return new Response(null, { status: 204 });
  const snapshot = await request.json() as LibrarySnapshot;
  await writeLibrarySnapshot(snapshot, request);
  return new Response(null, { status: 204 });
}
