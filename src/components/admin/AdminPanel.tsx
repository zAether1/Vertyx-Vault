'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BellIcon, CirclePlayIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { hasPermission, ROLE_LABELS, ROLES, type Role } from '@/types/access';
import type { AdminOverview, CatalogAdminEntry, ModerationResult } from '@/types/infrastructure';
import type { PlaybackKind } from '@/types/submission';

type ManagedUser = { id: string; name: string; username: string; email?: string; role: Role; plan?: string };
const emptyOverview: AdminOverview = { metrics: [], users: [], activity: [], submissions: [], catalogEntries: [] };

function SubmissionReview({ item, onModerate, onSave }: { item: CatalogAdminEntry; onModerate: (id: string, action: 'approve' | 'reject') => void; onSave: (id: string, playbackUrl: string, playbackKind: PlaybackKind) => Promise<string | undefined> }) {
  const [playbackUrl, setPlaybackUrl] = useState(item.playbackUrl);
  const [playbackKind, setPlaybackKind] = useState<PlaybackKind>(item.playbackKind);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string>();
  const save = async () => {
    setSaving(true);
    const result = await onSave(item.id, playbackUrl, playbackKind);
    setNotice(result);
    setSaving(false);
  };
  return <article className="vault-admin-submission">
    <header><div><span className="vault-page__eyebrow">{item.kind === 'series' ? 'Serie' : 'Película'} · {item.status}</span><h3>{item.title}</h3></div><span>{new Date(item.submittedAt).toLocaleDateString('es')}</span></header>
    <p>{item.description}</p>
    <dl><div><dt>Categoría</dt><dd>{item.category || 'Catálogo'}</dd></div><div><dt>Año</dt><dd>{item.year || '—'}</dd></div><div><dt>Idioma</dt><dd>{item.language || '—'}</dd></div><div><dt>Calidad</dt><dd>{item.quality || '—'}</dd></div><div><dt>Proveedor</dt><dd>{item.provider || 'Catálogo'}</dd></div><div><dt>Formato</dt><dd>{item.playbackKind.toUpperCase()}</dd></div><div className="vault-admin-submission__wide"><dt>Géneros</dt><dd>{item.genres.join(', ') || '—'}</dd></div>{item.notes && <div className="vault-admin-submission__wide"><dt>Observaciones</dt><dd>{item.notes}</dd></div>}</dl>
    <div className="vault-admin-submission__source">
      <label className="vault-admin-submission__field">
        <span>URL de reproducción</span>
        <input value={playbackUrl} onChange={(event) => setPlaybackUrl(event.target.value)} placeholder="https://..." />
      </label>
      <label className="vault-admin-submission__field">
        <span>Tipo</span>
        <select value={playbackKind} onChange={(event) => setPlaybackKind(event.target.value as PlaybackKind)}>
          <option value="embed">Embebido</option>
          <option value="hls">HLS</option>
          <option value="mp4">MP4</option>
          <option value="dash">DASH</option>
        </select>
      </label>
    </div>
    <div className="vault-admin-submission__actions">
      <button type="button" className="vault-admin-button" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar URL'}</button>
      <button type="button" className="vault-admin-button vault-admin-button--approve" onClick={() => onModerate(item.id, 'approve')}>Aceptar</button>
      <button type="button" className="vault-admin-button vault-admin-button--reject" onClick={() => onModerate(item.id, 'reject')}>Rechazar</button>
    </div>
    {notice && <p className="vault-admin-submission__notice">{notice}</p>}
  </article>;
}

