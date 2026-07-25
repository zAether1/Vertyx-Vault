import { deleteAccount } from '@/server/account/security';

export function POST(request: Request) {
  return deleteAccount(request);
}
