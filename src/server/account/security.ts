import { readProfileFromRequest } from '@/server/session/cookies';
import type { AccountActionResult, AccountLoginEvent, AccountSecurityAction, AccountSecurityOverview, AccountSessionDevice } from '@/types/account';

const accountApiUrl = process.env.VERTYX_ACCOUNT_API_URL?.replace(/\/$/, '') || process.env.VERTYX_AUTH_API_URL?.replace(/\/$/, '');
const accountApiKey = process.env.VERTYX_ACCOUNT_API_KEY || process.env.VERTYX_AUTH_API_KEY;

function requestHeaders(request?: Request) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(accountApiKey ? { Authorization: `Bearer ${accountApiKey}` } : {}),
    ...(request?.headers.get('cookie') ? { Cookie: request.headers.get('cookie') ?? '' } : {}),
  };
}

function fallbackSessions(): AccountSessionDevice[] {
  return [{ id: 'current', device: 'Este navegador', location: 'Sesión local', current: true, lastSeenAt: new Date().toISOString() }];
}

function fallbackLoginHistory(provider: AccountLoginEvent['provider'] = 'local'): AccountLoginEvent[] {
  return [{ id: 'login-current', provider, device: 'Este navegador', status: 'success', at: new Date().toISOString() }];
}

function fallback(action: AccountSecurityAction, message: string, status = 202) {
  return Response.json({ ok: false, ready: false, action, message, next: 'Configura VERTYX_ACCOUNT_API_URL o VERTYX_AUTH_API_URL para activar esta operación con un proveedor real.' } satisfies AccountActionResult, { status });
}

async function proxy(request: Request, path: string, action: AccountSecurityAction, body?: unknown) {
  if (!accountApiUrl) return undefined;
  const response = await fetch(`${accountApiUrl}${path}`, {
    method: 'POST',
    headers: requestHeaders(request),
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  });
  if (!response.ok) return Response.json({ ok: false, ready: true, action, message: `El proveedor respondió con ${response.status}.` } satisfies AccountActionResult, { status: response.status });
  const payload = await response.json().catch(() => ({}));
  return Response.json({ ok: true, ready: true, action, message: 'Operación completada.', ...payload });
}

export async function getSecurityOverview(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ error: 'No autorizado' }, { status: 401 });

  if (accountApiUrl) {
    try {
      const response = await fetch(`${accountApiUrl}/account/security`, { headers: requestHeaders(request), cache: 'no-store' });
      if (response.ok) return Response.json(await response.json() as AccountSecurityOverview);
    } catch (error) {
      console.error('[account-security]', error);
    }
  }

  return Response.json({
    ready: false,
    sessions: fallbackSessions(),
    loginHistory: fallbackLoginHistory(profile.provider),
    twoFactorEnabled: false,
    providers: { google: profile.provider === 'google', discord: profile.provider === 'discord' },
    message: 'Seguridad usando datos locales hasta conectar un proveedor de cuenta real.',
  } satisfies AccountSecurityOverview);
}

export async function updateEmail(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = body.email?.trim().slice(0, 160);
  if (!email || !email.includes('@')) return Response.json({ ok: false, ready: true, action: 'email', message: 'Correo inválido.' } satisfies AccountActionResult, { status: 400 });
  return await proxy(request, '/account/email', 'email', { email }) ?? fallback('email', 'Cambio de correo preparado; falta proveedor de autenticación real.');
}

export async function updatePassword(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { currentPassword?: string; nextPassword?: string };
  if (body.nextPassword && body.nextPassword.length < 8) return Response.json({ ok: false, ready: true, action: 'password', message: 'La nueva contraseña debe tener al menos 8 caracteres.' } satisfies AccountActionResult, { status: 400 });
  return await proxy(request, '/account/password', 'password', body) ?? fallback('password', 'Cambio de contraseña preparado; falta proveedor de autenticación real.');
}

export async function toggleTwoFactor(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { enabled?: boolean };
  return await proxy(request, '/account/two-factor', 'two-factor', { enabled: Boolean(body.enabled) }) ?? fallback('two-factor', '2FA preparado; falta proveedor de autenticación real.');
}

export async function closeOtherSessions(request: Request): Promise<Response> {
  return await proxy(request, '/account/sessions/logout-others', 'logout-others') ?? fallback('logout-others', 'Cierre de otros dispositivos preparado; falta proveedor de sesiones real.');
}

export async function deleteAccount(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { confirmation?: string };
  if (body.confirmation !== 'ELIMINAR') return Response.json({ ok: false, ready: true, action: 'delete-account', message: 'Confirmación inválida.' } satisfies AccountActionResult, { status: 400 });
  return await proxy(request, '/account/delete', 'delete-account', body) ?? fallback('delete-account', 'Eliminación preparada; falta proveedor de cuentas real.');
}
