import { NextResponse } from 'next/server';
import { createAssetIntent } from '@/server/infrastructure/actions';
import type { ProfileAssetKind } from '@/types/infrastructure';

const kinds: ProfileAssetKind[] = ['avatar', 'banner', 'cover'];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { kind?: ProfileAssetKind };
  const kind = body.kind && kinds.includes(body.kind) ? body.kind : 'avatar';
  return NextResponse.json(createAssetIntent(kind));
}
