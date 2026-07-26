import { can } from '@/server/access/permissions';
import { cookieOptions, encodeJsonCookie, readProfileFromRequest, SUBMISSIONS_COOKIE } from '@/server/session/cookies';
import { readLocalSubmissions } from '@/server/submissions/local-cookie';
import type { AdminOverview, CatalogAdminEntry, ModerationAction, ModerationResult, OAuthActionResult, OAuthProvider, ProCheckoutIntent, ProfileAssetIntent, ProfileAssetKind } from '@/types/infrastructure';
import { statusFromModerationAction } from '@/types/infrastructure';
import { hasDatabase, listAllSubmissions, listProfiles, updateSubmission, updateSubmissionSource, upsertSubmission } from '@/server/database/repositories';
import type { ContentSubmission, PlaybackKind } from '@/types/submission';
import { catalog } from '@/lib/catalog';

const proBenefits = ['Insignia Pro animada', 'Marcos y banners exclusivos', 'Colores premium', 'Sin anuncios', 'Acceso anticipado', 'Sincronización futura con Discord'];

function toCatalogAdminEntry(item: ContentSubmission): CatalogAdminEntry {
  return {
    id: item.id,
    title: item.title,
    kind: item.kind,
    description: item.description,
    category: item.category,
    provider: item.provider,
    playbackUrl: item.playbackUrl,
    playbackKind: item.playbackKind,
    coverUrl: item.coverUrl,
    year: item.year,
    language: item.language,
    quality: item.quality,
    genres: item.genres,
    notes: item.notes,
    status: item.status,
    submittedAt: item.submittedAt,
  };
}

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

export async function getAdminOverview(request: Request): Promise<AdminOverview | Response> {
  const profile = readProfileFromRequest(request);
  if (!profile || !can(profile.role, 'activity:read')) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  const localSubmissions = readLocalSubmissions(request);
  const submissions = hasDatabase() ? await listAllSubmissions().catch(() => localSubmissions) : localSubmissions;
  const catalogEntries = catalog
    .map((item) => {
      const existing = submissions.find((entry) => entry.id === item.id);
      return existing
        ? toCatalogAdminEntry(existing)
        : {
            id: item.id,
            title: item.title,
            kind: item.kind,
            description: item.collection ? `Catálogo · ${item.collection}` : 'Contenido del catálogo principal',
            category: item.collection,
            provider: 'Catálogo',
            playbackUrl: '',
            playbackKind: 'mp4' as const,
            coverUrl: item.poster,
            year: item.year,
            genres: [],
            status: 'catalog' as const,
            submittedAt: new Date().toISOString(),
          } satisfies CatalogAdminEntry;
    })
    .filter((entry) => entry.id);
  const persistedUsers = hasDatabase() ? await listProfiles().catch(() => []) : [];
  const now = new Date().toISOString();
  return {
    metrics: [
      { label: 'Usuarios registrados', value: persistedUsers.length.toString(), detail: hasDatabase() ? 'Perfiles persistidos en Neon' : 'Conecta Neon para persistencia compartida' },
      { label: 'Invitados activos', value: profile.role === 'guest' ? '1' : '0', detail: 'Sesión actual' },
      { label: 'Solicitudes pendientes', value: submissions.filter((item) => item.status === 'pending').length.toString(), detail: 'Cola editorial' },
      { label: 'Contenido publicado', value: submissions.filter((item) => item.status === 'published' || item.status === 'approved').length.toString(), detail: 'Publicación local' },
      { label: 'Suscriptores Pro', value: profile.plan === 'pro' ? '1' : '0', detail: 'Pagos pendiente' },
      { label: 'Moderación', value: submissions.length ? 'Activa' : 'Lista', detail: 'Permisos verificados' },
    ],
    users: persistedUsers.map((user) => ({ id: user.id, name: user.displayName, role: user.role, plan: user.plan, status: 'active' as const, lastSeenAt: user.lastSeenAt })),
    activity: [
      { id: 'activity-session', label: `${profile.name} abrió la sala de control`, at: now, tone: 'violet' },
      { id: 'activity-roles', label: 'Contratos de roles y permisos activos', at: now, tone: 'blue' },
      { id: 'activity-queue', label: 'Cola editorial preparada para persistencia compartida', at: now, tone: 'graphite' },
    ],
    submissions,
    catalogEntries,
  };
}

