import { getSecurityOverview } from '@/server/account/security';

export function GET(request: Request) {
  return getSecurityOverview(request);
}
