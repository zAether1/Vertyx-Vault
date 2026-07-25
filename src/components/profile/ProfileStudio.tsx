'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BellIcon, BoltIcon, CirclePlayIcon, StarSmallIcon } from '@/components/icons';
import { useLibraryStore } from '@/store/library';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import { AVATAR_FRAMES, PROFILE_ACCENTS, PROFILE_BACKGROUNDS, profilePublicUrl } from '@/lib/profile';
import { profileFromSession, type AdvancedProfile, type ProfileIntegrationStatus } from '@/types/profile';
import type { ActionResult, OAuthProvider, ProfileAssetKind } from '@/types/infrastructure';

const TABS = [
  { id: 'identity', label: 'Identidad' },
  { id: 'appearance', label: 'Apariencia' },
  { id: 'security', label: 'Seguridad' },
  { id: 'preferences', label: 'Preferencias' },
  { id: 'stats', label: 'Estadísticas' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const emptyStatus: ProfileIntegrationStatus = { auth: false, blob: false, payments: false, discord: false, moderation: false, activity: false };

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
  const [name, setName] = useState('Usuario Vertyx');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [integrations, setIntegrations] = useState<ProfileIntegrationStatus>(emptyStatus);
  const [profile, setProfile] = useState<AdvancedProfile>(() => profileFromSession());
  const panelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ready) return;
    const base = profileFromSession(session.profile);
    const saved = window.localStorage.getItem(`vertyx-profile:${base.id}`);
    if (!saved) {
      setProfile(base);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as Partial<AdvancedProfile>;
      setProfile({ ...base, ...parsed, stats: { ...base.stats, ...parsed.stats } });
    } catch {
      window.localStorage.removeItem(`vertyx-profile:${base.id}`);
      setProfile(base);
    }
  }, [ready, session.profile]);

  useEffect(() => {
    void fetch('/api/profile/status').then((response) => response.ok ? response.json() as Promise<ProfileIntegrationStatus> : emptyStatus).then(setIntegrations).catch(() => setIntegrations(emptyStatus));
  }, []);

  useEffect(() => {
    if (!ready || !profile.id) return;
    window.localStorage.setItem(`vertyx-profile:${profile.id}`, JSON.stringify(profile));
  }, [profile, ready]);

  useGSAP(() => {
    if (!panelRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(panelRef.current.querySelectorAll('[data-profile-reveal]'), { autoAlpha: 0, y: 14, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .45, stagger: .04, ease: 'power2.out', overwrite: true });
  }, { scope: panelRef, dependencies: [activeTab] });

  useGSAP(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (event: PointerEvent) => {
      const box = card.getBoundingClientRect();
      gsap.to(card, { rotateX: ((event.clientY - box.top) / box.height - .5) * -3, rotateY: ((event.clientX - box.left) / box.width - .5) * 3, duration: .45, ease: 'power2.out', overwrite: true });
    };
    const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .5, ease: 'power2.out' });
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    return () => { card.removeEventListener('pointermove', onMove); card.removeEventListener('pointerleave', onLeave); };
  }, { scope: cardRef });

  const signIn = async (mode: 'guest' | 'local') => {
    setBusy(true); setNotice(undefined);
    const response = await fetch('/api/session/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, name }) });
    if (response.ok) await refresh(); else setNotice('No se pudo iniciar la sesión local.');
    setBusy(false);
  };

  const logout = async () => { setBusy(true); await fetch('/api/session/logout', { method: 'POST' }); window.localStorage.removeItem(`vertyx-profile:${profile.id}`); await refresh(); setBusy(false); };
  const runAction = async (url: string, body?: Record<string, unknown>) => {
    setBusy(true);
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
      const result = await response.json().catch(() => ({ message: 'No se pudo completar la acción.' })) as Partial<ActionResult>;
      setNotice(result.message ?? 'Acción registrada.');
      return result;
    } catch {
      setNotice('No se pudo completar la acción.');
      return { ok: false, ready: false };
    } finally {
      setBusy(false);
    }
  };
  const requestAssetPersistence = (kind: ProfileAssetKind) => void runAction('/api/profile/assets', { kind });
  const requestOAuth = (provider: OAuthProvider) => void runAction(`/api/profile/oauth/${provider}`);
  const requestProCheckout = () => void runAction('/api/profile/pro/checkout');
  const publicUrl = profilePublicUrl(profile.username);
  const isPro = profile.plan === 'pro';
  const stats = useMemo(() => ({ ...profile.stats, favorites, saved: favorites + history, hoursPlayed: Math.max(profile.stats.hoursPlayed, Math.round(progress * 1.6)) }), [favorites, history, profile.stats, progress]);

  if (!ready) return null;

  return <div className="vault-profile-studio" style={{ '--profile-accent': profile.theme.accent, '--profile-color': profile.theme.profileColor } as React.CSSProperties}>
    <section className="vault-profile-card" ref={cardRef} data-profile-reveal>
      <div className="vault-profile-card__banner" style={{ background: PROFILE_BACKGROUNDS.find((item) => item.id === profile.theme.backgroundId)?.preview }}>
        {profile.theme.bannerUrl && <img src={profile.theme.bannerUrl} alt="" style={{ objectPosition: `${profile.theme.bannerFocus.x}% ${profile.theme.bannerFocus.y}%`, transform: `scale(${profile.theme.bannerFocus.zoom})` }} />}
        <span>{isPro ? 'PRO ACTIVE' : 'VAULT PROFILE'}</span>
      </div>
      <div className={`vault-profile-card__avatar vault-profile-card__avatar--${profile.theme.avatarFrameId}`}>
        {profile.theme.avatarUrl ? <img src={profile.theme.avatarUrl} alt="" style={{ objectPosition: `${profile.theme.avatarFocus.x}% ${profile.theme.avatarFocus.y}%`, transform: `scale(${profile.theme.avatarFocus.zoom})` }} /> : profile.displayName.slice(0, 1).toUpperCase()}
      </div>
      <div className="vault-profile-card__body">
        <div className="vault-profile-card__title"><div><h2>{profile.displayName}</h2><p>@{profile.username} · {profile.id}</p></div><span className="vault-profile-role">{profile.role.toUpperCase()}</span></div>
        <p className="vault-profile-card__status">{profile.status}</p>
        <p>{profile.bio}</p>
        <div className="vault-profile-badges" aria-label="Insignias visibles">{profile.badges.map((badge) => <span key={badge.id} className={`vault-badge vault-badge--${badge.tone} ${badge.animated ? 'vault-badge--animated' : ''}`}>{badge.label}</span>)}</div>
        <dl className="vault-profile-card__meta"><div><dt>Registro</dt><dd>{new Date(profile.createdAt).toLocaleDateString('es')}</dd></div><div><dt>Cuenta</dt><dd>{profile.plan}</dd></div><div><dt>País</dt><dd>{profile.country || 'Opcional'}</dd></div></dl>
        <Link className="vault-action" href={publicUrl}>Ver perfil público</Link>
      </div>
    </section>

    <section className="vault-profile-workspace">
      <header className="vault-profile-workspace__top">
        <div><span className="vault-page__eyebrow">Perfil avanzado</span><h2>Centro de identidad</h2><p>Personalización, seguridad, privacidad y beneficios Pro preparados para integrarse con backend real.</p></div>
        <div className="vault-profile-stage__actions">{session.profile ? <button type="button" className="vault-action" onClick={logout} disabled={busy}>Cerrar sesión</button> : <><input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Nombre visible" aria-label="Nombre visible" /><button type="button" className="vault-action" disabled={busy} onClick={() => signIn('local')}>Crear cuenta</button><button type="button" className="vault-filter" disabled={busy} onClick={() => signIn('guest')}>Invitado</button></>}</div>
      </header>

      <nav className="vault-profile-tabs" aria-label="Secciones de perfil">{TABS.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? 'vault-profile-tabs__tab vault-profile-tabs__tab--active' : 'vault-profile-tabs__tab'} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</nav>

      {notice && <p className="vault-profile-notice" role="status">{notice}</p>}
      <div ref={panelRef} className="vault-profile-panel">
        {activeTab === 'identity' && <div className="vault-profile-grid" data-profile-reveal>
          <Field label="Foto de perfil"><input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && readImage(event.target.files[0], (avatarUrl) => { setProfile((current) => ({ ...current, theme: { ...current.theme, avatarUrl } })); requestAssetPersistence('avatar'); })} /></Field>
          <Field label="Banner"><input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && readImage(event.target.files[0], (bannerUrl) => { setProfile((current) => ({ ...current, theme: { ...current.theme, bannerUrl } })); requestAssetPersistence('banner'); })} /></Field>
          <Field label="Ajuste avatar"><input type="range" min="1" max="1.8" step="0.05" value={profile.theme.avatarFocus.zoom} onChange={(event) => setProfile((current) => ({ ...current, theme: { ...current.theme, avatarFocus: { ...current.theme.avatarFocus, zoom: Number(event.target.value) } } }))} /></Field>
          <Field label="Ajuste banner"><input type="range" min="1" max="1.8" step="0.05" value={profile.theme.bannerFocus.zoom} onChange={(event) => setProfile((current) => ({ ...current, theme: { ...current.theme, bannerFocus: { ...current.theme.bannerFocus, zoom: Number(event.target.value) } } }))} /></Field>
          <Field label="Nombre visible"><input value={profile.displayName} onChange={(event) => setProfile((current) => ({ ...current, displayName: event.target.value }))} /></Field>
          <Field label="Usuario"><input value={profile.username} onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))} /></Field>
          <Field label="Estado"><input value={profile.status} onChange={(event) => setProfile((current) => ({ ...current, status: event.target.value }))} /></Field>
          <Field label="Pronombres"><input value={profile.pronouns ?? ''} onChange={(event) => setProfile((current) => ({ ...current, pronouns: event.target.value }))} /></Field>
          <Field label="País o región"><input value={profile.country ?? ''} onChange={(event) => setProfile((current) => ({ ...current, country: event.target.value }))} /></Field>
          <Field label="Biografía"><textarea value={profile.bio} maxLength={220} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} /></Field>
        </div>}

        {activeTab === 'appearance' && <div className="vault-profile-grid" data-profile-reveal>
          <div className="vault-profile-section vault-profile-section--wide"><h3>Color de acento</h3><div className="vault-color-row">{PROFILE_ACCENTS.map((accent) => <button key={accent} type="button" aria-label={`Usar acento ${accent}`} style={{ background: accent }} className={profile.theme.accent === accent ? 'vault-color-dot vault-color-dot--active' : 'vault-color-dot'} onClick={() => setProfile((current) => ({ ...current, theme: { ...current.theme, accent } }))} />)}</div></div>
          <Field label="Color del perfil"><input type="color" value={profile.theme.profileColor} onChange={(event) => setProfile((current) => ({ ...current, theme: { ...current.theme, profileColor: event.target.value } }))} /></Field>
          <div className="vault-profile-section vault-profile-section--wide"><h3>Fondos exclusivos</h3><div className="vault-choice-grid">{PROFILE_BACKGROUNDS.map((background) => <button key={background.id} type="button" disabled={background.proOnly && !isPro} className={profile.theme.backgroundId === background.id ? 'vault-profile-choice vault-profile-choice--active' : 'vault-profile-choice'} onClick={() => setProfile((current) => ({ ...current, theme: { ...current.theme, backgroundId: background.id } }))}><span style={{ background: background.preview }} /><strong>{background.label}</strong>{background.proOnly && <small>Pro</small>}</button>)}</div></div>
          <div className="vault-profile-section vault-profile-section--wide"><h3>Marcos</h3><div className="vault-choice-grid">{AVATAR_FRAMES.map((frame) => <button key={frame.id} type="button" disabled={frame.proOnly && !isPro} className={profile.theme.avatarFrameId === frame.id ? 'vault-profile-choice vault-profile-choice--active' : 'vault-profile-choice'} onClick={() => setProfile((current) => ({ ...current, theme: { ...current.theme, avatarFrameId: frame.id } }))}><strong>{frame.label}</strong>{frame.proOnly && <small>Pro</small>}</button>)}</div></div>
          <article className="vault-pro-card vault-profile-section--wide"><div><span className="vault-page__eyebrow">Vertyx Vault Pro</span><h3>USD $2.00 <small>/ mes</small></h3><p>Insignia animada, marcos, banners, colores premium, acceso anticipado, sin anuncios y sincronización futura con Discord.</p></div><button type="button" disabled={busy} onClick={requestProCheckout}><StarSmallIcon className="h-4 w-4" />Activar Pro</button></article>
        </div>}

        {activeTab === 'security' && <div className="vault-profile-grid" data-profile-reveal>
          <Field label="Correo electrónico"><input type="email" value={profile.security.email} onChange={(event) => setProfile((current) => ({ ...current, security: { ...current.security, email: event.target.value } }))} /></Field>
          <button type="button" className="vault-profile-command" onClick={() => setNotice(integrations.auth ? 'Flujo de cambio de contraseña listo para el proveedor de autenticación.' : 'Conecta VERTYX_AUTH_API_URL para cambiar contraseña de forma real.')}><BoltIcon className="h-5 w-5" />Cambiar contraseña</button>
          <button type="button" className="vault-profile-command" onClick={() => setNotice(integrations.auth ? 'Flujo de cambio de correo listo.' : 'Conecta autenticación real para confirmar cambios de correo.')}><BellIcon className="h-5 w-5" />Cambiar correo</button>
          <Toggle label="Google vinculado" checked={profile.security.providers.google} onChange={(value) => { setProfile((current) => ({ ...current, security: { ...current.security, providers: { ...current.security.providers, google: value } } })); requestOAuth('google'); }} />
          <Toggle label="Discord vinculado" checked={profile.security.providers.discord} onChange={(value) => { setProfile((current) => ({ ...current, security: { ...current.security, providers: { ...current.security.providers, discord: value } } })); requestOAuth('discord'); }} />
          <Toggle label="Autenticación en dos pasos" checked={profile.security.twoFactorEnabled} onChange={(value) => setProfile((current) => ({ ...current, security: { ...current.security, twoFactorEnabled: value } }))} />
          <div className="vault-profile-section"><h3>Sesiones activas</h3>{profile.security.sessions.map((item) => <p key={item.id}>{item.device} · {item.location} {item.current ? '· actual' : ''}</p>)}<button type="button" onClick={() => setNotice('Las demás sesiones se cerrarán cuando exista proveedor de sesión persistente.')}>Cerrar otros dispositivos</button></div>
          <div className="vault-profile-section"><h3>Historial de accesos</h3>{profile.security.loginHistory.map((item) => <p key={item.id}>{item.provider} · {item.device} · {new Date(item.at).toLocaleString('es')}</p>)}</div>
          <button type="button" className="vault-profile-danger" onClick={() => window.confirm('¿Eliminar esta cuenta de Vertyx Vault? Esta acción requerirá backend real para completarse.') && setNotice('Eliminación preparada; falta conectar backend de cuentas.')}>Eliminar cuenta</button>
        </div>}

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

        {activeTab === 'stats' && <div className="vault-profile-section vault-profile-section--wide" data-profile-reveal><div className="vault-profile-stats">{Object.entries({ 'Películas vistas': stats.moviesWatched, 'Series vistas': stats.seriesWatched, 'Horas reproducidas': stats.hoursPlayed, Favoritos: stats.favorites, Guardados: stats.saved, Enviados: stats.submitted, Aprobados: stats.approved, 'Días en Vertyx': stats.memberDays, Racha: stats.streakDays }).map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><div className="vault-profile-integrations"><h3>Infraestructura</h3>{Object.entries(integrations).map(([key, value]) => <span key={key} className={value ? 'vault-integration vault-integration--on' : 'vault-integration'}>{key}: {value ? 'conectado' : 'pendiente'}</span>)}</div></div>}
      </div>
    </section>
  </div>;
}
