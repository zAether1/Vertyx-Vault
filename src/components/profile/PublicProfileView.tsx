'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROFILE_BACKGROUNDS } from '@/lib/profile';
import { profileFromSession, type AdvancedProfile } from '@/types/profile';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';

function findSavedProfile(username: string): AdvancedProfile | undefined {
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith('vertyx-profile:')) continue;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? '') as AdvancedProfile;
      if (parsed.username === username) return parsed;
    } catch {
      window.localStorage.removeItem(key);
    }
  }
  return undefined;
}

export default function PublicProfileView({ username }: { username: string }) {
  const { session, ready } = useSessionSnapshot();
  const [savedProfile, setSavedProfile] = useState<AdvancedProfile>();
  const sessionProfile = profileFromSession(session.profile);
  const profile = savedProfile ?? sessionProfile;
  const isOwnProfile = profile.username === username;
  const background = PROFILE_BACKGROUNDS.find((item) => item.id === profile.theme.backgroundId)?.preview;

  useEffect(() => {
    if (!ready) return;
    setSavedProfile(findSavedProfile(username));
  }, [ready, username]);

  return <section className="vault-public-profile">
    <div className="vault-public-profile__banner" style={{ background }} />
    <div className="vault-public-profile__card">
      <div className="vault-profile-card__avatar vault-profile-card__avatar--minimal">{isOwnProfile && profile.theme.avatarUrl ? <img src={profile.theme.avatarUrl} alt="" /> : profile.displayName.slice(0, 1).toUpperCase()}</div>
      <span className="vault-page__eyebrow">Perfil público</span>
      <h1>{isOwnProfile ? profile.displayName : `@${username}`}</h1>
      <p>{isOwnProfile ? profile.bio : 'Este perfil está preparado para mostrarse cuando el backend de perfiles públicos esté conectado.'}</p>
      <div className="vault-profile-badges">{(isOwnProfile ? profile.badges : [{ id: 'public', label: 'Vault Member', tone: 'violet' as const }]).map((badge) => <span key={badge.id} className={`vault-badge vault-badge--${badge.tone}`}>{badge.label}</span>)}</div>
      <dl className="vault-profile-card__meta"><div><dt>Usuario</dt><dd>@{username}</dd></div><div><dt>Visibilidad</dt><dd>{isOwnProfile ? profile.preferences.privacy.visibility : 'pública'}</dd></div><div><dt>Cuenta</dt><dd>{isOwnProfile ? profile.plan : 'free'}</dd></div></dl>
      <Link href="/profile" className="vault-action">{isOwnProfile ? 'Editar perfil' : 'Volver a mi perfil'}</Link>
    </div>
  </section>;
}
