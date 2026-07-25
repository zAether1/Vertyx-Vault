import { syncProDiscord } from '@/server/pro/subscription';

export function POST(request: Request) {
  return syncProDiscord(request);
}
