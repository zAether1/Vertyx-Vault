'use client';

import Link from 'next/link';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { hasPermission } from '@/types/access';

const METRICS = ['Usuarios registrados', 'Usuarios invitados', 'Contenido publicado', 'Solicitudes pendientes', 'Moderadores', 'Administradores', 'Suscriptores Pro'];

export default function AdminPanel() {
  const { session, ready } = useSessionSnapshot();
  if (!ready) return null;
  const role = session.profile?.role ?? 'guest';
  if (!hasPermission(role, 'activity:read')) return <section className="mt-10 vault-glass rounded-3xl p-6 md:p-8"><p className="vault-page__eyebrow">Acceso restringido</p><h2 className="mt-2 text-2xl font-bold">Panel de administración</h2><p className="mt-3 max-w-xl text-[#eee9f4]/65">Este espacio está reservado para moderadores, administradores y propietarios. Los permisos se validan fuera de los componentes y se ampliarán al conectar el proveedor de identidad.</p><Link href="/profile" className="vault-action mt-6 inline-block">Volver a mi perfil</Link></section>;
  return <section className="mt-10"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{METRICS.map((metric) => <article key={metric} className="vault-glass rounded-3xl p-6"><p className="text-sm text-[#eee9f4]/60">{metric}</p><strong className="mt-4 block text-3xl text-[#c9a8f0]">—</strong><span className="mt-2 block text-xs text-[#eee9f4]/45">Conecta la persistencia para ver datos reales.</span></article>)}</div><section className="mt-6 vault-glass rounded-3xl p-6 md:p-8"><p className="vault-page__eyebrow">Registro de actividad</p><h2 className="mt-2 text-2xl font-bold">Preparado para auditoría</h2><p className="mt-3 text-[#eee9f4]/65">Los filtros por usuario, fecha y acción aparecerán al conectar el repositorio de actividad. Las acciones de aprobación, publicación y gestión de roles se mantienen bloqueadas hasta entonces.</p></section></section>;
}
