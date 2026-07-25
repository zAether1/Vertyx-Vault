'use client';

import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { useLibraryStore } from '@/store/library';

export default function ProfileSummary() {
  const { session, ready } = useSessionSnapshot();
  const favorites = useLibraryStore((state) => state.favorites.length);
  const history = useLibraryStore((state) => state.history.length);
  const progress = useLibraryStore((state) => state.progress.length);
  const profile = session.profile;

  return <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_.8fr]">
    <section className="vault-glass rounded-3xl p-6 md:p-8">
      <p className="vault-page__eyebrow">Perfil</p>
      <div className="mt-5 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#b9a9ca]/14 bg-[#5f318f]/18 text-2xl font-bold text-[#c9a8f0]" aria-hidden="true">
          {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : (profile?.name ?? 'V').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{ready && profile ? profile.name : 'Invitado de Vertyx'}</h1>
          <p className="mt-2 text-sm text-[#eee9f4]/62">{ready && profile?.email ? profile.email : 'Conecta un backend autorizado para sincronizar tu perfil entre dispositivos.'}</p>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap gap-2 text-sm">
        <span className="vault-filter vault-filter--active">{session.state === 'authenticated' ? 'Sesión autenticada' : 'Modo invitado'}</span>
        <span className="vault-filter">{session.catalogProviderEnabled ? 'Catálogo remoto activo' : 'Catálogo local'}</span>
        <span className="vault-filter">{session.librarySyncEnabled ? 'Biblioteca sincronizada' : 'Biblioteca local'}</span>
      </div>
    </section>
    <section className="vault-glass rounded-3xl p-6 md:p-8">
      <p className="vault-page__eyebrow">Actividad</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div><dt className="text-xs text-[#eee9f4]/55">Mi Lista</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{favorites}</dd></div>
        <div><dt className="text-xs text-[#eee9f4]/55">Historial</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{history}</dd></div>
        <div><dt className="text-xs text-[#eee9f4]/55">Progreso</dt><dd className="mt-2 text-3xl font-bold text-[#c9a8f0]">{progress}</dd></div>
      </dl>
      <p className="mt-6 text-sm leading-relaxed text-[#eee9f4]/62">El progreso se guarda localmente y se replica automáticamente cuando `VERTYX_LIBRARY_API_URL` está configurado.</p>
    </section>
  </div>;
}
