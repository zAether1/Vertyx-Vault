'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CirclePlayIcon, StarSmallIcon } from '@/components/icons';
import { useLibraryStore } from '@/store/library';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';

export default function ProfileSummary() {
  const { session, ready, refresh } = useSessionSnapshot();
  const [name, setName] = useState('Usuario Vertyx');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();
  const favorites = useLibraryStore((state) => state.favorites.length);
  const history = useLibraryStore((state) => state.history.length);
  const progress = useLibraryStore((state) => state.progress.length);
  const profile = session.profile;
  const isGuest = session.state === 'guest';

  const signIn = async (mode: 'guest' | 'local') => {
    setBusy(true); setNotice(undefined);
    const response = await fetch('/api/session/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, name }) });
    if (response.ok) await refresh(); else setNotice('No se pudo iniciar la sesión local.');
    setBusy(false);
  };
  const logout = async () => { setBusy(true); await fetch('/api/session/logout', { method: 'POST' }); await refresh(); setBusy(false); };

  return <div className="vault-profile-layout">
    <section className="vault-profile-stage">
      <div className="vault-profile-stage__light" />
      <div className="vault-profile-avatar" aria-hidden="true">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : (profile?.name ?? 'V').slice(0, 1).toUpperCase()}</div>
      <div className="vault-profile-stage__copy"><div className="flex flex-wrap items-center gap-2"><span className="vault-page__eyebrow">Identidad</span>{profile && <span className="vault-profile-role">{isGuest ? 'INVITADO' : profile.role.toUpperCase()}</span>}</div><h2>{ready && profile ? profile.name : 'Elige cómo entrar'}</h2><p>{profile ? `${profile.id} · ${profile.provider === 'local' ? 'sesión local' : 'identidad temporal'}` : 'Conserva tu biblioteca como invitado o crea una cuenta local.'}</p></div>
      {profile ? <div className="vault-profile-stage__actions"><button type="button" className="vault-action" onClick={logout} disabled={busy}>Cerrar sesión</button>{!isGuest && <Link href="/submit" className="vault-action"><CirclePlayIcon className="h-4 w-4" />Enviar contenido</Link>}</div> : <div className="vault-profile-stage__actions vault-profile-stage__actions--entry"><label className="sr-only" htmlFor="local-profile-name">Nombre visible</label><input id="local-profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Nombre visible" /><button type="button" className="vault-action" disabled={busy} onClick={() => signIn('local')}>Crear cuenta</button><button type="button" className="vault-filter" disabled={busy} onClick={() => signIn('guest')}>Entrar como invitado</button></div>}
      {notice && <p className="vault-profile-notice" role="status">{notice}</p>}
    </section>
    <section className="vault-profile-row"><article className="vault-profile-metrics"><div><span>Mi lista</span><strong>{favorites}</strong></div><div><span>Historial</span><strong>{history}</strong></div><div><span>Progreso</span><strong>{progress}</strong></div></article><article className="vault-pro-card"><div><span className="vault-page__eyebrow">Vertyx Vault Pro</span><h3>USD $5.00 <small>/ mes</small></h3><p>Sin anuncios, acceso anticipado, insignia Pro y prioridad para nuevas funciones.</p></div><button type="button" onClick={() => setNotice('La suscripción se habilitará al conectar el proveedor de pagos.')}><StarSmallIcon className="h-4 w-4" />Próximamente</button></article></section>
  </div>;
}
