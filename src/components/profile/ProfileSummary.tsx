'use client';

import { useState } from 'react';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { useLibraryStore } from '@/store/library';

export default function ProfileSummary() {
  const { session, ready, refresh } = useSessionSnapshot();
  const [name, setName] = useState('Usuario Vertyx');
  const [busy, setBusy] = useState(false);
  const favorites = useLibraryStore((state) => state.favorites.length);
  const history = useLibraryStore((state) => state.history.length);
  const progress = useLibraryStore((state) => state.progress.length);
  const profile = session.profile;

  const login = async () => {
    setBusy(true);
    await fetch('/api/session/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    await refresh();
    setBusy(false);
  };
  const logout = async () => {
    setBusy(true);
    await fetch('/api/session/logout', { method: 'POST' });
    await refresh();
    setBusy(false);
  };

  return <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_.8fr]">
    <section className="vault-glass rounded-3xl p-6 md:p-8">
      <p className="vault-page__eyebrow">Perfil</p>
      <div className="mt-5 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#b9a9ca]/14 bg-[#5f318f]/18 text-2xl font-bold text-[#c9a8f0]" aria-hidden="true">
          {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : (profile?.name ?? 'V').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{ready && profile ? profile.name : 'Invitado de Vertyx'}</h1>
          <p className="mt-2 text-sm text-[#eee9f4]/62">{ready && profile?.email ? profile.email : 'Usa una sesión local ahora; puedes conectar auth externa más adelante.'}</p>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap gap-2 text-sm">
        <span className="vault-filter vault-filter--active">{session.state === 'authenticated' ? 'Sesión local activa' : 'Modo invitado'}</span>
        <span className="vault-filter">{session.catalogProviderEnabled ? 'Catálogo remoto activo' : 'API interna de catálogo'}</span>
        <span className="vault-filter">{session.librarySyncEnabled ? 'Biblioteca sincronizada' : session.localLibraryEnabled ? 'Biblioteca local funcional' : 'Biblioteca local'}</span>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        {session.state === 'authenticated' ? <button type="button" className="vault-action" onClick={logout} disabled={busy}>Cerrar sesión local</button> : <>
          <label className="sr-only" htmlFor="local-profile-name">Nombre de perfil</label>
          <input id="local-profile-name" className="vault-glass rounded-full px-4 py-3 text-sm outline-none" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} />
          <button type="button" className="vault-action" onClick={login} disabled={busy}>Crear sesión local</button>
        </>}
      </div>
    </section>
    <section className="vault-glass rounded-3xl p-6 md:p-8">
      <p className="vault-page__eyebrow">Actividad</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div><dt className="text-xs text-[#eee9f4]/55">Mi Lista</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{favorites}</dd></div>
        <div><dt className="text-xs text-[#eee9f4]/55">Historial</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{history}</dd></div>
        <div><dt className="text-xs text-[#eee9f4]/55">Progreso</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{progress}</dd></div>
      </dl>
      <p className="mt-6 text-sm leading-relaxed text-[#eee9f4]/62">Favoritos, historial y progreso ya se guardan mediante la API interna. Si conectas un backend remoto, la misma UI seguirá funcionando.</p>
    </section>
  </div>;
}
