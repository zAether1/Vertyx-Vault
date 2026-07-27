import { database, ensureVaultSchema, hasDatabase } from '@/server/database/client';
import type { LibrarySnapshot } from '@/types/library';
import type { AdvancedProfile } from '@/types/profile';
import type { ContentSubmission, PlaybackKind, SubmissionStatus, EpisodeEntry } from '@/types/submission';

export { hasDatabase };

type ProfileRow = { profile: AdvancedProfile };
type LibraryRow = { snapshot: LibrarySnapshot };
type SubmissionRow = { submission: ContentSubmission };

export async function findProfile(userId: string) {
  if (!hasDatabase()) return undefined;
  await ensureVaultSchema();
  const sql = database();
  const [row] = await sql`SELECT profile FROM vertyx_profiles WHERE user_id = ${userId} LIMIT 1` as unknown as ProfileRow[];
  return row?.profile;
}

export async function findPublicProfile(username: string) {
  if (!hasDatabase()) return undefined;
  await ensureVaultSchema();
  const sql = database();
  const [row] = await sql`SELECT profile FROM vertyx_profiles WHERE username = ${username.toLowerCase()} AND visibility = 'public' LIMIT 1` as unknown as ProfileRow[];
  return row?.profile;
}

export async function resolveProfileUsername(userId: string, username: string) {
  if (!hasDatabase()) return username;
  await ensureVaultSchema();
  const sql = database();
  const normalized = username.toLowerCase().slice(0, 32) || 'user';
  const [existing] = await sql`SELECT user_id FROM vertyx_profiles WHERE username = ${normalized} LIMIT 1` as unknown as { user_id: string }[];
  if (!existing || existing.user_id === userId) return normalized;
  const suffix = userId.replace(/[^a-z0-9]/gi, '').slice(-6).toLowerCase() || 'vault';
  const candidate = `${normalized.slice(0, Math.max(1, 32 - suffix.length - 1))}-${suffix}`;
  const [candidateOwner] = await sql`SELECT user_id FROM vertyx_profiles WHERE username = ${candidate} LIMIT 1` as unknown as { user_id: string }[];
  return !candidateOwner || candidateOwner.user_id === userId ? candidate : `${candidate.slice(0, 25)}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function saveProfile(profile: AdvancedProfile) {
  if (!hasDatabase()) return false;
  await ensureVaultSchema();
  const sql = database();
  await sql`INSERT INTO vertyx_profiles (user_id, username, visibility, profile)
    VALUES (${profile.id}, ${profile.username.toLowerCase()}, ${profile.preferences.privacy.visibility}, ${JSON.stringify(profile)}::jsonb)
    ON CONFLICT (user_id) DO UPDATE SET
      username = EXCLUDED.username,
      visibility = EXCLUDED.visibility,
      profile = EXCLUDED.profile,
      updated_at = NOW()`;
  return true;
}

export async function listProfiles() {
  if (!hasDatabase()) return [];
  await ensureVaultSchema();
  const rows = await database()`SELECT profile FROM vertyx_profiles ORDER BY updated_at DESC LIMIT 500` as unknown as ProfileRow[];
  return rows.map((row) => row.profile);
}

export async function updateProfileRole(userId: string, role: AdvancedProfile['role']) {
  const profile = await findProfile(userId);
  if (!profile) return undefined;
  const next = { ...profile, role };
  await saveProfile(next);
  return next;
}

export async function readLibrary(userId: string) {
  if (!hasDatabase()) return undefined;
  await ensureVaultSchema();
  const sql = database();
  const [row] = await sql`SELECT snapshot FROM vertyx_libraries WHERE user_id = ${userId} LIMIT 1` as unknown as LibraryRow[];
  return row?.snapshot;
}

export async function saveLibrary(userId: string, snapshot: LibrarySnapshot) {
  if (!hasDatabase()) return false;
  await ensureVaultSchema();
  const sql = database();
  await sql`INSERT INTO vertyx_libraries (user_id, snapshot) VALUES (${userId}, ${JSON.stringify(snapshot)}::jsonb)
    ON CONFLICT (user_id) DO UPDATE SET snapshot = EXCLUDED.snapshot, updated_at = NOW()`;
  return true;
}

export async function listSubmissions(userId: string, canReview: boolean) {
  if (!hasDatabase()) return undefined;
  await ensureVaultSchema();
  const sql = database();
  const rows = canReview
    ? await sql`SELECT submission FROM vertyx_submissions ORDER BY submitted_at DESC LIMIT 200` as unknown as SubmissionRow[]
    : await sql`SELECT submission FROM vertyx_submissions WHERE submitted_by = ${userId} ORDER BY submitted_at DESC LIMIT 200` as unknown as SubmissionRow[];
  return rows.map((row) => row.submission);
}

export async function createSubmission(item: ContentSubmission) {
  if (!hasDatabase()) return false;
  await ensureVaultSchema();
  const sql = database();
  await sql`INSERT INTO vertyx_submissions (id, submitted_by, status, submission, submitted_at)
    VALUES (${item.id}, ${item.submittedBy}, ${item.status}, ${JSON.stringify(item)}::jsonb, ${item.submittedAt}::timestamptz)`;
  return true;
}

export async function upsertSubmission(item: ContentSubmission) {
  if (!hasDatabase()) return false;
  await ensureVaultSchema();
  const sql = database();
  await sql`INSERT INTO vertyx_submissions (id, submitted_by, status, submission, submitted_at)
    VALUES (${item.id}, ${item.submittedBy}, ${item.status}, ${JSON.stringify(item)}::jsonb, ${item.submittedAt}::timestamptz)
    ON CONFLICT (id) DO UPDATE SET
      submitted_by = EXCLUDED.submitted_by,
      status = EXCLUDED.status,
      submission = EXCLUDED.submission,
      reviewed_by = NULL,
      reviewed_at = NULL`;
  return true;
}

export async function listAllSubmissions() {
  if (!hasDatabase()) return [];
  await ensureVaultSchema();
  const rows = await database()`SELECT submission FROM vertyx_submissions ORDER BY submitted_at DESC LIMIT 200` as unknown as SubmissionRow[];
  return rows.map((row) => row.submission);
}

export async function listPublishedSubmissions() {
  if (!hasDatabase()) return [];
  await ensureVaultSchema();
  const rows = await database()`SELECT submission FROM vertyx_submissions WHERE status = 'published' ORDER BY reviewed_at DESC NULLS LAST, submitted_at DESC LIMIT 200` as unknown as SubmissionRow[];
  return rows.map((row) => row.submission);
}

export async function updateSubmission(id: string, status: SubmissionStatus, reviewer: string) {
  if (!hasDatabase()) return undefined;
  await ensureVaultSchema();
  const sql = database();
  const [existing] = await sql`SELECT submission FROM vertyx_submissions WHERE id = ${id} LIMIT 1` as unknown as SubmissionRow[];
  if (!existing) return undefined;
  const item: ContentSubmission = { ...existing.submission, status, reviewedBy: reviewer, reviewedAt: new Date().toISOString() };
  await sql`UPDATE vertyx_submissions SET status = ${status}, submission = ${JSON.stringify(item)}::jsonb, reviewed_by = ${reviewer}, reviewed_at = NOW() WHERE id = ${id}`;
  return item;
}

export async function updateSubmissionSource(id: string, playbackUrl: string, playbackKind: PlaybackKind, episodes?: EpisodeEntry[]) {
  if (!hasDatabase()) return undefined;
  await ensureVaultSchema();
  const sql = database();
  const [existing] = await sql`SELECT submission FROM vertyx_submissions WHERE id = ${id} LIMIT 1` as unknown as SubmissionRow[];
  if (!existing) return undefined;
  const item: ContentSubmission = { ...existing.submission, playbackUrl, playbackKind, episodes };
  await sql`UPDATE vertyx_submissions SET submission = ${JSON.stringify(item)}::jsonb WHERE id = ${id}`;
  return item;
}
