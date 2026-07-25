import { can } from '@/server/access/permissions';
import { cookieOptions, encodeJsonCookie, readProfileFromRequest, SUBMISSIONS_COOKIE } from '@/server/session/cookies';
import { readLocalSubmissions } from '@/server/submissions/local-cookie';
import type { AdminOverview, ModerationAction, ModerationResult, OAuthActionResult, OAuthProvider, ProCheckoutIntent, ProfileAssetIntent, ProfileAssetKind } from '@/types/infrastructure';
import { statusFromModerationAction } from '@/types/infrastructure';

const proBenefits = ['Insignia Pro animada', 'Marcos y banners exclusivos', 'Colores premium', 'Sin anuncios', 'Acceso anticipado', 'Sincronización futura con Discord'];

export function createOAuthIntent(provider: OAuthProvider): OAuthActionResult {
  const ready = provider === 'google' ? Boolean(process.env.VERTYX_GOOGLE_AUTH_URL || process.env.GOOGLE_CLIENT_ID) : Boolean(process.env.VERTYX_DISCORD_AUTH_URL || process.env.DISCORD_CLIENT_ID || process.env.VERTYX_DISCORD_CLIENT_ID);
  return {
    ok: true,
    ready,
    provider,
    authorizationUrl: ready ? `/api/session/oauth/${provider}` : undefined,
    message: ready ? `Proveedor ${provider} listo para iniciar vinculación.` : `Falta configurar OAuth de ${provider} para vincular cuentas reales.`,
    next: ready ? undefined : provider === 'google' ? 'Configura GOOGLE_CLIENT_ID y el callback del proveedor de autenticación.' : 'Configura DISCORD_CLIENT_ID y el callback del proveedor de autenticación.',
  };
}

export function createAssetIntent(kind: ProfileAssetKind): ProfileAssetIntent {
  const ready = Boolean(process.env.VERTYX_BLOB_UPLOAD_URL || process.env.BLOB_READ_WRITE_TOKEN);
  return {
    ok: true,
    ready,
    kind,
    uploadUrl: ready ? '/api/profile/assets/upload' : undefined,
    maxBytes: kind === 'cover' ? 6_000_000 : 4_000_000,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    message: ready ? `Carga de ${kind} lista con Vercel Blob.` : `Falta conectar Vercel Blob para guardar ${kind} de forma persistente.`,
    next: ready ? undefined : 'Configura BLOB_READ_WRITE_TOKEN o un endpoint VERTYX_BLOB_UPLOAD_URL.',
  };
}

export function createProCheckoutIntent(): ProCheckoutIntent {
  const ready = Boolean(process.env.VERTYX_PAYMENTS_API_URL || process.env.STRIPE_SECRET_KEY);
  return {
    ok: true,
    ready,
    priceUsd: 2,
    interval: 'month',
    checkoutUrl: ready ? '/api/profile/pro/checkout/session' : undefined,
    benefits: proBenefits,
    message: ready ? 'Checkout Pro listo para abrir la pasarela conectada.' : 'Falta conectar la pasarela de pagos para activar Vertyx Vault Pro real.',
    next: ready ? undefined : 'Configura VERTYX_PAYMENTS_API_URL o STRIPE_SECRET_KEY.',
  };
}

export function getAdminOverview(request: Request): AdminOverview | Response {
  const profile = readProfileFromRequest(request);
  if (!profile || !can(profile.role, 'activity:read')) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  const submissions = readLocalSubmissions(request);
  const now = new Date().toISOString();
  return {
    metrics: [
      { label: 'Usuarios registrados', value: '3', detail: 'Adaptador local hasta conectar base de datos' },
      { label: 'Invitados activos', value: profile.role === 'guest' ? '1' : '0', detail: 'Sesión actual' },
      { label: 'Solicitudes pendientes', value: submissions.filter((item) => item.status === 'pending').length.toString(), detail: 'Cola editorial' },
      { label: 'Contenido publicado', value: submissions.filter((item) => item.status === 'published' || item.status === 'approved').length.toString(), detail: 'Publicación local' },
      { label: 'Suscriptores Pro', value: profile.plan === 'pro' ? '1' : '0', detail: 'Pagos pendiente' },
      { label: 'Moderación', value: submissions.length ? 'Activa' : 'Lista', detail: 'Permisos verificados' },
    ],
    users: [
      { id: profile.id, name: profile.name, role: profile.role, plan: profile.plan ?? 'free', status: 'active', lastSeenAt: now },
      { id: 'u-uploaders', name: 'Uploaders', role: 'uploader', plan: 'free', status: 'pending', lastSeenAt: now },
      { id: 'u-pro', name: 'Pro', role: 'user', plan: 'pro', status: 'pending', lastSeenAt: now },
    ],
    activity: [
      { id: 'activity-session', label: `${profile.name} abrió la sala de control`, at: now, tone: 'violet' },
      { id: 'activity-roles', label: 'Contratos de roles y permisos activos', at: now, tone: 'blue' },
      { id: 'activity-queue', label: 'Cola editorial preparada para persistencia compartida', at: now, tone: 'graphite' },
    ],
    submissions,
  };
}

export function moderateSubmission(request: Request, id: string, action: ModerationAction): Response {
  const profile = readProfileFromRequest(request);
  if (!profile || !can(profile.role, 'submission:review')) return new Response(JSON.stringify({ ok: false, ready: true, message: 'No autorizado' } satisfies ModerationResult), { status: 403, headers: { 'Content-Type': 'application/json' } });
  const status = statusFromModerationAction(action);
  const items = readLocalSubmissions(request);
  const item = items.find((entry) => entry.id === id);
  if (!item) return new Response(JSON.stringify({ ok: false, ready: true, message: 'Solicitud no encontrada' } satisfies ModerationResult), { status: 404, headers: { 'Content-Type': 'application/json' } });
  const updated = { ...item, status, reviewedBy: profile.id, reviewedAt: new Date().toISOString() };
  const snapshot = items.map((entry) => entry.id === id ? updated : entry);
  return new Response(JSON.stringify({ ok: true, ready: true, item: updated, status, message: `${item.title}: ${status}` } satisfies ModerationResult), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': `${SUBMISSIONS_COOKIE}=${encodeJsonCookie(snapshot)}; ${cookieOptions(60 * 60 * 24 * 14)}` } });
}
