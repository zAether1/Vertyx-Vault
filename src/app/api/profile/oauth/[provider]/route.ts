import { NextResponse } from 'next/server';
import { createOAuthIntent } from '@/server/infrastructure/actions';
import type { OAuthProvider } from '@/types/infrastructure';

const providers: OAuthProvider[] = ['google', 'discord'];

export async function POST(_: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!providers.includes(provider as OAuthProvider)) return NextResponse.json({ ok: false, ready: false, message: 'Proveedor no soportado.' }, { status: 400 });
  return NextResponse.json(createOAuthIntent(provider as OAuthProvider));
}
