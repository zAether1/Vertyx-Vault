import { getAdvancedProfile, saveAdvancedProfile } from '@/server/profile/store';
import type { AdvancedProfile } from '@/types/profile';

export async function GET(request: Request) {
  return Response.json(await getAdvancedProfile(request));
}

export async function PUT(request: Request) {
  const profile = await request.json().catch(() => ({})) as Partial<AdvancedProfile>;
  return saveAdvancedProfile(request, profile);
}
