import { database, ensureVaultSchema, hasDatabase } from '@/server/database/client';
import { readProfileFromRequest } from '@/server/session/cookies';

export type OAuthProvider = 'google' | 'discord';

const configuration = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
  },
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    authorizeUrl: 'https://discord.com/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userUrl: 'https://discord.com/api/users/@me',
    scope: 'identify email',
  },
} as const;

function callbackUrl(request: Request, provider: OAuthProvider) {
  return new URL(`/api/session/oauth/${provider}/callback`, request.url).toString();
}

function ready(provider: OAuthProvider) {
  const item = configuration[provider];
  return Boolean(item.clientId && item.clientSecret && hasDatabase());
}

export async function createOAuthAuthorization(request: Request, provider: OAuthProvider) {
  const profile = readProfileFromRequest(request);
  if (!profile) return { ok: false, ready: ready(provider), message: 'Necesitas una sesión para vincular una cuenta.' };
  if (!ready(provider)) return { ok: false, ready: false, message: 'Configura OAuth y DATABASE_URL antes de vincular una cuenta.' };

  await ensureVaultSchema();
  const state = crypto.randomUUID();
  const sql = database();
  await sql`DELETE FROM vertyx_oauth_states WHERE expires_at < NOW()`;
  await sql`INSERT INTO vertyx_oauth_states (state, provider, user_id, expires_at) VALUES (${state}, ${provider}, ${profile.id}, NOW() + INTERVAL '10 minutes')`;

  const item = configuration[provider];
  const url = new URL(item.authorizeUrl);
  url.searchParams.set('client_id', item.clientId!);
  url.searchParams.set('redirect_uri', callbackUrl(request, provider));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', item.scope);
  url.searchParams.set('state', state);
  return { ok: true, ready: true, provider, authorizationUrl: url.toString(), message: `Redirigiendo a ${provider}.` };
}

type OAuthStateRow = { user_id: string };
type OAuthIdentity = { id: string; email?: string };

export async function completeOAuthAuthorization(request: Request, provider: OAuthProvider) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || !ready(provider)) return new URL('/profile?oauth=failed', url).toString();

  await ensureVaultSchema();
  const sql = database();
  const [stateRow] = await sql`DELETE FROM vertyx_oauth_states WHERE state = ${state} AND provider = ${provider} AND expires_at > NOW() RETURNING user_id` as unknown as OAuthStateRow[];
  if (!stateRow) return new URL('/profile?oauth=expired', url).toString();

  const item = configuration[provider];
  const tokens = await fetch(item.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ client_id: item.clientId!, client_secret: item.clientSecret!, code, grant_type: 'authorization_code', redirect_uri: callbackUrl(request, provider) }),
    cache: 'no-store',
  });
  const tokenPayload = await tokens.json().catch(() => ({})) as { access_token?: string };
  if (!tokens.ok || !tokenPayload.access_token) return new URL('/profile?oauth=failed', url).toString();

  const identityResponse = await fetch(item.userUrl, { headers: { Authorization: `Bearer ${tokenPayload.access_token}`, Accept: 'application/json' }, cache: 'no-store' });
  const identity = await identityResponse.json().catch(() => ({})) as OAuthIdentity;
  if (!identityResponse.ok || !identity.id) return new URL('/profile?oauth=failed', url).toString();

  await sql`INSERT INTO vertyx_oauth_accounts (provider, user_id, provider_user_id, email)
    VALUES (${provider}, ${stateRow.user_id}, ${identity.id}, ${identity.email ?? null})
    ON CONFLICT (provider, user_id) DO UPDATE SET provider_user_id = EXCLUDED.provider_user_id, email = EXCLUDED.email, updated_at = NOW()`;
  return new URL(`/profile?oauth=${provider}`, url).toString();
}

export async function findDiscordUserId(userId: string) {
  if (!hasDatabase()) return undefined;
  await ensureVaultSchema();
  const [row] = await database()`SELECT provider_user_id FROM vertyx_oauth_accounts WHERE provider = 'discord' AND user_id = ${userId} LIMIT 1` as unknown as { provider_user_id: string }[];
  return row?.provider_user_id;
}
