import { closeOtherSessions } from '@/server/account/security';

export function POST(request: Request) {
  return closeOtherSessions(request);
}
