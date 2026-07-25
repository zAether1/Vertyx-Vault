import type { AdvancedProfile } from '@/types/profile';

export const PROFILE_BACKGROUNDS = [
  { id: 'obsidian', label: 'Obsidian', proOnly: false, preview: 'radial-gradient(circle at 20% 20%, rgba(143,91,215,.32), transparent 18rem), linear-gradient(135deg,#08070d,#14121b 52%,#071326)' },
  { id: 'midnight', label: 'Midnight Blue', proOnly: false, preview: 'radial-gradient(circle at 78% 28%, rgba(41,89,166,.36), transparent 18rem), linear-gradient(135deg,#071326,#14121b 55%,#08070d)' },
  { id: 'nocturne', label: 'Nocturne Pro', proOnly: true, preview: 'radial-gradient(circle at 68% 24%, rgba(201,168,240,.24), transparent 16rem), radial-gradient(circle at 18% 84%, rgba(41,89,166,.30), transparent 20rem), #08070d' },
  { id: 'aurora', label: 'Aurora Pro', proOnly: true, preview: 'linear-gradient(120deg, rgba(95,49,143,.34), rgba(16,34,69,.26) 44%, rgba(8,7,13,.96))' },
] as const;

export const AVATAR_FRAMES = [
  { id: 'minimal', label: 'Minimal', proOnly: false },
  { id: 'glass', label: 'Glass', proOnly: false },
  { id: 'prism', label: 'Prism Pro', proOnly: true },
  { id: 'eclipse', label: 'Eclipse Pro', proOnly: true },
] as const;

export const PROFILE_ACCENTS = ['#8f5bd7', '#6d8cff', '#c9a8f0', '#4f46e5', '#2dd4bf', '#f5c76b'] as const;

export function profilePublicUrl(username: string) {
  return `/u/${encodeURIComponent(username)}`;
}

export function serializePublicProfile(profile: AdvancedProfile) {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    status: profile.status,
    role: profile.role,
    plan: profile.plan,
    createdAt: profile.createdAt,
    lastSeenAt: profile.preferences.privacy.showOnline ? profile.lastSeenAt : undefined,
    country: profile.country,
    theme: profile.theme,
    badges: profile.preferences.privacy.showBadges ? profile.badges : [],
    stats: profile.preferences.privacy.showActivity ? profile.stats : undefined,
  };
}
