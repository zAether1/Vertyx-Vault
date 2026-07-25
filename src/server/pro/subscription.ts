import { readProfileFromRequest } from '@/server/session/cookies';
import { PRO_BENEFITS, type ProActionResult, type ProSubscriptionState } from '@/types/pro';

const proApiUrl = process.env.VERTYX_PRO_API_URL?.replace(/\/$/, '') || process.env.VERTYX_PAYMENTS_API_URL?.replace(/\/$/, '');
const proApiKey = process.env.VERTYX_PRO_API_KEY || process.env.STRIPE_SECRET_KEY;
const discordReady = Boolean(process.env.VERTYX_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID);

function requestHeaders(request?: Request) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(proApiKey ? { Authorization: `Bearer ${proApiKey}` } : {}),
    ...(request?.headers.get('cookie') ? { Cookie: request.headers.get('cookie') ?? '' } : {}),
  };
}

function fallbackState(isPro = false): ProSubscriptionState {
  return {
    ready: false,
    status: isPro ? 'active' : 'inactive',
    priceUsd: 2,
    interval: 'month',
    discordSync: discordReady ? 'pending' : 'unavailable',
    benefits: PRO_BENEFITS.map((benefit) => ({ ...benefit, enabled: isPro && (benefit.id !== 'discord-role' || discordReady) })),
    message: 'Vertyx Vault Pro está preparado; falta conectar la pasarela de pagos para activarlo de forma real.',
  };
}

async function proxy(request: Request, path: string, body?: unknown): Promise<Response | undefined> {
  if (!proApiUrl) return undefined;
  const response = await fetch(`${proApiUrl}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: requestHeaders(request),
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!response.ok) return Response.json({ ok: false, ready: true, message: `El proveedor Pro respondió con ${response.status}.` } satisfies ProActionResult, { status: response.status });
  return Response.json(await response.json());
}

export async function getProSubscription(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const remote = await proxy(request, '/pro/subscription');
  if (remote) return remote;
  return Response.json(fallbackState(profile.plan === 'pro'));
}

export async function createProCheckout(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ ok: false, ready: true, message: 'Necesitas una sesión para activar Pro.' } satisfies ProActionResult, { status: 401 });
  const remote = await proxy(request, '/pro/checkout', { priceUsd: 2, interval: 'month' });
  if (remote) return remote;
  return Response.json({ ok: false, ready: false, message: 'Checkout Pro preparado; falta conectar VERTYX_PRO_API_URL o VERTYX_PAYMENTS_API_URL.', subscription: fallbackState(profile.plan === 'pro') } satisfies ProActionResult, { status: 202 });
}

export async function openProPortal(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ ok: false, ready: true, message: 'No autorizado' } satisfies ProActionResult, { status: 401 });
  const remote = await proxy(request, '/pro/portal', {});
  if (remote) return remote;
  return Response.json({ ok: false, ready: false, message: 'Portal de facturación preparado; falta proveedor de pagos real.' } satisfies ProActionResult, { status: 202 });
}

export async function syncProDiscord(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ ok: false, ready: true, message: 'No autorizado' } satisfies ProActionResult, { status: 401 });
  const remote = await proxy(request, '/pro/discord/sync', {});
  if (remote) return remote;
  return Response.json({ ok: false, ready: discordReady, message: discordReady ? 'Sincronización Discord preparada; falta backend de roles.' : 'Conecta Discord para sincronizar el rol Pro.' } satisfies ProActionResult, { status: 202 });
}

export async function receiveProWebhook(request: Request): Promise<Response> {
  const payload = await request.json().catch(() => ({}));
  if (!proApiUrl) return Response.json({ ok: true, ready: false, message: 'Webhook recibido en fallback local. Conecta proveedor Pro para procesar eventos.', event: payload });
  const remote = await proxy(request, '/pro/webhook', payload);
  return remote ?? Response.json({ ok: true, ready: false, message: 'Webhook recibido.' });
}
