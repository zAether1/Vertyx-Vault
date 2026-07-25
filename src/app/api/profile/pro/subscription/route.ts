import { getProSubscription } from '@/server/pro/subscription';

export function GET(request: Request) {
  return getProSubscription(request);
}
