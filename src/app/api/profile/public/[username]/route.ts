import { getPublicProfile } from '@/server/profile/store';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return getPublicProfile(request, decodeURIComponent(username));
}
