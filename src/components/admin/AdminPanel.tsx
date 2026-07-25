'use client';

import Link from 'next/link';
import { BellIcon, CirclePlayIcon, StarSmallIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { hasPermission } from '@/types/access';

const METRICS = [['Usuarios registrados', '—'], ['Invitados activos', '—'], ['Solicitudes pendientes', '—'], ['Contenido publicado', '—'], ['Suscriptores Pro', '—'], ['Moderación', '—']];

export default function AdminPanel() {
  const { session, ready } = useSessionSnapshot();
  if (!ready) return null;
  const role = session.profile?.role ?? 'guest';
  if (!hasPermission(role, 'activity:read')) return <section className="vault-admin-lock"><div className="vault-admin-lock__mark"><BellIcon className="h-7 w-7" /></div><div><span className="vault-page__eyebrow">Área interna</span><h2>Sala de control restringida</h2><p>La moderación, la publicación y los registros operativos están disponibles solo para roles autorizados.</p><Link href="/profile" className="vault-action">Ver mi perfil</Link></div></section>;
  return <section className="vault-admin"><div className="vault-admin__metrics">{METRICS.map(([label, value], index) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{index === 2 ? 'Revisión editorial' : 'Persistencia pendiente'}</small></article>)}</div><div className="vault-admin__grid"><section className="vault-admin__feed"><header><div><span className="vault-page__eyebrow">Actividad reciente</span><h2>Ritmo operativo</h2></div><BellIcon className="h-5 w-5 text-[#c9a8f0]" /></header><div className="vault-admin__empty"><CirclePlayIcon className="h-7 w-7" /><p>Aquí aparecerán inicios de sesión, revisiones, cambios de roles y publicaciones cuando se conecte el registro de actividad.</p></div></section><aside className="vault-admin__review"><span className="vault-page__eyebrow">Revisión editorial</span><h3>Solicitudes</h3><p>Las propuestas aprobadas conservan sus fuentes, metadatos y responsables de revisión.</p><button type="button"><StarSmallIcon className="h-4 w-4" />Sin solicitudes compartidas</button></aside></div></section>;
}
