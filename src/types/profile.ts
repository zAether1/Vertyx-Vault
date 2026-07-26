import type { AuthProvider, UserProfile } from '@/types/session';
import type { Role } from '@/types/access';

export type ProfilePlan = 'free' | 'pro';
export type DateTimeFormat = '24h' | '12h' | 'relative';
export type PlaybackQuality = 'auto' | '4k' | '1080p' | '720p';
export type ProfileVisibility = 'public' | 'followers' | 'private';

export interface ProfileBadge {
  id: string;
  label: string;
  tone: 'violet' | 'blue' | 'gold' | 'graphite';
  animated?: boolean;
  proOnly?: boolean;
}

export interface ProfileTheme {
  accent: string;
  profileColor: string;
  backgroundId: string;
  avatarFrameId: string;
  bannerUrl?: string;
  avatarUrl?: string;
  bannerFocus: { x: number; y: number; zoom: number };
  avatarFocus: { x: number; y: number; zoom: number };
}

export interface ProfilePreferences {
  theme: 'system' | 'dark' | 'cinematic';
  language: string;
  region?: string;
  timezone: string;
  dateTimeFormat: DateTimeFormat;
  playbackQuality: PlaybackQuality;
  autoplay: boolean;
  notifications: boolean;
  privacy: {
    visibility: ProfileVisibility;
    showActivity: boolean;
    showFavorites: boolean;
    showBadges: boolean;
    showOnline: boolean;
  };
}

export interface ProfileSecurityState {
  email: string;
  passwordUpdatedAt?: string;
  providers: Record<Extract<AuthProvider, 'google' | 'discord'>, boolean>;
  twoFactorEnabled: boolean;
  sessions: Array<{ id: string; device: string; location: string; current?: boolean; lastSeenAt: string }>;
  loginHistory: Array<{ id: string; provider: AuthProvider; device: string; status: 'success' | 'blocked'; at: string }>;
}

export interface ProfileStats {
  moviesWatched: number;
  seriesWatched: number;
  hoursPlayed: number;
  favorites: number;
  saved: number;
  submitted: number;
  approved: number;
  memberDays: number;
  streakDays: number;
}

export interface AdvancedProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  status: string;
  pronouns?: string;
  role: Role;
  plan: ProfilePlan;
  provider: AuthProvider;
  createdAt: string;
  lastSeenAt: string;
  country?: string;
  theme: ProfileTheme;
  preferences: ProfilePreferences;
  security: ProfileSecurityState;
  stats: ProfileStats;
  badges: ProfileBadge[];
}

export interface ProfileIntegrationStatus {
  auth: boolean;
  blob: boolean;
  payments: boolean;
  discord: boolean;
  moderation: boolean;
  activity: boolean;
}

export function profileFromSession(profile?: UserProfile): AdvancedProfile {
  const createdAt = profile?.createdAt ?? new Date().toISOString();
  const seed = (profile?.id ?? 'guest').replace(/[^a-z0-9]/gi, '').slice(-6).toLowerCase() || 'vault';
  const role = profile?.role ?? 'guest';
  const plan = profile?.plan ?? 'free';
  const usernameSource = profile?.username ?? profile?.name;
  const username = usernameSource ? usernameSource.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 24) || `user.${seed}` : `guest.${seed}`;

  return {
    id: profile?.id ?? `guest-${seed}`,
    username,
    displayName: profile?.name ?? 'Invitado Vertyx',
    email: profile?.email ?? 'sin-correo@vertyx.local',
    bio: 'Curador de historias, atmósferas y descubrimientos audiovisuales.',
    status: plan === 'pro' ? 'Explorando estrenos antes que nadie' : 'Organizando mi vault personal',
    pronouns: '',
    role,
    plan,
    provider: profile?.provider ?? 'guest',
    createdAt,
    lastSeenAt: new Date().toISOString(),
    country: '',
    theme: {
      accent: '#8f5bd7',
      profileColor: '#102245',
      backgroundId: plan === 'pro' ? 'nocturne' : 'obsidian',
      avatarFrameId: plan === 'pro' ? 'prism' : 'minimal',
      avatarUrl: profile?.avatarUrl,
      bannerFocus: { x: 50, y: 42, zoom: 1 },
      avatarFocus: { x: 50, y: 50, zoom: 1 },
    },
    preferences: {
      theme: 'cinematic',
      language: 'es',
      region: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateTimeFormat: '24h',
      playbackQuality: 'auto',
      autoplay: true,
      notifications: true,
      privacy: { visibility: 'public', showActivity: true, showFavorites: false, showBadges: true, showOnline: true },
    },
    security: {
      email: profile?.email ?? '',
      providers: { google: profile?.provider === 'google', discord: profile?.provider === 'discord' },
      twoFactorEnabled: false,
      sessions: [{ id: 'current', device: 'Este navegador', location: 'Sesión local', current: true, lastSeenAt: new Date().toISOString() }],
      loginHistory: [{ id: 'login-current', provider: profile?.provider ?? 'guest', device: 'Este navegador', status: 'success', at: new Date().toISOString() }],
    },
    stats: { moviesWatched: 0, seriesWatched: 0, hoursPlayed: 0, favorites: 0, saved: 0, submitted: 0, approved: 0, memberDays: Math.max(1, Math.ceil((Date.now() - Date.parse(createdAt)) / 86400000)), streakDays: 1 },
    badges: [
      ...(plan === 'pro' ? [{ id: 'pro', label: 'Pro', tone: 'gold' as const, animated: true }] : []),
    ],
  };
}
