'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BellIcon, CirclePlayIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { hasPermission, ROLES, type Role } from '@/types/access';
import type { AdminOverview, ModerationAction, ModerationResult } from '@/types/infrastructure';

type ManagedUser = { id: string; name: string; username: string; email?: string; role: Role; plan?: string; status?: string; lastSeenAt?: string };
const emptyOverview: AdminOverview = { metrics: [], users: [], activity: [], submissions: [] };

export default function AdminPanel() {
  const { session, ready } = useSessionSnapshot();
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [notice, setNotice] = useState<string>();
  const actor = session.profile;
  const canManageUsers = Boolean(actor && hasPermission(actor.role, 'user:manage'));
  const canManageRoles = Boolean(actor && hasPermission(actor.role, 'role:manage'));
  const load = () => {
    void fetch('/api/admin/overview').then((r) => r.ok ? r.json() as Promise<AdminOverview> : emptyOverview).then(setOverview).catch(() => setOverview(emptyOverview));
    if (canManageUsers) void fetch('/api/admin/users').then((r) => r.ok ? r.json() as Promise<{ users: ManagedUser[] }> : { users: [] }).then((data) => setUsers(data.users)).catch(() => setUsers([]));
  };
  useEffect(() => { if (ready) load(); }, [ready, canManageUsers]);
  if (!ready) return null;
  if (!actor || !hasPermission(actor.role, 'activity:read')) return <section className="vault-admin-lock"><BellIcon className="h-7 w-7" /><div><span className="vault-page__eyebrow">Área interna</span><h2>Sala de control restringida</h2><p>Necesitas un rol de moderación para gestionar la comunidad.</p><Link href="/profile" className="vault-action">Ver mi perfil</Link></div></section>;
  const moderate = async (id: string, action: ModerationAction) => { const r = await fetch(`/api/moderation/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); const data = await r.json().catch(() => ({ message: 'No se pudo aplicar la acción.' })) as Partial<ModerationResult>; setNotice(data.message); if (r.ok) load(); };
  const changeRole = async (userId: string, role: Role) => { const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) }); const data = await r.json().catch(() => ({ error: 'No se pudo actualizar el rol.' })) as { error?: string }; setNotice(data.error ?? 'Rol actualizado.'); if (r.ok) load(); };
  return <section className="vault-admin"><header className="vault-admin__command"><div><span className="vault-page__eyebrow">Comunidad · moderación · permisos</span><h2>Control de Vertyx</h2><p>Usuarios reales de Neon, cola editorial y roles de comunidad.</p></div><button type="button" onClick={load}>Actualizar</button></header>{notice && <p className="vault-profile-notice">{notice}</p>}<div className="vault-admin__metrics">{overview.metrics.map((m) => <article key={m.label}><span>{m.label}</span><strong>{m.value}</strong><small>{m.detail}</small></article>)}</div><div className="vault-admin__grid"><section className="vault-admin__feed"><header><div><span className="vault-page__eyebrow">Miembros</span><h3>Directorio de comunidad</h3></div></header>{canManageUsers ? <div className="vault-admin__users">{users.length ? users.map((user) => <article key={user.id}><div><strong>{user.name}</strong><span>@{user.username} · {user.email ?? 'sin correo'} · {user.plan ?? 'free'}</span></div>{canManageRoles ? <select value={user.role} disabled={user.id === actor.id} onChange={(e) => changeRole(user.id, e.target.value as Role)}>{ROLES.filter((role) => role !== 'owner' || actor.role === 'owner').map((role) => <option key={role}>{role}</option>)}</select> : <b>{user.role}</b>}</article>) : <p>Aún no hay perfiles persistidos en Neon.</p>}</div> : <p>Tu rol permite moderar, pero no administrar usuarios.</p>}<div className="vault-admin__activity"><h3>Actividad</h3>{overview.activity.map((entry) => <p key={entry.id}>{entry.label} · {new Date(entry.at).toLocaleTimeString('es')}</p>)}</div></section><aside className="vault-admin__review"><span className="vault-page__eyebrow">Cola editorial</span><h3>Películas y series</h3>{overview.submissions.length ? overview.submissions.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.kind} · {item.status}</span><div><button onClick={() => moderate(item.id, 'approve')}>Aprobar</button><button onClick={() => moderate(item.id, 'reject')}>Rechazar</button><button onClick={() => moderate(item.id, 'publish')}>Publicar</button></div></article>) : <div className="vault-admin__empty"><CirclePlayIcon className="h-7 w-7" /><p>No hay solicitudes pendientes.</p></div>}</aside></div></section>;
}
