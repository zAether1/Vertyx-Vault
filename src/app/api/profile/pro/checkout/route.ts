import { createProCheckout } from '@/server/pro/subscription';

export function POST(request: Request) {
  return createProCheckout(request);
}