export async function moderateSubmission(request: Request, id: string, action: ModerationAction): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile || !can(profile.role, 'submission:review')) return new Response(JSON.stringify({ ok: false, ready: true, message: 'No autorizado' } satisfies ModerationResult), { status: 403, headers: { 'Content-Type': 'application/json' } });
  const status = action === 'approve' ? 'published' : statusFromModerationAction(action);
  if (hasDatabase()) {
    try {
      const item = await updateSubmission(id, status, profile.id);
      if (!item) return new Response(JSON.stringify({ ok: false, ready: true, message: 'Solicitud no encontrada' } satisfies ModerationResult), { status: 404, headers: { 'Content-Type': 'application/json' } });
      return Response.json({ ok: true, ready: true, item, status, message: `${item.title}: ${status}` } satisfies ModerationResult);
    } catch (error) {
      console.error('[moderation-database]', error);
    }
  }
  const items = readLocalSubmissions(request);
  const item = items.find((entry) => entry.id === id);
  if (!item) return new Response(JSON.stringify({ ok: false, ready: true, message: 'Solicitud no encontrada' } satisfies ModerationResult), { status: 404, headers: { 'Content-Type': 'application/json' } });
  const updated = { ...item, status, reviewedBy: profile.id, reviewedAt: new Date().toISOString() };
  const snapshot = items.map((entry) => entry.id === id ? updated : entry);
  return new Response(JSON.stringify({ ok: true, ready: true, item: updated, status, message: `${item.title}: ${status}` } satisfies ModerationResult), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': `${SUBMISSIONS_COOKIE}=${encodeJsonCookie(snapshot)}; ${cookieOptions(60 * 60 * 24 * 14)}` } });
}

export async function updateSubmissionPlayback(request: Request, id: string, playbackUrl: string, playbackKind: PlaybackKind): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile || !can(profile.role, 'submission:review')) return new Response(JSON.stringify({ ok: false, ready: true, message: 'No autorizado' } satisfies ModerationResult), { status: 403, headers: { 'Content-Type': 'application/json' } });
  const source = playbackUrl.trim();
  if (!source || !URL.canParse(source)) return new Response(JSON.stringify({ ok: false, ready: true, message: 'La URL del reproductor no es válida.' } satisfies ModerationResult), { status: 400, headers: { 'Content-Type': 'application/json' } });
  if (hasDatabase()) {
    try {
      const existing = await updateSubmissionSource(id, source, playbackKind);
      if (existing) return Response.json({ ok: true, ready: true, item: existing, message: `${existing.title}: fuente actualizada` } satisfies ModerationResult);
      const catalogItem = catalog.find((entry) => entry.id === id);
      const item: ContentSubmission = {
        id,
        title: catalogItem?.title ?? 'Contenido sin título',
        description: catalogItem?.collection ? `Catálogo · ${catalogItem.collection}` : 'Contenido publicado desde el catálogo.',
        category: catalogItem?.collection ?? 'Catálogo',
        kind: catalogItem?.kind ?? 'movie',
        genres: [],
        provider: 'Catálogo',
        playbackKind,
        playbackUrl: source,
        coverUrl: catalogItem?.poster,
        status: 'published',
        submittedBy: 'admin',
        submittedAt: new Date().toISOString(),
      };
      const created = await upsertSubmission(item);
      if (!created) throw new Error('No se pudo crear la entrada de catálogo');
      return Response.json({ ok: true, ready: true, item, message: `${item.title}: fuente actualizada` } satisfies ModerationResult);
    } catch (error) {
      console.error('[submission-source-database]', error);
    }
  }
  const items = readLocalSubmissions(request);
  const item = items.find((entry) => entry.id === id);
  if (!item) return new Response(JSON.stringify({ ok: false, ready: true, message: 'Solicitud no encontrada' } satisfies ModerationResult), { status: 404, headers: { 'Content-Type': 'application/json' } });
  const updated = { ...item, playbackUrl: source, playbackKind, reviewedBy: profile.id, reviewedAt: new Date().toISOString() };
  const snapshot = items.map((entry) => entry.id === id ? updated : entry);
  return new Response(JSON.stringify({ ok: true, ready: true, item: updated, message: `${item.title}: fuente actualizada` } satisfies ModerationResult), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': `${SUBMISSIONS_COOKIE}=${encodeJsonCookie(snapshot)}; ${cookieOptions(60 * 60 * 24 * 14)}` } });
}
