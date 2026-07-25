import { receiveProWebhook } from '@/server/pro/subscription';

export function POST(request: Request) {
  return receiveProWebhook(request);
}
