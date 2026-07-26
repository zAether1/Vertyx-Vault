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
import type { AccountSecurityOverview } from '@/types/account';
import type { ProSubscriptionState } from '@/types/pro';

const TABS = [
  { id: 'identity', label: 'Identidad' },
  { id: 'appearance', label: 'Apariencia' },
  { id: 'security', label: 'Seguridad' },
  { id: 'preferences', label: 'Preferencias' },
  { id: 'stats', label: 'Estadísticas' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const emptyStatus: ProfileIntegrationStatus = { auth: false, blob: false, payments: false, discord: false, moderation: false, activity: false };
const emptySecurity: AccountSecurityOverview = { ready: false, sessions: [], loginHistory: [], twoFactorEnabled: false, providers: { google: false, discord: false } };
const emptyPro: ProSubscriptionState = { ready: false, status: 'inactive', priceUsd: 2, interval: 'month', discordSync: 'unavailable', benefits: [] };

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
  const [security, setSecurity] = useState<AccountSecurityOverview>(emptySecurity);
  const [pro, setPro] = useState<ProSubscriptionState>(emptyPro);
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
    void fetch('/api/profile/status').then((response) => response.ok ? response.json() as Promise<ProfileIntegrationStatus> : emptyStatus).then(setIntegrations).catch(() => setIntegrations(emptyStatus));
    void fetch('/api/account/security').then((response) => response.ok ? response.json() as Promise<AccountSecurityOverview> : emptySecurity).then((overview) => {
      setSecurity(overview);
      setProfile((current) => ({ ...current, security: { ...current.security, sessions: overview.sessions, loginHistory: overview.loginHistory, twoFactorEnabled: overview.twoFactorEnabled, providers: overview.providers } }));
    }).catch(() => setSecurity(emptySecurity));
    void fetch('/api/profile/pro/subscription').then((response) => response.ok ? response.json() as Promise<ProSubscriptionState> : emptyPro).then((subscription) => {
      setPro(subscription);
      setProfile((current) => ({ ...current, plan: subscription.status === 'active' ? 'pro' : current.plan }));
    }).catch(() => setPro(emptyPro));
  }, []);

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
  const requestAssetPersistence = async (kind: ProfileAssetKind, file?: File) => {
    if (!file) return void runAction('/api/profile/assets', { kind });
    setBusy(true);
    const form = new FormData();
    form.set('kind', kind);
    form.set('file', file);
    try {
      const response = await fetch('/api/profile/assets', { method: 'POST', body: form });
      const result = await response.json().catch(() => ({ message: 'No se pudo guardar el archivo.' })) as Partial<ActionResult> & { url?: string };
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
  const requestOAuth = async (provider: OAuthProvider) => {
    const result = await runAction(`/api/profile/oauth/${provider}`) as Partial<ActionResult> & { authorizationUrl?: string };
    if (result.authorizationUrl) window.location.assign(result.authorizationUrl);
  };
  const continueWithProvider = async (provider: OAuthProvider) => { await requestOAuth(provider); };
  const requestProCheckout = async () => {
    const result = await runAction('/api/profile/pro/checkout') as Partial<ActionResult> & { checkoutUrl?: string; subscription?: ProSubscriptionState };
    if (result.subscription) setPro(result.subscription);
    if (result.checkoutUrl) window.location.href = result.checkoutUrl;
  };
  const requestProPortal = () => void runAction('/api/profile/pro/portal');
  const requestDiscordProSync = () => void runAction('/api/profile/pro/discord');
  const requestEmailChange = () => void runAction('/api/account/email', { email: profile.security.email });
  const requestPasswordChange = () => void runAction('/api/account/password');
  const requestTwoFactor = (enabled: boolean) => {
    setProfile((current) => ({ ...current, security: { ...current.security, twoFactorEnabled: enabled } }));
    void runAction('/api/account/two-factor', { enabled });
  };
  const requestCloseOtherSessions = () => void runAction('/api/account/sessions/logout-others');
  const requestDeleteAccount = () => window.confirm('¿Eliminar esta cuenta de Vertyx Vault? Escribe ELIMINAR en el proveedor real para completar la acción.') && void runAction('/api/account/delete', { confirmation: 'ELIMINAR' });
  const publicUrl = profilePublicUrl(profile.username);
  const isPro = profile.plan === 'pro';
  const stats = useMemo(() => ({ ...profile.stats, favorites, saved: favorites + history, hoursPlayed: Math.max(profile.stats.hoursPlayed, Math.round(progress * 1.6)) }), [favorites, history, profile.stats, progress]);
  const activeTabIndex = Math.max(0, TABS.findIndex((tab) => tab.id === activeTab));
  const bannerBackground = PROFILE_BACKGROUNDS.find((item) => item.id === profile.theme.backgroundId)?.preview;

  if (!ready) return null;
  if (!session.profile) return <section className="vault-auth-card"><div className="vault-auth-card__brand">VERTYX</div><span className="vault-page__eyebrow">Acceso seguro</span><h2>Entra a tu cuenta</h2><p>Continúa con un proveedor para iniciar sesión o crear tu cuenta. No creamos ningún perfil hasta que el proveedor confirme tu identidad.</p><div className="vault-auth-card__providers"><button type="button" disabled={busy} onClick={() => continueWithProvider('google')}>Continuar con Google</button><button type="button" disabled={busy} onClick={() => continueWithProvider('discord')}>Continuar con Discord</button><button type="button" className="vault-auth-card__guest" disabled={busy} onClick={() => signIn('guest')}>Explorar como invitado</button></div>{notice && <p className="vault-profile-notice">{notice}</p>}<small>Al continuar aceptas los términos y la política de privacidad de Vertyx.</small></section>;

  return <div className="vault-profile-studio vault-profile-studio--refined" style={{ '--profile-accent': profile.theme.accent, '--profile-color': profile.theme.profileColor, '--tab-index': activeTabIndex } as React.CSSProperties}>
    <section className="vault-profile-hero-card" data-profile-reveal>
      <div ref={bannerRef} className="vault-profile-hero-card__banner" style={{ background: bannerBackground }}>
        {profile.theme.bannerUrl && <img src={profile.theme.bannerUrl} alt="" style={{ objectPosition: `${profile.theme.bannerFocus.x}% ${profile.theme.bannerFocus.y}%`, transform: `scale(${profile.theme.bannerFocus.zoom})` }} />}
        <div className="vault-profile-hero-card__shade" />
        <span className="vault-profile-plan">{isPro ? 'PRO' : 'FREE'}</span>
      </div>
      <div className="vault-profile-hero-card__content">
        <div ref={avatarRef} className={`vault-profile-avatar-refined vault-profile-card__avatar--${profile.theme.avatarFrameId}`}>
          {profile.theme.avatarUrl ? <img src={profile.theme.avatarUrl} alt="" style={{ objectPosition: `${profile.theme.avatarFocus.x}% ${profile.theme.avatarFocus.y}%`, transform: `scale(${profile.theme.avatarFocus.zoom})` }} /> : profile.displayName.slice(0, 1).toUpperCase()}
          <span className="vault-profile-avatar-refined__status" aria-label="Estado en línea" />
          <span className="vault-profile-avatar-refined__role">{profile.role.slice(0, 1).toUpperCase()}</span>
        </div>
        <div className="vault-profile-identity-block">
          <div className="vault-profile-name-row"><h2>{profile.displayName}</h2><span className="vault-profile-role">{profile.role.toUpperCase()}</span></div>
          <p className="vault-profile-handle">@{profile.username} · {profile.id}</p>
          <p className="vault-profile-card__status">{profile.status}</p>
          <p className="vault-profile-bio">{profile.bio}</p>
          <div className="vault-profile-badges" aria-label="Insignias visibles">{profile.badges.map((badge) => <span key={badge.id} className={`vault-badge vault-badge--${badge.tone} ${badge.animated ? 'vault-badge--animated' : ''}`}>{badge.label}</span>)}</div>
        </div>
        <div className="vault-profile-quick-actions">
          <Link className="vault-profile-button vault-profile-button--primary" href={publicUrl}>Perfil público</Link>
          <button type="button" className="vault-profile-button" onClick={logout} disabled={busy}>Salir</button>
        </div>
      </div>
      <div className="vault-profile-stat-strip" aria-label="Estadísticas del perfil">
        {[['Favoritos', stats.favorites], ['Guardados', stats.saved], ['Horas', stats.hoursPlayed], ['Racha', stats.streakDays]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
    </section>

    <div className="vault-profile-main">
      <aside className="vault-profile-rail" aria-label="Resumen del perfil">
        <dl className="vault-profile-rail__meta"><div><dt>Registro</dt><dd>{new Date(profile.createdAt).toLocaleDateString('es')}</dd></div><div><dt>Última conexión</dt><dd>{new Date(profile.lastSeenAt).toLocaleDateString('es')}</dd></div><div><dt>Cuenta</dt><dd>{profile.plan}</dd></div><div><dt>País</dt><dd>{profile.country || 'Opcional'}</dd></div></dl>
        <div className="vault-profile-integrations vault-profile-integrations--rail"><h3>Infraestructura</h3>{Object.entries(integrations).map(([key, value]) => <span key={key} className={value ? 'vault-integration vault-integration--on' : 'vault-integration'}>{key}: {value ? 'conectado' : 'pendiente'}</span>)}</div>
      </aside>

      <section className="vault-profile-workspace vault-profile-workspace--refined">
        <header className="vault-profile-workspace__top"><div><span className="vault-page__eyebrow">Perfil avanzado</span><h2>{TABS.find((tab) => tab.id === activeTab)?.label}</h2></div></header>
        <nav className="vault-profile-tabs vault-profile-tabs--refined" style={{ '--tab-index': activeTabIndex } as React.CSSProperties} aria-label="Secciones de perfil"><span className="vault-profile-tabs__indicator" aria-hidden="true" />{TABS.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? 'vault-profile-tabs__tab vault-profile-tabs__tab--active' : 'vault-profile-tabs__tab'} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</nav>
        {notice && <p className="vault-profile-notice" role="status">{notice}</p>}
        <div ref={panelRef} className="vault-profile-panel">
          {activeTab === 'identity' && <div className="vault-profile-grid" data-profile-reveal>
            <Field label="Foto de perfil"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImage(file, (avatarUrl) => { setProfile((current) => ({ ...current, theme: { ...current.theme, avatarUrl } })); void requestAssetPersistence('avatar', file); }); }} /></Field>
            <Field label="Banner"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImage(file, (bannerUrl) => { setProfile((current) => ({ ...current, theme: { ...current.theme, bannerUrl } })); void requestAssetPersistence('banner', file); }); }} /></Field>
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
            <article className="vault-pro-card vault-profile-section--wide"><div><span className="vault-page__eyebrow">Vertyx Vault Pro · {pro.status}</span><h3>USD $2.00 <small>/ mes</small></h3><p>{pro.message ?? 'Insignia animada, marcos, banners, colores premium, acceso anticipado, sin anuncios y sincronización futura con Discord.'}</p><div className="vault-profile-badges">{pro.benefits.slice(0, 4).map((benefit) => <span key={benefit.id} className={benefit.enabled ? 'vault-badge vault-badge--gold' : 'vault-badge vault-badge--graphite'}>{benefit.label}</span>)}</div></div><div className="vault-pro-card__actions"><button type="button" disabled={busy} onClick={pro.status === 'active' ? requestProPortal : requestProCheckout}><StarSmallIcon className="h-4 w-4" />{pro.status === 'active' ? 'Gestionar' : 'Activar Pro'}</button><button type="button" disabled={busy || pro.discordSync === 'unavailable'} onClick={requestDiscordProSync}>Discord</button></div></article>
          </div>}

          {activeTab === 'security' && <div className="vault-profile-grid" data-profile-reveal>
            <Field label="Correo electrónico"><input type="email" value={profile.security.email} onChange={(event) => setProfile((current) => ({ ...current, security: { ...current.security, email: event.target.value } }))} /></Field>
            <button type="button" className="vault-profile-command" onClick={requestPasswordChange}><BoltIcon className="h-5 w-5" />Cambiar contraseña</button>
            <button type="button" className="vault-profile-command" onClick={requestEmailChange}><BellIcon className="h-5 w-5" />Cambiar correo</button>
            <Toggle label="Google vinculado" checked={profile.security.providers.google} onChange={(value) => { setProfile((current) => ({ ...current, security: { ...current.security, providers: { ...current.security.providers, google: value } } })); requestOAuth('google'); }} />
            <Toggle label="Discord vinculado" checked={profile.security.providers.discord} onChange={(value) => { setProfile((current) => ({ ...current, security: { ...current.security, providers: { ...current.security.providers, discord: value } } })); requestOAuth('discord'); }} />
            <Toggle label="Autenticación en dos pasos" checked={profile.security.twoFactorEnabled} onChange={requestTwoFactor} />
            <div className="vault-profile-section"><h3>Sesiones activas</h3>{profile.security.sessions.map((item) => <p key={item.id}>{item.device} · {item.location} {item.current ? '· actual' : ''}</p>)}<button type="button" onClick={requestCloseOtherSessions}>Cerrar otros dispositivos</button></div>
            <div className="vault-profile-section"><h3>Historial de accesos</h3>{profile.security.loginHistory.map((item) => <p key={item.id}>{item.provider} · {item.device} · {new Date(item.at).toLocaleString('es')}</p>)}{security.message && <p>{security.message}</p>}</div>
            <button type="button" className="vault-profile-danger" onClick={requestDeleteAccount}>Eliminar cuenta</button>
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

          {activeTab === 'stats' && <div className="vault-profile-section vault-profile-section--wide" data-profile-reveal><div className="vault-profile-stats">{Object.entries({ 'Películas vistas': stats.moviesWatched, 'Series vistas': stats.seriesWatched, 'Horas reproducidas': stats.hoursPlayed, Favoritos: stats.favorites, Guardados: stats.saved, Enviados: stats.submitted, Aprobados: stats.approved, 'Días en Vertyx': stats.memberDays, Racha: stats.streakDays }).map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div></div>}
        </div>
      </section>
    </div>
  </div>;
}
