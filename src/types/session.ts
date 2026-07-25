import type { Role } from '@/types/access';

export type SessionState = 'guest' | 'authenticated';
export type AuthProvider = 'guest' | 'local' | 'google' | 'discord';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  plan?: 'free' | 'pro';
  role: Role;
  provider: AuthProvider;
  createdAt?: string;
}

export interface SessionSnapshot {
  state: SessionState;
  profile?: UserProfile;
  librarySyncEnabled: boolean;
  localLibraryEnabled: boolean;
  catalogProviderEnabled: boolean;
}
