import { NextResponse } from 'next/server';
import { findCatalogTitle, getRecommendations } from '@/server/catalog';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await findCatalogTitle(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const recommendations = await getRecommendations(id);
  return NextResponse.json({ item, recommendations });
}
