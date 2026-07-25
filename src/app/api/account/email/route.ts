import { updateEmail } from '@/server/account/security';

export function POST(request: Request) {
  return updateEmail(request);
}
