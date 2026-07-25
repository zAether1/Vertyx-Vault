import { NextResponse } from 'next/server';
import { getProfileIntegrationStatus } from '@/server/profile/status';

export function GET() {
  return NextResponse.json(getProfileIntegrationStatus());
}
