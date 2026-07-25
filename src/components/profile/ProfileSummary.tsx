'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  const signIn = async (mode: 'guest' | 'local') => {
    setBusy(true); setNotice(undefined);
    const response = await fetch('/api/session/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, name }) });
    if (response.ok) await refresh(); else setNotice('No se pudo iniciar la sesión local.');
    setBusy(false);
  };
  const logout = async () => { setBusy(true); await fetch('/api/session/logout', { method: 'POST' }); await refresh(); setBusy(false); };
  const isGuest = session.state === 'guest';

  return <div className="mt-10 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
    <section className="vault-glass rounded-3xl p-6 md:p-8"><p className="vault-page__eyebrow">Identidad</p><div className="mt-5 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#b9a9ca]/14 bg-[#5f318f]/18 text-2xl font-bold text-[#c9a8f0]" aria-hidden="true">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : (profile?.name ?? 'V').slice(0, 1).toUpperCase()}</div><div><h2 className="text-3xl font-bold tracking-tight md:text-4xl">{ready && profile ? profile.name : 'Explora a tu ritmo'}</h2><p className="mt-1 text-sm text-[#eee9f4]/62">{profile ? `${profile.id} · ${profile.role}` : 'Crea una identidad local o continúa como invitado.'}</p></div></div>{profile ? <><div className="mt-6 flex flex-wrap gap-2 text-sm"><span className="vault-filter vault-filter--active">{isGuest ? 'Invitado' : 'Usuario'}</span><span className="vault-filter">Plan {profile.plan === 'pro' ? 'Pro' : 'Free'}</span><span className="vault-filter">{profile.provider === 'local' ? 'Sesión local' : 'Identidad temporal'}</span></div><div className="mt-7 flex flex-wrap gap-3"><button type="button" className="vault-action" onClick={logout} disabled={busy}>Cerrar sesión</button>{!isGuest && <Link href="/submit" className="vault-action">Enviar contenido</Link>}</div></> : <div className="mt-7"><label className="sr-only" htmlFor="local-profile-name">Nombre visible</label><input id="local-profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} className="vault-glass w-full rounded-xl px-4 py-3 text-sm outline-none sm:w-72" placeholder="Nombre visible" /><div className="mt-3 flex flex-wrap gap-3"><button type="button" className="vault-action" disabled={busy} onClick={() => signIn('local')}>Crear cuenta local</button><button type="button" className="vault-filter" disabled={busy} onClick={() => signIn('guest')}>Entrar como invitado</button></div><p className="mt-4 text-xs text-[#eee9f4]/48">Google y Discord estarán disponibles al conectar sus proveedores de autenticación.</p></div>}{notice && <p className="mt-4 text-sm text-[#c9a8f0]" role="status">{notice}</p>}</section>
    <div className="grid gap-4"><section className="vault-glass rounded-3xl p-6 md:p-8"><p className="vault-page__eyebrow">Actividad</p><dl className="mt-5 grid grid-cols-3 gap-3 text-center"><div><dt className="text-xs text-[#eee9f4]/55">Lista</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{favorites}</dd></div><div><dt className="text-xs text-[#eee9f4]/55">Historial</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{history}</dd></div><div><dt className="text-xs text-[#eee9f4]/55">Progreso</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{progress}</dd></div></dl></section><section className="vault-glass rounded-3xl p-6 md:p-8"><p className="vault-page__eyebrow">Vertyx Vault Pro</p><h2 className="mt-2 text-2xl font-bold">USD $2.00 / mes</h2><p className="mt-3 text-sm leading-relaxed text-[#eee9f4]/65">Sin anuncios, acceso anticipado, insignia Pro, rol exclusivo en Discord y prioridad para nuevas funciones.</p><button type="button" className="vault-filter mt-5" onClick={() => setNotice('La suscripción se habilitará al conectar el proveedor de pagos.')}>Próximamente</button></section></div>
  </div>;
}
