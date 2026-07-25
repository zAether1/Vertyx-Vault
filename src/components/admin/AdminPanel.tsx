'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BellIcon, CirclePlayIcon, StarSmallIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { hasPermission } from '@/types/access';
import type { ContentSubmission } from '@/types/submission';

const USERS = [
  { id: 'u-founder', name: 'Fundadores', role: 'owner', status: 'activo' },
  { id: 'u-uploaders', name: 'Uploaders', role: 'uploader', status: 'pendiente de backend' },
  { id: 'u-pro', name: 'Pro', role: 'user', status: 'pagos pendiente' },
];

export default function AdminPanel() {
  const { session, ready } = useSessionSnapshot();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [activity, setActivity] = useState(['Sala de control inicializada', 'Contratos de roles activos', 'Cola editorial preparada']);

  useEffect(() => {
    if (!ready) return;
    void fetch('/api/submissions').then((response) => response.ok ? response.json() as Promise<{ items: ContentSubmission[] }> : { items: [] }).then((data) => setSubmissions(data.items)).catch(() => setSubmissions([]));
  }, [ready]);

  const metrics = useMemo(() => [
    ['Usuarios registrados', USERS.length.toString()],
    ['Invitados activos', session.state === 'guest' ? '1' : '0'],
    ['Solicitudes pendientes', submissions.filter((item) => item.status === 'pending').length.toString()],
    ['Contenido publicado', submissions.filter((item) => item.status === 'approved').length.toString()],
    ['Suscriptores Pro', session.profile?.plan === 'pro' ? '1' : '0'],
    ['Moderación', submissions.length ? 'Activa' : 'Lista'],
  ], [session.profile?.plan, session.state, submissions]);

  if (!ready) return null;
  const role = session.profile?.role ?? 'guest';
  if (!hasPermission(role, 'activity:read')) return <section className="vault-admin-lock"><div className="vault-admin-lock__mark"><BellIcon className="h-7 w-7" /></div><div><span className="vault-page__eyebrow">Área interna</span><h2>Sala de control restringida</h2><p>La moderación, la publicación y los registros operativos están disponibles solo para roles autorizados.</p><Link href="/profile" className="vault-action">Ver mi perfil</Link></div></section>;

  const mark = (item: ContentSubmission, status: ContentSubmission['status']) => {
    setSubmissions((current) => current.map((entry) => entry.id === item.id ? { ...entry, status, reviewedBy: session.profile?.id, reviewedAt: new Date().toISOString() } : entry));
    setActivity((current) => [`${item.title}: ${status}`, ...current].slice(0, 6));
  };

  return <section className="vault-admin"><div className="vault-admin__metrics">{metrics.map(([label, value], index) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{index === 2 ? 'Revisión editorial' : 'Datos locales hasta conectar backend'}</small></article>)}</div><div className="vault-admin__grid"><section className="vault-admin__feed"><header><div><span className="vault-page__eyebrow">Actividad reciente</span><h2>Ritmo operativo</h2></div><BellIcon className="h-5 w-5 text-[#c9a8f0]" /></header><div className="vault-admin__activity">{activity.map((entry) => <p key={entry}>{entry}</p>)}</div><div className="vault-admin__users"><h3>Usuarios y roles</h3>{USERS.map((user) => <article key={user.id}><strong>{user.name}</strong><span>{user.role} · {user.status}</span></article>)}</div></section><aside className="vault-admin__review"><span className="vault-page__eyebrow">Revisión editorial</span><h3>Solicitudes</h3>{submissions.length ? <div className="vault-admin__queue">{submissions.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.kind} · {item.playbackKind} · {item.status}</span><div><button type="button" onClick={() => mark(item, 'approved')}>Aprobar</button><button type="button" onClick={() => mark(item, 'rejected')}>Rechazar</button><button type="button" onClick={() => mark(item, 'reviewing')}>Editar</button></div></article>)}</div> : <div className="vault-admin__empty"><CirclePlayIcon className="h-7 w-7" /><p>No hay solicitudes compartidas. La cola ya está preparada para aprobar, rechazar, editar, ocultar y publicar cuando exista persistencia real.</p></div>}<button type="button"><StarSmallIcon className="h-4 w-4" />Métricas reales al conectar base de datos</button></aside></div></section>;
}
