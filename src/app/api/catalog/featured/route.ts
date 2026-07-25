import { NextResponse } from 'next/server';
import { getFeaturedTitles } from '@/server/catalog/collections';

export async function GET() {
  return NextResponse.json({ items: await getFeaturedTitles() });
}
