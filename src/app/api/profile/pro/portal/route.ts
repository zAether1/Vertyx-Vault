import { openProPortal } from '@/server/pro/subscription';

export function POST(request: Request) {
  return openProPortal(request);
}
