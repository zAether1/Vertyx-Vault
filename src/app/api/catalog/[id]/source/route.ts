import { NextResponse } from 'next/server';
import { getPlaybackSource } from '@/server/catalog';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const source = await getPlaybackSource({ titleId: id, episodeId: searchParams.get('episodeId') ?? undefined });
  if (!source) return NextResponse.json({ source: null, status: 'unavailable', reason: 'Este título aún no tiene una fuente de video autorizada.' }, { status: 200 });
  return NextResponse.json({ source });
}
