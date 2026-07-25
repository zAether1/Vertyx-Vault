'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BellIcon, CirclePlayIcon, StarSmallIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { hasPermission } from '@/types/access';
import type { AdminOverview, ModerationAction, ModerationResult } from '@/types/infrastructure';

const emptyOverview: AdminOverview = { metrics: [], users: [], activity: [], submissions: [] };

export default function AdminPanel() {
  const { session, ready } = useSessionSnapshot();
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [notice, setNotice] = useState<string>();

  const loadOverview = () => void fetch('/api/admin/overview')
    .then((response) => response.ok ? response.json() as Promise<AdminOverview> : emptyOverview)
    .then(setOverview)
    .catch(() => setOverview(emptyOverview));

  useEffect(() => {
    if (ready) loadOverview();
  }, [ready]);

  if (!ready) return null;
  const role = session.profile?.role ?? 'guest';
  if (!hasPermission(role, 'activity:read')) return <section className="vault-admin-lock"><div className="vault-admin-lock__mark"><BellIcon className="h-7 w-7" /></div><div><span className="vault-page__eyebrow">Área interna</span><h2>Sala de control restringida</h2><p>La moderación, la publicación y los registros operativos están disponibles solo para roles autorizados.</p><Link href="/profile" className="vault-action">Ver mi perfil</Link></div></section>;

  const moderate = async (id: string, action: ModerationAction) => {
    const response = await fetch(`/api/moderation/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    const result = await response.json().catch(() => ({ message: 'No se pudo aplicar la acción.' })) as Partial<ModerationResult>;
    setNotice(result.message ?? 'Acción registrada.');
    if (response.ok) loadOverview();
  };

  return <section className="vault-admin"><div className="vault-admin__metrics">{overview.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small></article>)}</div><div className="vault-admin__grid"><section className="vault-admin__feed"><header><div><span className="vault-page__eyebrow">Actividad reciente</span><h2>Ritmo operativo</h2></div><BellIcon className="h-5 w-5 text-[#c9a8f0]" /></header>{notice && <p className="vault-profile-notice" role="status">{notice}</p>}<div className="vault-admin__activity">{overview.activity.map((entry) => <p key={entry.id}>{entry.label} · {new Date(entry.at).toLocaleTimeString('es')}</p>)}</div><div className="vault-admin__users"><h3>Usuarios y roles</h3>{overview.users.map((user) => <article key={user.id}><strong>{user.name}</strong><span>{user.role} · {user.plan} · {user.status}</span></article>)}</div></section><aside className="vault-admin__review"><span className="vault-page__eyebrow">Revisión editorial</span><h3>Solicitudes</h3>{overview.submissions.length ? <div className="vault-admin__queue">{overview.submissions.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.kind} · {item.playbackKind} · {item.status}</span><div><button type="button" onClick={() => moderate(item.id, 'approve')}>Aprobar</button><button type="button" onClick={() => moderate(item.id, 'reject')}>Rechazar</button><button type="button" onClick={() => moderate(item.id, 'review')}>Editar</button><button type="button" onClick={() => moderate(item.id, 'hide')}>Ocultar</button><button type="button" onClick={() => moderate(item.id, 'publish')}>Publicar</button></div></article>)}</div> : <div className="vault-admin__empty"><CirclePlayIcon className="h-7 w-7" /><p>No hay solicitudes compartidas. La cola ya está preparada para aprobar, rechazar, editar, ocultar y publicar cuando exista persistencia real.</p></div>}<button type="button"><StarSmallIcon className="h-4 w-4" />Métricas reales al conectar base de datos</button></aside></div></section>;
}
