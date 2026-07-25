import { NextResponse } from 'next/server';
import { getCatalogFacets } from '@/server/catalog/facets';

export async function GET() {
  return NextResponse.json(await getCatalogFacets());
}
