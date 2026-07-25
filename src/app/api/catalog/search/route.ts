import { NextResponse } from 'next/server';
import { searchCatalog } from '@/server/catalog';
import type { CatalogKind } from '@/types/catalog';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind') ?? undefined;
  const items = await searchCatalog({
    query: searchParams.get('q') ?? undefined,
    kind: kind === 'movie' || kind === 'series' || kind === 'tv' || kind === 'all' ? kind as CatalogKind | 'tv' | 'all' : undefined,
    genre: searchParams.get('genre') ?? undefined,
    year: searchParams.get('year') ?? undefined,
  });
  return NextResponse.json({ items });
}
