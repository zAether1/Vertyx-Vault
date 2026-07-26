import { database, ensureVaultSchema, hasDatabase } from '@/server/database/client';
import { cookieOptions, encodeJsonCookie, readProfileFromRequest, SESSION_COOKIE } from '@/server/session/cookies';
import { findProfile, saveProfile } from '@/server/database/repositories';
import { profileFromSession } from '@/types/profile';
import type { UserProfile } from '@/types/session';
import type { Role } from '@/types/access';

export type OAuthProvider = 'google' | 'discord';
const configuration = { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', userUrl: 'https://openidconnect.googleapis.com/v1/userinfo', scope: 'openid email profile' }, discord: { clientId: process.env.DISCORD_CLIENT_ID, clientSecret: process.env.DISCORD_CLIENT_SECRET, authorizeUrl: 'https://discord.com/oauth2/authorize', tokenUrl: 'https://discord.com/api/oauth2/token', userUrl: 'https://discord.com/api/users/@me', scope: 'identify email guilds.members.read' } } as const;
function callbackUrl(request: Request, provider: OAuthProvider) { return new URL(`/api/session/oauth/${provider}/callback`, request.url).toString(); }
function ready(provider: OAuthProvider) { const item = configuration[provider]; return Boolean(item.clientId && item.clientSecret && hasDatabase()); }
type Identity = { id: string; email?: string; name?: string; global_name?: string; username?: string; picture?: string; avatar?: string | null };
type DiscordGuildMember = { roles?: string[] };
const DISCORD_SUBMISSION_ROLE_ID = process.env.DISCORD_SUBMISSION_ROLE_ID ?? '1513325445196546118';
const DISCORD_ADMIN_ROLE_ID = process.env.DISCORD_ADMIN_ROLE_ID ?? '1530764542378901616';

async function discordRole(accessToken: string): Promise<Role> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) return 'user';
  const response = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }, cache: 'no-store' });
  const member = await response.json().catch(() => ({})) as DiscordGuildMember;
  if (!response.ok) return 'user';
  if (member.roles?.includes(DISCORD_ADMIN_ROLE_ID)) return 'admin';
  if (member.roles?.includes(DISCORD_SUBMISSION_ROLE_ID)) return 'uploader';
  return 'user';
}

export async function createOAuthAuthorization(request: Request, provider: OAuthProvider) {
  if (!ready(provider)) return { ok: false, ready: false, message: 'Configura OAuth y Neon antes de continuar.' };
  await ensureVaultSchema(); const sql = database(); const state = crypto.randomUUID(); const current = readProfileFromRequest(request);
  await sql`DELETE FROM vertyx_oauth_states WHERE expires_at < NOW()`;
  await sql`INSERT INTO vertyx_oauth_states (state, provider, user_id, expires_at) VALUES (${state}, ${provider}, ${current?.id ?? null}, NOW() + INTERVAL '10 minutes')`;
  const item = configuration[provider]; const url = new URL(item.authorizeUrl);
  url.searchParams.set('client_id', item.clientId!); url.searchParams.set('redirect_uri', callbackUrl(request, provider)); url.searchParams.set('response_type', 'code'); url.searchParams.set('scope', item.scope); url.searchParams.set('state', state);
  return { ok: true, ready: true, provider, authorizationUrl: url.toString(), message: `Redirigiendo a ${provider}.` };
}

export async function completeOAuthAuthorization(request: Request, provider: OAuthProvider) {
  const url = new URL(request.url); const code = url.searchParams.get('code'); const state = url.searchParams.get('state');
  if (!code || !state || !ready(provider)) return { redirect: new URL('/profile?oauth=failed', url).toString() };
  await ensureVaultSchema(); const sql = database();
  const [stateRow] = await sql`DELETE FROM vertyx_oauth_states WHERE state = ${state} AND provider = ${provider} AND expires_at > NOW() RETURNING user_id` as unknown as { user_id: string | null }[];
  if (!stateRow) return { redirect: new URL('/profile?oauth=expired', url).toString() };
  const item = configuration[provider]; const tokenResponse = await fetch(item.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams({ client_id: item.clientId!, client_secret: item.clientSecret!, code, grant_type: 'authorization_code', redirect_uri: callbackUrl(request, provider) }), cache: 'no-store' });
  const token = await tokenResponse.json().catch(() => ({})) as { access_token?: string }; if (!tokenResponse.ok || !token.access_token) return { redirect: new URL('/profile?oauth=failed', url).toString() };
  const identityResponse = await fetch(item.userUrl, { headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/json' }, cache: 'no-store' }); const identity = await identityResponse.json().catch(() => ({})) as Identity;
  if (!identityResponse.ok || !identity.id) return { redirect: new URL('/profile?oauth=failed', url).toString() };
  const [linked] = await sql`SELECT user_id FROM vertyx_oauth_accounts WHERE provider = ${provider} AND provider_user_id = ${identity.id} LIMIT 1` as unknown as { user_id: string }[];
  const userId = stateRow.user_id ?? linked?.user_id ?? `user-${crypto.randomUUID()}`;
  const savedProfile = await findProfile(userId);
  const role = provider === 'discord' ? await discordRole(token.access_token) : savedProfile?.role ?? 'user';
  const displayName = identity.name ?? identity.global_name ?? identity.username ?? 'Usuario Vertyx';
  const username = identity.username ?? identity.email?.split('@')[0] ?? displayName;
  const avatarUrl = provider === 'discord' && identity.avatar
    ? `https://cdn.discordapp.com/avatars/${identity.id}/${identity.avatar}.${identity.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
    : identity.picture;
  const profile: UserProfile = { id: userId, name: displayName, username, email: identity.email, avatarUrl, plan: savedProfile?.plan ?? 'free', role, provider, createdAt: savedProfile?.createdAt ?? new Date().toISOString() };
  await saveProfile(savedProfile ? { ...savedProfile, role, security: { ...savedProfile.security, providers: { ...savedProfile.security.providers, discord: provider === 'discord' || savedProfile.security.providers.discord } } } : profileFromSession(profile));
  await sql`INSERT INTO vertyx_oauth_accounts (provider, user_id, provider_user_id, email) VALUES (${provider}, ${userId}, ${identity.id}, ${identity.email ?? null}) ON CONFLICT (provider, user_id) DO UPDATE SET provider_user_id = EXCLUDED.provider_user_id, email = EXCLUDED.email, updated_at = NOW()`;
  return { redirect: new URL('/profile?oauth=success', url).toString(), profile };
}
export function sessionCookie(profile: UserProfile) { return `${SESSION_COOKIE}=${encodeJsonCookie(profile)}; ${cookieOptions()}`; }
export async function findDiscordUserId(userId: string) { if (!hasDatabase()) return undefined; await ensureVaultSchema(); const [row] = await database()`SELECT provider_user_id FROM vertyx_oauth_accounts WHERE provider = 'discord' AND user_id = ${userId} LIMIT 1` as unknown as { provider_user_id: string }[]; return row?.provider_user_id; }
