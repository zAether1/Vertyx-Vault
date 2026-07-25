'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

export default function PublicProfileView({ username, initialProfile }: { username: string; initialProfile?: AdvancedProfile }) {
  const { session, ready } = useSessionSnapshot();
  const [savedProfile, setSavedProfile] = useState<AdvancedProfile | undefined>(initialProfile);
  const [publicNotice, setPublicNotice] = useState<string>();
  const sessionProfile = profileFromSession(session.profile);
  const profile = savedProfile ?? sessionProfile;
  const isOwnProfile = profile.username === username;
  const canShowPublicData = isOwnProfile || Boolean(savedProfile);
  const publicStats = useMemo(() => profile.preferences.privacy.showActivity ? profile.stats : undefined, [profile.preferences.privacy.showActivity, profile.stats]);
  const background = PROFILE_BACKGROUNDS.find((item) => item.id === profile.theme.backgroundId)?.preview;

  useEffect(() => {
    if (!ready || initialProfile) return;
    const loadPublicProfile = async () => {
      try {
        const response = await fetch(`/api/profile/public/${encodeURIComponent(username)}`);
        if (response.ok) {
          const data = await response.json() as { profile?: AdvancedProfile };
          if (data.profile) {
            setSavedProfile(data.profile);
            setPublicNotice(undefined);
            return;
          }
        }
        setSavedProfile(findSavedProfile(username));
        setPublicNotice('Mostrando vista pública local hasta conectar la base de datos de perfiles.');
      } catch {
        setSavedProfile(findSavedProfile(username));
        setPublicNotice('Mostrando vista pública local hasta conectar la base de datos de perfiles.');
      }
    };
    void loadPublicProfile();
  }, [initialProfile, ready, username]);

  return <section className="vault-public-profile vault-public-profile--refined" style={{ '--profile-accent': profile.theme.accent, '--profile-color': profile.theme.profileColor } as React.CSSProperties}>
    <div className="vault-public-profile__shell">
      <div className="vault-public-profile__banner" style={{ background }}>
        {canShowPublicData && profile.theme.bannerUrl && <img src={profile.theme.bannerUrl} alt="" style={{ objectPosition: `${profile.theme.bannerFocus.x}% ${profile.theme.bannerFocus.y}%`, transform: `scale(${profile.theme.bannerFocus.zoom})` }} />}
        <span>{canShowPublicData ? profile.plan : 'public'}</span>
      </div>
      <div className="vault-public-profile__body">
        <div className={`vault-profile-avatar-refined vault-profile-card__avatar--${canShowPublicData ? profile.theme.avatarFrameId : 'minimal'}`}>
          {canShowPublicData && profile.theme.avatarUrl ? <img src={profile.theme.avatarUrl} alt="" /> : (canShowPublicData ? profile.displayName : username).slice(0, 1).toUpperCase()}
          <span className="vault-profile-avatar-refined__status" aria-label="Estado visible" />
        </div>
        <div className="vault-public-profile__identity">
          <span className="vault-page__eyebrow">Perfil público</span>
          <h1>{canShowPublicData ? profile.displayName : `@${username}`}</h1>
          <p className="vault-profile-handle">@{username} {canShowPublicData ? `· ${profile.id}` : ''}</p>
          <p className="vault-profile-card__status">{canShowPublicData ? profile.status : 'Perfil preparado para datos públicos persistentes.'}</p>
          {publicNotice && <p className="vault-public-profile__notice" role="status">{publicNotice}</p>}
        </div>
        <Link href="/profile" className="vault-profile-button">Volver a mi perfil</Link>
      </div>
      <div className="vault-public-profile__content">
        <article>
          <h2>Biografía</h2>
          <p>{canShowPublicData ? profile.bio : 'Cuando el backend de perfiles públicos esté conectado, aquí se mostrará únicamente la información autorizada por el usuario.'}</p>
          <div className="vault-profile-badges">{(canShowPublicData && profile.preferences.privacy.showBadges ? profile.badges : [{ id: 'public', label: 'Vault Member', tone: 'violet' as const }]).map((badge) => <span key={badge.id} className={`vault-badge vault-badge--${badge.tone} ${badge.animated ? 'vault-badge--animated' : ''}`}>{badge.label}</span>)}</div>
        </article>
        <aside>
          <dl className="vault-profile-rail__meta"><div><dt>Usuario</dt><dd>@{username}</dd></div><div><dt>Rol</dt><dd>{canShowPublicData ? profile.role : 'usuario'}</dd></div><div><dt>Cuenta</dt><dd>{canShowPublicData ? profile.plan : 'free'}</dd></div><div><dt>Registro</dt><dd>{canShowPublicData ? new Date(profile.createdAt).toLocaleDateString('es') : 'Privado'}</dd></div></dl>
          {publicStats && <div className="vault-profile-stat-strip vault-profile-stat-strip--public">{Object.entries({ Favoritos: publicStats.favorites, Guardados: publicStats.saved, Horas: publicStats.hoursPlayed, Racha: publicStats.streakDays }).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>}
        </aside>
      </div>
    </div>
  </section>;
}
