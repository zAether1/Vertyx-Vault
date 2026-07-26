import { NextResponse } from 'next/server';
import { hasPermission, ROLES, type Role } from '@/types/access';
import { listProfiles, updateProfileRole } from '@/server/database/repositories';
import { readProfileFromRequest } from '@/server/session/cookies';

export async function GET(request: Request) {
  const actor = readProfileFromRequest(request);
  if (!actor || !hasPermission(actor.role, 'user:manage')) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const users = await listProfiles();
  return NextResponse.json({ users: users.map((user) => ({ id: user.id, name: user.displayName, username: user.username, email: user.security.email, role: user.role, plan: user.plan, status: user.status, lastSeenAt: user.lastSeenAt })) });
}

export async function PATCH(request: Request) {
  const actor = readProfileFromRequest(request);
  if (!actor || !hasPermission(actor.role, 'role:manage')) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { userId?: string; role?: Role };
  if (!body.userId || !body.role || !ROLES.includes(body.role)) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  if (body.userId === actor.id) return NextResponse.json({ error: 'No puedes cambiar tu propio rol.' }, { status: 409 });
  const user = await updateProfileRole(body.userId, body.role);
  return user ? NextResponse.json({ user }) : NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
}
