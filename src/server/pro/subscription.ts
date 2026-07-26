import { database, ensureVaultSchema, hasDatabase } from '@/server/database/client';
import { readProfileFromRequest } from '@/server/session/cookies';
import { findDiscordUserId } from '@/server/session/oauth';
import { PRO_BENEFITS, type ProActionResult, type ProStatus, type ProSubscriptionState } from '@/types/pro';

const paypalBaseUrl = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const paypalReady = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_WEBHOOK_ID && hasDatabase());
const discordReady = Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_GUILD_ID && process.env.DISCORD_PRO_ROLE_ID);

type SubscriptionRow = { subscription_id: string; plan_id: string; status: string; current_period_end: string | null };
type PayPalSubscription = { id: string; status?: string; plan_id?: string; custom_id?: string; subscriber?: { payer_id?: string }; billing_info?: { next_billing_time?: string } };

function state(status: ProStatus, discordSync: ProSubscriptionState['discordSync'], message?: string): ProSubscriptionState {
  const active = status === 'active';
  return { ready: paypalReady, status, priceUsd: 2, interval: 'month', discordSync, benefits: PRO_BENEFITS.map((benefit) => ({ ...benefit, enabled: active && (benefit.id !== 'discord-role' || discordSync === 'connected') })), message };
}

function mapStatus(value?: string): ProStatus {
  if (value === 'ACTIVE') return 'active';
  if (value === 'SUSPENDED') return 'past_due';
  if (value === 'CANCELLED' || value === 'EXPIRED') return 'canceled';
  return 'inactive';
}

async function accessToken() {
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: 'grant_type=client_credentials', cache: 'no-store' });
  const payload = await response.json().catch(() => ({})) as { access_token?: string };
  if (!response.ok || !payload.access_token) throw new Error('PayPal authentication failed.');
  return payload.access_token;
}

async function paypal(path: string, init: RequestInit = {}) {
  const response = await fetch(`${paypalBaseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${await accessToken()}`, Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`PayPal request failed (${response.status}).`);
  return payload;
}

async function planId() {
  if (process.env.PAYPAL_PLAN_ID) return process.env.PAYPAL_PLAN_ID;
  await ensureVaultSchema();
  const sql = database();
  const billingConfigKey = 'paypal_plan_id_usd_2_monthly';
  const [stored] = await sql`SELECT value FROM vertyx_billing_config WHERE key = ${billingConfigKey} LIMIT 1` as unknown as { value: string }[];
  if (stored?.value) return stored.value;
  const product = await paypal('/v1/catalogs/products', { method: 'POST', body: JSON.stringify({ name: 'Vertyx Vault Pro', description: 'Vertyx Vault Pro monthly subscription', type: 'SERVICE', category: 'SOFTWARE' }) }) as { id: string };
  const plan = await paypal('/v1/billing/plans', { method: 'POST', body: JSON.stringify({ product_id: product.id, name: 'Vertyx Vault Pro Monthly', billing_cycles: [{ frequency: { interval_unit: 'MONTH', interval_count: 1 }, tenure_type: 'REGULAR', sequence: 1, total_cycles: 0, pricing_scheme: { fixed_price: { value: '2.00', currency_code: 'USD' } } }], payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 1 } }) }) as { id: string };
  await sql`INSERT INTO vertyx_billing_config (key, value) VALUES (${billingConfigKey}, ${plan.id}) ON CONFLICT (key) DO NOTHING`;
  const [saved] = await sql`SELECT value FROM vertyx_billing_config WHERE key = ${billingConfigKey} LIMIT 1` as unknown as { value: string }[];
  return saved?.value ?? plan.id;
}

async function syncDiscord(userId: string, active: boolean) {
  if (!discordReady) return 'unavailable' as const;
  const discordUserId = await findDiscordUserId(userId);
  if (!discordUserId) return 'pending' as const;
  const endpoint = `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordUserId}/roles/${process.env.DISCORD_PRO_ROLE_ID}`;
  const response = await fetch(endpoint, { method: active ? 'PUT' : 'DELETE', headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }, cache: 'no-store' });
  if (!response.ok && response.status !== 204) throw new Error(`Discord role sync failed (${response.status}).`);
  return 'connected' as const;
}

async function upsertSubscription(subscription: PayPalSubscription, userId?: string) {
  const resolvedUserId = userId ?? subscription.custom_id;
  if (!resolvedUserId || !subscription.plan_id) return;
  const sql = database();
  await sql`INSERT INTO vertyx_pro_subscriptions (subscription_id, user_id, plan_id, status, payer_id, current_period_end)
    VALUES (${subscription.id}, ${resolvedUserId}, ${subscription.plan_id}, ${subscription.status ?? 'APPROVAL_PENDING'}, ${subscription.subscriber?.payer_id ?? null}, ${subscription.billing_info?.next_billing_time ?? null}::timestamptz)
    ON CONFLICT (subscription_id) DO UPDATE SET status = EXCLUDED.status, payer_id = EXCLUDED.payer_id, current_period_end = EXCLUDED.current_period_end, updated_at = NOW()`;
}

