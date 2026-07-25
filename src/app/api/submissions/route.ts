import { NextResponse } from 'next/server';
import { can } from '@/server/access/permissions';
import { encodeJsonCookie, cookieOptions, readProfileFromRequest, SUBMISSIONS_COOKIE } from '@/server/session/cookies';
import { readLocalSubmissions } from '@/server/submissions/local-cookie';
import type { ContentSubmissionInput, PlaybackKind, SubmissionKind } from '@/types/submission';

const playbackKinds: PlaybackKind[] = ['hls', 'mp4', 'dash', 'embed'];

function sanitize(body: Partial<ContentSubmissionInput>): ContentSubmissionInput | undefined {
  const title = body.title?.trim().slice(0, 120);
  const description = body.description?.trim().slice(0, 2000);
  const category = body.category?.trim().slice(0, 60);
  const provider = body.provider?.trim().slice(0, 80);
  const playbackUrl = body.playbackUrl?.trim();
  if (!title || !description || !category || !provider || !playbackUrl || !URL.canParse(playbackUrl)) return undefined;
  if (body.kind !== 'movie' && body.kind !== 'series') return undefined;
  if (!body.playbackKind || !playbackKinds.includes(body.playbackKind)) return undefined;
  return {
    title, description, category, provider, playbackUrl,
    kind: body.kind as SubmissionKind,
    playbackKind: body.playbackKind,
    genres: Array.isArray(body.genres) ? body.genres.filter((genre): genre is string => typeof genre === 'string').map((genre) => genre.trim().slice(0, 40)).filter(Boolean).slice(0, 8) : [],
    year: body.year?.trim().slice(0, 4),
    language: body.language?.trim().slice(0, 40),
    quality: body.quality?.trim().slice(0, 40),
    coverUrl: body.coverUrl?.trim() && URL.canParse(body.coverUrl) ? body.coverUrl.trim() : undefined,
    notes: body.notes?.trim().slice(0, 1000),
  };
}

export async function GET(request: Request) {
  const profile = readProfileFromRequest(request);
  if (!profile) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: readLocalSubmissions(request).filter((item) => item.submittedBy === profile.id) });
}

export async function POST(request: Request) {
  const profile = readProfileFromRequest(request);
  if (!profile || !can(profile.role, 'submission:create')) return NextResponse.json({ error: 'Necesitas una cuenta para enviar contenido.' }, { status: 403 });
  const input = sanitize(await request.json().catch(() => ({})) as Partial<ContentSubmissionInput>);
  if (!input) return NextResponse.json({ error: 'Revisa los campos obligatorios y la URL del reproductor.' }, { status: 400 });
  const items = readLocalSubmissions(request);
  const item = { ...input, id: `submission-${crypto.randomUUID()}`, status: 'pending' as const, submittedBy: profile.id, submittedAt: new Date().toISOString() };
  const snapshot = [item, ...items].slice(0, 12);
  return NextResponse.json({ item }, { status: 201, headers: { 'Set-Cookie': `${SUBMISSIONS_COOKIE}=${encodeJsonCookie(snapshot)}; ${cookieOptions(60 * 60 * 24 * 14)}` } });
}
