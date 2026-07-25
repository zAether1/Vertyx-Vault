import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
let schemaPromise: Promise<void> | undefined;

export function hasDatabase() {
  return Boolean(connectionString);
}

function client() {
  if (!connectionString) throw new Error('DATABASE_URL is not configured.');
  return neon(connectionString);
}

export async function ensureVaultSchema() {
  if (!hasDatabase()) return;
  schemaPromise ??= (async () => {
    const sql = client();
    await sql`CREATE TABLE IF NOT EXISTS vertyx_profiles (
      user_id TEXT PRIMARY KEY,
      username VARCHAR(32) NOT NULL UNIQUE,
      visibility VARCHAR(16) NOT NULL DEFAULT 'public',
      profile JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS vertyx_libraries (
      user_id TEXT PRIMARY KEY REFERENCES vertyx_profiles(user_id) ON DELETE CASCADE,
      snapshot JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS vertyx_submissions (
      id TEXT PRIMARY KEY,
      submitted_by TEXT NOT NULL,
      status VARCHAR(16) NOT NULL,
      submission JSONB NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ
    )`;
    await sql`CREATE INDEX IF NOT EXISTS vertyx_submissions_status_idx ON vertyx_submissions(status, submitted_at DESC)`;
    await sql`CREATE TABLE IF NOT EXISTS vertyx_activity (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      type VARCHAR(64) NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS vertyx_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type VARCHAR(64) NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  })();
  return schemaPromise;
}

export function database() {
  return client();
}
