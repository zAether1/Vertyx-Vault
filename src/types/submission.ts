export const SUBMISSION_STATUSES = ['pending', 'reviewing', 'approved', 'rejected', 'hidden', 'published'] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type SubmissionKind = 'movie' | 'series';
export type PlaybackKind = 'hls' | 'mp4' | 'dash' | 'embed';

export interface EpisodeEntry {
  id: string;
  title: string;
  season: number;
  episode: number;
  playbackUrl: string;
  playbackKind: PlaybackKind;
}

export interface ContentSubmissionInput {
  title: string;
  description: string;
  category: string;
  kind: SubmissionKind;
  genres: string[];
  year?: string;
  language?: string;
  quality?: string;
  provider: string;
  playbackKind: PlaybackKind;
  playbackUrl: string;
  coverUrl?: string;
  notes?: string;
  episodes?: EpisodeEntry[];
}

export interface ContentSubmission extends ContentSubmissionInput {
  id: string;
  status: SubmissionStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
