export const SUBMISSION_STATUSES = ['pending', 'reviewing', 'approved', 'rejected'] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type SubmissionKind = 'movie' | 'series';
export type PlaybackKind = 'hls' | 'mp4' | 'dash' | 'embed';

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
}

export interface ContentSubmission extends ContentSubmissionInput {
  id: string;
  status: SubmissionStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
