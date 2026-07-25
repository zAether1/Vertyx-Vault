import { NextResponse } from 'next/server';
import { getTopTitles } from '@/server/catalog/collections';

export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get('kind');
  const safeKind = kind === 'movie' || kind === 'series' ? kind : undefined;
  return NextResponse.json({ items: await getTopTitles(safeKind) });
}
