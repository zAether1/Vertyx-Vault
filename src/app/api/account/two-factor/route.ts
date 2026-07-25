import { toggleTwoFactor } from '@/server/account/security';

export function POST(request: Request) {
  return toggleTwoFactor(request);
}
