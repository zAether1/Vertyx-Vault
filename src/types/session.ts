export type SessionState = 'guest' | 'authenticated';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  plan?: string;
  createdAt?: string;
}

export interface SessionSnapshot {
  state: SessionState;
  profile?: UserProfile;
  librarySyncEnabled: boolean;
  localLibraryEnabled: boolean;
  catalogProviderEnabled: boolean;
}
