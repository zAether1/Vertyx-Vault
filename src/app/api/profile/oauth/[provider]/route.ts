import { NextResponse } from 'next/server';
import { createOAuthAuthorization, type OAuthProvider } from '@/server/session/oauth';

const providers: OAuthProvider[] = ['google', 'discord'];

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!providers.includes(provider as OAuthProvider)) return NextResponse.json({ ok: false, ready: false, message: 'Proveedor no soportado.' }, { status: 400 });
  return NextResponse.json(await createOAuthAuthorization(request, provider as OAuthProvider));
}