export default function AdminPanel() {
  const { session, ready } = useSessionSnapshot();
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [notice, setNotice] = useState<string>();
  const actor = session.profile;
  const canManageUsers = Boolean(actor && hasPermission(actor.role, 'user:manage'));
  const canManageRoles = Boolean(actor && hasPermission(actor.role, 'role:manage'));
  const canReview = Boolean(actor && hasPermission(actor.role, 'submission:review'));
  const load = () => {
    void fetch('/api/admin/overview').then((response) => response.ok ? response.json() as Promise<AdminOverview> : emptyOverview).then(setOverview).catch(() => setOverview(emptyOverview));
    if (canManageUsers) void fetch('/api/admin/users').then((response) => response.ok ? response.json() as Promise<{ users: ManagedUser[] }> : { users: [] }).then((data) => setUsers(data.users)).catch(() => setUsers([]));
  };
  useEffect(() => { if (ready) load(); }, [ready, canManageUsers]);
  if (!ready) return null;
  if (!actor || !hasPermission(actor.role, 'activity:read')) return <section className="vault-admin-lock"><BellIcon className="h-7 w-7" /><div><span className="vault-page__eyebrow">Área interna</span><h2>Sala de control restringida</h2><p>Tu rol de Discord no permite administrar la comunidad.</p><Link href="/profile" className="vault-action">Volver a Perfil</Link></div></section>;
  const moderate = async (id: string, action: 'approve' | 'reject') => { const response = await fetch(`/api/moderation/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); const data = await response.json().catch(() => ({ message: 'No se pudo actualizar la solicitud.' })) as Partial<ModerationResult>; setNotice(data.message); if (response.ok) load(); };
  const changeRole = async (userId: string, role: Role) => { const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) }); const data = await response.json().catch(() => ({ error: 'No se pudo actualizar el rol.' })) as { error?: string }; setNotice(data.error ?? 'Rol actualizado.'); if (response.ok) load(); };
  const updateSource = async (id: string, playbackUrl: string, playbackKind: PlaybackKind) => { const response = await fetch(`/api/admin/submissions/${id}/source`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playbackUrl, playbackKind }) }); const data = await response.json().catch(() => ({ message: 'No se pudo actualizar la URL.' })) as Partial<ModerationResult> & { message?: string }; setNotice(data.message ?? 'URL actualizada.'); if (response.ok) load(); return data.message; };
  const pending = overview.submissions.filter((item) => item.status === 'pending' || item.status === 'reviewing');
  const published = overview.submissions.filter((item) => item.status === 'published' || item.status === 'approved' || item.status === 'hidden');
  const catalogEntries = overview.catalogEntries ?? [];
  return <section className="vault-admin"><header className="vault-admin__command"><div><span className="vault-page__eyebrow">Moderación</span><h2>Panel de administración</h2><p>Revisa propuestas y gestiona el acceso de la comunidad.</p></div><button type="button" className="vault-admin-button" onClick={load}>Actualizar</button></header>{notice && <p className="vault-profile-notice" role="status">{notice}</p>}<div className="vault-admin__metrics">{overview.metrics.slice(0, 4).map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small></article>)}</div><section className="vault-admin__review"><header><div><span className="vault-page__eyebrow">Cola editorial</span><h3>Solicitudes por revisar</h3></div><span>{pending.length} pendientes</span></header>{canReview && pending.length ? <div className="vault-admin-submissions">{pending.map((item) => <SubmissionReview key={item.id} item={item} onModerate={moderate} onSave={updateSource} />)}</div> : <div className="vault-admin__empty"><CirclePlayIcon className="h-7 w-7" /><p>{canReview ? 'No hay solicitudes pendientes.' : 'Tu rol permite ver el panel, pero no revisar solicitudes.'}</p></div>}</section><section className="vault-admin__review"><header><div><span className="vault-page__eyebrow">Contenido</span><h3>Gestionar fuentes de reproducción</h3></div><span>{published.length} publicados</span></header>{canReview && published.length ? <div className="vault-admin-submissions">{published.map((item) => <SubmissionReview key={item.id} item={{ id: item.id, title: item.title, kind: item.kind, description: item.description, category: item.category, provider: item.provider, playbackUrl: item.playbackUrl, playbackKind: item.playbackKind, coverUrl: item.coverUrl, year: item.year, language: item.language, quality: item.quality, genres: item.genres, notes: item.notes, status: item.status, submittedAt: item.submittedAt }} onModerate={moderate} onSave={updateSource} />)}</div> : <div className="vault-admin__empty"><CirclePlayIcon className="h-7 w-7" /><p>{canReview ? 'No hay contenido publicado para editar.' : 'Tu rol permite ver el panel, pero no modificar fuentes.'}</p></div>}</section><section className="vault-admin__review"><header><div><span className="vault-page__eyebrow">Catálogo</span><h3>Títulos ya visibles en la web</h3></div><span>{catalogEntries.length} en catálogo</span></header>{canReview && catalogEntries.length ? <div className="vault-admin-submissions">{catalogEntries.map((item) => <SubmissionReview key={item.id} item={item} onModerate={moderate} onSave={updateSource} />)}</div> : <div className="vault-admin__empty"><CirclePlayIcon className="h-7 w-7" /><p>{canReview ? 'No hay títulos del catálogo para editar.' : 'Tu rol permite ver el panel, pero no modificar fuentes.'}</p></div>}</section>{canManageUsers && <section className="vault-admin__feed"><header><div><span className="vault-page__eyebrow">Comunidad</span><h3>Miembros</h3></div></header><div className="vault-admin__users">{users.map((user) => <article key={user.id}><div><strong>{user.name}</strong><span>@{user.username} · {ROLE_LABELS[user.role]}</span></div>{canManageRoles ? <select value={user.role} disabled={user.id === actor.id} onChange={(event) => changeRole(user.id, event.target.value as Role)}>{ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select> : <b>{ROLE_LABELS[user.role]}</b>}</article>)}</div></section>}</section>;
}
