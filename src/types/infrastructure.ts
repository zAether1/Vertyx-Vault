import type { Role } from '@/types/access';
import type { AuthProvider } from '@/types/session';
import type { ContentSubmission, EpisodeEntry, PlaybackKind, SubmissionStatus } from '@/types/submission';

export type OAuthProvider = Extract<AuthProvider, 'google' | 'discord'>;
export type ProfileAssetKind = 'avatar' | 'banner' | 'cover';
export type ModerationAction = 'approve' | 'reject' | 'review' | 'hide' | 'publish';

export interface ActionResult {
  ok: boolean;
  ready: boolean;
  message: string;
  next?: string;
}

export interface OAuthActionResult extends ActionResult {
  provider: OAuthProvider;
  authorizationUrl?: string;
}

export interface ProfileAssetIntent extends ActionResult {
  kind: ProfileAssetKind;
  uploadUrl?: string;
  maxBytes: number;
  acceptedTypes: string[];
}

export interface ProCheckoutIntent extends ActionResult {
  priceUsd: 2;
  interval: 'month';
  checkoutUrl?: string;
  benefits: string[];
}

export interface ModerationResult extends ActionResult {
  item?: ContentSubmission;
  status?: SubmissionStatus;
}

export interface ManagedUserSummary {
  id: string;
  name: string;
  role: Role;
  plan: 'free' | 'pro';
  status: 'active' | 'suspended' | 'pending';
  lastSeenAt: string;
}

export interface CatalogAdminEntry {
  id: string;
  title: string;
  kind: 'movie' | 'series';
  description?: string;
  category?: string;
  provider?: string;
  playbackUrl: string;
  playbackKind: PlaybackKind;
  coverUrl?: string;
  year?: string;
  language?: string;
  quality?: string;
  genres: string[];
  notes?: string;
  episodes?: EpisodeEntry[];
  status: SubmissionStatus | 'catalog';
  submittedAt: string;
}

export interface AdminOverview {
  metrics: Array<{ label: string; value: string; detail: string }>;
  users: ManagedUserSummary[];
  activity: Array<{ id: string; label: string; at: string; tone: 'violet' | 'blue' | 'gold' | 'graphite' }>;
  submissions: ContentSubmission[];
  catalogEntries: CatalogAdminEntry[];
}

export function statusFromModerationAction(action: ModerationAction): SubmissionStatus {
  const map: Record<ModerationAction, SubmissionStatus> = {
    approve: 'approved',
    reject: 'rejected',
    review: 'reviewing',
    hide: 'hidden',
    publish: 'published',
  };
  return map[action];
}