export async function getProSubscription(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (!paypalReady) return Response.json(state('inactive', discordReady ? 'pending' : 'unavailable', 'Configura PayPal, Neon y el webhook para activar Pro.'));
  await ensureVaultSchema();
  const [row] = await database()`SELECT subscription_id, plan_id, status, current_period_end FROM vertyx_pro_subscriptions WHERE user_id = ${profile.id} ORDER BY updated_at DESC LIMIT 1` as unknown as SubscriptionRow[];
  const status = mapStatus(row?.status);
  let discordSync: ProSubscriptionState['discordSync'] = discordReady ? 'pending' : 'unavailable';
  if (status === 'active') discordSync = await syncDiscord(profile.id, true).catch(() => 'pending');
  return Response.json(state(status, discordSync));
}

export async function createProCheckout(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ ok: false, ready: paypalReady, message: 'Necesitas una sesión para activar Pro.' } satisfies ProActionResult, { status: 401 });
  if (!paypalReady) return Response.json({ ok: false, ready: false, message: 'Configura PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID y DATABASE_URL.' } satisfies ProActionResult, { status: 503 });
  try {
    const origin = new URL(request.url).origin;
    const subscription = await paypal('/v1/billing/subscriptions', { method: 'POST', body: JSON.stringify({ plan_id: await planId(), custom_id: profile.id, application_context: { brand_name: 'Vertyx Vault', user_action: 'SUBSCRIBE_NOW', return_url: `${origin}/profile?paypal=success`, cancel_url: `${origin}/profile?paypal=cancel` } }) }) as PayPalSubscription & { links?: { rel: string; href: string }[] };
    await upsertSubscription(subscription, profile.id);
    const checkoutUrl = subscription.links?.find((link) => link.rel === 'approve')?.href;
    if (!checkoutUrl) throw new Error('PayPal did not return an approval URL.');
    return Response.json({ ok: true, ready: true, message: 'Redirigiendo a PayPal.', checkoutUrl, subscription: state('inactive', discordReady ? 'pending' : 'unavailable') } satisfies ProActionResult);
  } catch {
    return Response.json({ ok: false, ready: true, message: 'No se pudo iniciar el checkout de PayPal.' } satisfies ProActionResult, { status: 502 });
  }
}

export async function openProPortal(_: Request): Promise<Response> {
  return Response.json({ ok: false, ready: false, message: 'Gestiona la suscripción desde PayPal.' } satisfies ProActionResult, { status: 501 });
}

export async function syncProDiscord(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ ok: false, ready: true, message: 'No autorizado' } satisfies ProActionResult, { status: 401 });
  if (!paypalReady) return Response.json({ ok: false, ready: false, message: 'Configura PayPal y Neon antes de sincronizar Discord.' } satisfies ProActionResult, { status: 503 });
  const [row] = await database()`SELECT status FROM vertyx_pro_subscriptions WHERE user_id = ${profile.id} ORDER BY updated_at DESC LIMIT 1` as unknown as { status: string }[];
  if (mapStatus(row?.status) !== 'active') return Response.json({ ok: false, ready: true, message: 'El rol Pro se asigna únicamente a suscripciones activas.' } satisfies ProActionResult, { status: 409 });
  try { const result = await syncDiscord(profile.id, true); return Response.json({ ok: result === 'connected', ready: true, message: result === 'connected' ? 'Rol Pro sincronizado.' : 'Vincula Discord antes de sincronizar el rol.' } satisfies ProActionResult); } catch { return Response.json({ ok: false, ready: true, message: 'No se pudo sincronizar el rol de Discord.' } satisfies ProActionResult, { status: 502 }); }
}

export async function receiveProWebhook(request: Request): Promise<Response> {
  if (!paypalReady) return Response.json({ ok: false, message: 'PayPal or Neon is not configured.' }, { status: 503 });
  const event = await request.json().catch(() => undefined) as { event_type?: string; resource?: PayPalSubscription } | undefined;
  if (!event?.resource?.id) return Response.json({ ok: false, message: 'Invalid PayPal event.' }, { status: 400 });
  try {
    const verification = await paypal('/v1/notifications/verify-webhook-signature', { method: 'POST', body: JSON.stringify({
      auth_algo: request.headers.get('paypal-auth-algo'),
      cert_url: request.headers.get('paypal-cert-url'),
      transmission_id: request.headers.get('paypal-transmission-id'),
      transmission_sig: request.headers.get('paypal-transmission-sig'),
      transmission_time: request.headers.get('paypal-transmission-time'),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    }) }) as { verification_status?: string };
    if (verification.verification_status !== 'SUCCESS') return Response.json({ ok: false, message: 'Invalid PayPal signature.' }, { status: 401 });
    const subscription = await paypal(`/v1/billing/subscriptions/${event.resource.id}`) as PayPalSubscription;
    await upsertSubscription(subscription);
    const userId = subscription.custom_id;
    if (userId) await syncDiscord(userId, mapStatus(subscription.status) === 'active').catch(() => undefined);
    return Response.json({ ok: true });
  } catch { return Response.json({ ok: false, message: 'Unable to process PayPal webhook.' }, { status: 502 }); }
}
