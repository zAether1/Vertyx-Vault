import { NextResponse } from 'next/server';
import { getAdminOverview } from '@/server/infrastructure/actions';

export async function GET(request: Request) {
  const overview = await getAdminOverview(request);
  return overview instanceof Response ? overview : NextResponse.json(overview);
}
