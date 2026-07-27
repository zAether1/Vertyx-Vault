import { NextResponse } from 'next/server';
import { updateSubmissionPlayback } from '@/server/infrastructure/actions';
import type { EpisodeEntry } from '@/types/submission';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json().catch(() => ({})) as { playbackUrl?: string; playbackKind?: 'hls' | 'mp4' | 'dash' | 'embed'; episodes?: EpisodeEntry[] };
  const { id } = await params;
  if (!body.playbackUrl || !body.playbackKind) {
    return NextResponse.json({ ok: false, ready: true, message: 'Faltan datos de reproducción.' }, { status: 400 });
  }
  return updateSubmissionPlayback(request, id, body.playbackUrl, body.playbackKind, body.episodes);
}

