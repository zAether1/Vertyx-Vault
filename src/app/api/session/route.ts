import { NextResponse } from 'next/server';
import { getSessionSnapshot } from '@/server/session';

export async function GET(request: Request) {
  return NextResponse.json(await getSessionSnapshot(request));
}
