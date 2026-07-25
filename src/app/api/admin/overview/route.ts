import { NextResponse } from 'next/server';
import { getAdminOverview } from '@/server/infrastructure/actions';

export function GET(request: Request) {
  const overview = getAdminOverview(request);
  return overview instanceof Response ? overview : NextResponse.json(overview);
}
