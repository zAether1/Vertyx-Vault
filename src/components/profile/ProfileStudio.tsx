'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CirclePlayIcon } from '@/components/icons';
import { useLibraryStore } from '@/store/library';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { AVATAR_FRAMES, PROFILE_ACCENTS, PROFILE_BACKGROUNDS, profilePublicUrl } from '@/lib/profile';
import { profileFromSession, type AdvancedProfile } from '@/types/profile';
import type { ProfileAssetKind } from '@/types/infrastructure';
import { hasPermission, ROLE_LABELS } from '@/types/access';

const TABS = [
  { id: 'identity', label: 'Perfil' },
  { id: 'appearance', label: 'Apariencia' },
  { id: 'preferences', label: 'Preferencias' },
] as const;

type TabId = (typeof TABS)[number]['id'];


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="vault-profile-field"><span>{label}</span>{children}</label>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" className={`vault-toggle ${checked ? 'vault-toggle--on' : ''}`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}><span />{label}</button>;
}

function readImage(file: File, onReady: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' && onReady(reader.result);
  reader.readAsDataURL(file);
}

export default function ProfileStudio() {
  const { session, ready, refresh } = useSessionSnapshot();
  const favorites = useLibraryStore((state) => state.favorites.length);
  const history = useLibraryStore((state) => state.history.length);
  const progress = useLibraryStore((state) => state.progress.length);
  const [activeTab, setActiveTab] = useState<TabId>('identity');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [profile, setProfile] = useState<AdvancedProfile>(() => profileFromSession());
  const panelRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ready) return;
    const base = profileFromSession(session.profile);
    const saved = window.localStorage.getItem(`vertyx-profile:${base.id}`);
    const hydrate = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json() as { profile?: AdvancedProfile };
          if (data.profile) {
            let cached: Partial<AdvancedProfile> | undefined;
            try {
              cached = saved ? JSON.parse(saved) as Partial<AdvancedProfile> : undefined;
            } catch {
              window.localStorage.removeItem(`vertyx-profile:${base.id}`);
            }
            setProfile({ ...base, ...data.profile, ...cached, stats: { ...base.stats, ...data.profile.stats, ...cached?.stats }, theme: { ...base.theme, ...data.profile.theme, ...cached?.theme } });
            hydratedRef.current = true;
            return;
          }
        }
      } catch {
        // Local cache remains the development fallback when the profile API is unavailable.
      }
      if (!saved) {
        setProfile(base);
        hydratedRef.current = true;
        return;
      }
      try {
        const parsed = JSON.parse(saved) as Partial<AdvancedProfile>;
        setProfile({ ...base, ...parsed, stats: { ...base.stats, ...parsed.stats } });
      } catch {
        window.localStorage.removeItem(`vertyx-profile:${base.id}`);
        setProfile(base);
      } finally {
        hydratedRef.current = true;
      }
    };
    void hydrate();
  }, [ready, session.profile]);

  useEffect(() => {
    if (!ready || !profile.id || !hydratedRef.current) return;
    window.localStorage.setItem(`vertyx-profile:${profile.id}`, JSON.stringify(profile));
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }).catch(() => undefined);
    }, 650);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [profile, ready]);

  useGSAP(() => {
    if (!panelRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(panelRef.current.querySelectorAll('[data-profile-reveal]'), { autoAlpha: 0, y: 12, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .42, stagger: .035, ease: 'power2.out', overwrite: true });
  }, { scope: panelRef, dependencies: [activeTab] });

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (avatarRef.current) gsap.fromTo(avatarRef.current, { scale: .96, filter: 'brightness(1.18)' }, { scale: 1, filter: 'brightness(1)', duration: .45, ease: 'power2.out' });
  }, { dependencies: [profile.theme.avatarUrl] });

  useGSAP(() => {
    if (!bannerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(bannerRef.current, { filter: 'blur(5px) brightness(1.12)' }, { filter: 'blur(0px) brightness(1)', duration: .55, ease: 'power2.out' });
  }, { dependencies: [profile.theme.bannerUrl, profile.theme.backgroundId] });

  const runAction = async (url: string, body?: Record<string, unknown>) => {
    setBusy(true);
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
      const result = await response.json().catch(() => ({ message: 'No se pudo completar la acción.' })) as { message?: string; authorizationUrl?: string };
      setNotice(result.message);
      return result;
    } finally { setBusy(false); }
  };
  const continueWithProvider = async (provider: 'google' | 'discord') => { const result = await runAction(`/api/profile/oauth/${provider}`); if (result.authorizationUrl) window.location.assign(result.authorizationUrl); };
  const signIn = async () => { setBusy(true); const response = await fetch('/api/session/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'guest' }) }); if (response.ok) await refresh(); else setNotice('No se pudo iniciar como invitado.'); setBusy(false); };
  const logout = async () => { setBusy(true); await fetch('/api/session/logout', { method: 'POST' }); window.localStorage.removeItem(`vertyx-profile:${profile.id}`); await refresh(); setBusy(false); };

  const requestAssetPersistence = async (kind: ProfileAssetKind, file?: File) => {
    if (!file) return void runAction('/api/profile/assets', { kind });
    setBusy(true);
    const form = new FormData();
    form.set('kind', kind);
    form.set('file', file);
    try {
      const response = await fetch('/api/profile/assets', { method: 'POST', body: form });
      const result = await response.json().catch(() => ({ message: 'No se pudo guardar el archivo.' })) as { message?: string; url?: string };
      setNotice(result.message ?? 'Archivo procesado.');
      if (response.ok && result.url) {
        setProfile((current) => ({ ...current, theme: { ...current.theme, ...(kind === 'avatar' ? { avatarUrl: result.url } : { bannerUrl: result.url }) } }));
      }
    } catch {
      setNotice('No se pudo guardar el archivo.');
    } finally {
      setBusy(false);
    }
  };
  const publicUrl = profilePublicUrl(profile.username);
  const canSubmit = hasPermission(profile.role, 'submission:create');
  const canAccessAdmin = hasPermission(profile.role, 'activity:read');
  const showRole = profile.role !== 'guest';
  const stats = useMemo(() => ({ ...profile.stats, favorites, saved: favorites + history, hoursPlayed: Math.max(profile.stats.hoursPlayed, Math.round(progress * 1.6)) }), [favorites, history, profile.stats, progress]);
  const activeTabIndex = Math.max(0, TABS.findIndex((tab) => tab.id === activeTab));
  const bannerBackground = PROFILE_BACKGROUNDS.find((item) => item.id === profile.theme.backgroundId)?.preview;

  if (!ready) return null;
  if (!session.profile) return <section className="vault-auth-card"><div className="vault-auth-card__brand"><img src="/Vertyx-Vault-2.png" alt="Vertyx Vault" /></div><span className="vault-page__eyebrow">Acceso seguro</span><h2>Entra a tu cuenta</h2><p>Continúa con un proveedor para iniciar sesión o crear tu cuenta. No creamos ningún perfil hasta que el proveedor confirme tu identidad.</p><div className="vault-auth-card__providers"><button type="button" disabled={busy} onClick={() => continueWithProvider('google')}><span className="vault-auth-card__provider-icon"><img src="/social-logo.svg" alt="" aria-hidden="true" /></span>Continuar con Google</button><button type="button" disabled={busy} onClick={() => continueWithProvider('discord')}><span className="vault-auth-card__provider-icon"><img src="/discord-logo.svg" alt="" aria-hidden="true" /></span>Continuar con Discord</button><button type="button" className="vault-auth-card__guest" disabled={busy} onClick={signIn}><span className="vault-auth-card__provider-icon"><img src="/Guest-Logo.png" alt="" aria-hidden="true" /></span>Explorar como invitado</button></div>{notice && <p className="vault-profile-notice">{notice}</p>}<small>Al continuar aceptas los términos y la política de privacidad de Vertyx.</small></section>;

  return <div className="vault-profile-studio vault-profile-studio--refined" style={{ '--profile-accent': profile.theme.accent, '--profile-color': profile.theme.profileColor, '--tab-index': activeTabIndex } as React.CSSProperties}>
    <section className="vault-profile-hero-card" data-profile-reveal>
      <div ref={bannerRef} className="vault-profile-hero-card__banner" style={{ background: bannerBackground }}>
        {profile.theme.bannerUrl && <img src={profile.theme.bannerUrl} alt="" style={{ objectPosition: `${profile.theme.bannerFocus.x}% ${profile.theme.bannerFocus.y}%`, transform: `scale(${profile.theme.bannerFocus.zoom})` }} />}
        <div className="vault-profile-hero-card__shade" />
        <span className="vault-profile-plan">{profile.plan === 'pro' ? 'PRO' : 'FREE'}</span>
      </div>
      <div className="vault-profile-hero-card__content">
        <div ref={avatarRef} className={`vault-profile-avatar-refined vault-profile-card__avatar--${profile.theme.avatarFrameId}`}>
          {profile.theme.avatarUrl ? <img src={profile.theme.avatarUrl} alt="" style={{ objectPosition: `${profile.theme.avatarFocus.x}% ${profile.theme.avatarFocus.y}%`, transform: `scale(${profile.theme.avatarFocus.zoom})` }} /> : profile.displayName.slice(0, 1).toUpperCase()}
          <span className="vault-profile-avatar-refined__status" aria-label="Estado en línea" />
          {showRole && <span className="vault-profile-avatar-refined__role">{ROLE_LABELS[profile.role].slice(0, 1)}</span>}
        </div>
        <div className="vault-profile-identity-block">
          <div className="vault-profile-name-row"><h2>{profile.displayName}</h2>{showRole && <span className="vault-profile-role">{ROLE_LABELS[profile.role]}</span>}</div>
          <p className="vault-profile-handle">@{profile.username}</p>
          <p className="vault-profile-card__status">{profile.status}</p>
          <p className="vault-profile-bio">{profile.bio}</p>
          <div className="vault-profile-badges" aria-label="Insignias visibles">{profile.badges.map((badge) => <span key={badge.id} className={`vault-badge vault-badge--${badge.tone} ${badge.animated ? 'vault-badge--animated' : ''}`}>{badge.label}</span>)}</div>
        </div>
        <div className="vault-profile-quick-actions">
          <Link className="vault-profile-button vault-profile-button--primary" href={publicUrl}>Ver perfil público</Link>
          {canSubmit && <Link className="vault-profile-button vault-profile-button--submit" href="/submit"><CirclePlayIcon className="h-4 w-4" />Enviar película o serie</Link>}
          {canAccessAdmin && <Link className="vault-profile-button vault-profile-button--admin" href="/admin">Panel de administración</Link>}
          <button type="button" className="vault-profile-button vault-profile-button--quiet" onClick={logout} disabled={busy}>Cerrar sesión</button>
        </div>
      </div>
      <div className="vault-profile-stat-strip" aria-label="Estadísticas del perfil">
        {[['Favoritos', stats.favorites], ['Guardados', stats.saved], ['Horas', stats.hoursPlayed], ['Racha', stats.streakDays]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
    </section>

    <div className="vault-profile-main">
      <aside className="vault-profile-rail" aria-label="Resumen de la cuenta">
        <h3>Resumen de cuenta</h3>
        <dl className="vault-profile-rail__meta"><div><dt>Miembro desde</dt><dd>{new Date(profile.createdAt).toLocaleDateString('es')}</dd></div><div><dt>Última conexión</dt><dd>{new Date(profile.lastSeenAt).toLocaleDateString('es')}</dd></div><div><dt>Plan</dt><dd>{profile.plan === 'pro' ? 'Pro' : 'Gratis'}</dd></div><div><dt>Ubicación</dt><dd>{profile.country || 'Sin configurar'}</dd></div></dl>
      </aside>

      <section className="vault-profile-workspace vault-profile-workspace--refined">
        <header className="vault-profile-workspace__top"><div><span className="vault-page__eyebrow">Configuración</span><h2>{TABS.find((tab) => tab.id === activeTab)?.label}</h2></div></header>
        <nav className="vault-profile-tabs vault-profile-tabs--refined" style={{ '--tab-index': activeTabIndex } as React.CSSProperties} aria-label="Secciones de perfil"><span className="vault-profile-tabs__indicator" aria-hidden="true" />{TABS.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? 'vault-profile-tabs__tab vault-profile-tabs__tab--active' : 'vault-profile-tabs__tab'} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</nav>
        {notice && <p className="vault-profile-notice" role="status">{notice}</p>}
        <div ref={panelRef} className="vault-profile-panel">
          {activeTab === 'identity' && <div className="vault-profile-settings" data-profile-reveal>
            <section className="vault-profile-settings__section"><div><span className="vault-page__eyebrow">Identidad pública</span><h3>Así te verá la comunidad</h3></div><div className="vault-profile-settings__fields"><Field label="Nombre visible"><input value={profile.displayName} maxLength={80} onChange={(event) => setProfile((current) => ({ ...current, displayName: event.target.value }))} /></Field><Field label="Usuario"><input value={profile.username} maxLength={24} onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))} /></Field><Field label="Estado"><input value={profile.status} maxLength={120} onChange={(event) => setProfile((current) => ({ ...current, status: event.target.value }))} /></Field><Field label="Biografía"><textarea value={profile.bio} maxLength={220} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} /></Field></div></section>
            <section className="vault-profile-settings__section"><div><span className="vault-page__eyebrow">Imágenes</span><h3>Avatar y encabezado</h3><p>Los cambios se guardan automáticamente.</p></div><div className="vault-profile-settings__uploads"><Field label="Foto de perfil"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImage(file, (avatarUrl) => { setProfile((current) => ({ ...current, theme: { ...current.theme, avatarUrl } })); void requestAssetPersistence('avatar', file); }); }} /></Field><Field label="Imagen de encabezado"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImage(file, (bannerUrl) => { setProfile((current) => ({ ...current, theme: { ...current.theme, bannerUrl } })); void requestAssetPersistence('banner', file); }); }} /></Field></div></section>
          </div>}

          {activeTab === 'appearance' && <div className="vault-profile-settings" data-profile-reveal><section className="vault-profile-settings__section"><div><span className="vault-page__eyebrow">Tema</span><h3>Personaliza tu espacio</h3></div><div className="vault-profile-settings__fields"><div className="vault-profile-section"><h3>Color de acento</h3><div className="vault-color-row">{PROFILE_ACCENTS.map((accent) => <button key={accent} type="button" aria-label={`Usar acento ${accent}`} style={{ background: accent }} className={profile.theme.accent === accent ? 'vault-color-dot vault-color-dot--active' : 'vault-color-dot'} onClick={() => setProfile((current) => ({ ...current, theme: { ...current.theme, accent } }))} />)}</div></div><div className="vault-profile-section"><h3>Fondo</h3><div className="vault-choice-grid">{PROFILE_BACKGROUNDS.filter((background) => !background.proOnly).map((background) => <button key={background.id} type="button" className={profile.theme.backgroundId === background.id ? 'vault-profile-choice vault-profile-choice--active' : 'vault-profile-choice'} onClick={() => setProfile((current) => ({ ...current, theme: { ...current.theme, backgroundId: background.id } }))}><span style={{ background: background.preview }} /><strong>{background.label}</strong></button>)}</div></div></div></section></div>}

          {activeTab === 'preferences' && <div className="vault-profile-grid" data-profile-reveal>
            <Field label="Tema"><select value={profile.preferences.theme} onChange={(event) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, theme: event.target.value as AdvancedProfile['preferences']['theme'] } }))}><option value="system">Sistema</option><option value="dark">Oscuro</option><option value="cinematic">Cinemático</option></select></Field>
            <Field label="Idioma"><select value={profile.preferences.language} onChange={(event) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, language: event.target.value } }))}><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option></select></Field>
            <Field label="Zona horaria"><input value={profile.preferences.timezone} onChange={(event) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, timezone: event.target.value } }))} /></Field>
            <Field label="Formato fecha/hora"><select value={profile.preferences.dateTimeFormat} onChange={(event) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, dateTimeFormat: event.target.value as AdvancedProfile['preferences']['dateTimeFormat'] } }))}><option value="24h">24 horas</option><option value="12h">12 horas</option><option value="relative">Relativo</option></select></Field>
            <Field label="Calidad preferida"><select value={profile.preferences.playbackQuality} onChange={(event) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, playbackQuality: event.target.value as AdvancedProfile['preferences']['playbackQuality'] } }))}><option value="auto">Automática</option><option value="4k">4K</option><option value="1080p">1080p</option><option value="720p">720p</option></select></Field>
            <Toggle label="Reproducción automática" checked={profile.preferences.autoplay} onChange={(autoplay) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, autoplay } }))} />
            <Toggle label="Notificaciones" checked={profile.preferences.notifications} onChange={(notifications) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, notifications } }))} />
            {(['showActivity', 'showFavorites', 'showBadges', 'showOnline'] as const).map((key) => <Toggle key={key} label={key.replace('show', 'Mostrar ')} checked={profile.preferences.privacy[key]} onChange={(value) => setProfile((current) => ({ ...current, preferences: { ...current.preferences, privacy: { ...current.preferences.privacy, [key]: value } } }))} />)}
          </div>}

        </div>
      </section>
    </div>
  </div>;
}
