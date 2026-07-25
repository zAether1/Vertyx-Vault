import { updatePassword } from '@/server/account/security';

export function POST(request: Request) {
  return updatePassword(request);
}
