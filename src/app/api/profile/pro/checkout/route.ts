import { NextResponse } from 'next/server';
import { createProCheckoutIntent } from '@/server/infrastructure/actions';

export function POST() {
  return NextResponse.json(createProCheckoutIntent());
}
