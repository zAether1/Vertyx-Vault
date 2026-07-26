'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StarLucideIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import type { ProActionResult, ProSubscriptionState } from '@/types/pro';

const benefits = ['Sin anuncios', 'Perfiles exclusivos', 'Acceso anticipado'];

function useProCheckout() {
  const { session, ready } = useSessionSnapshot();
  const [subscription, setSubscription] = useState<ProSubscriptionState>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!ready || !session.profile || session.profile.plan === 'pro') return;
    void fetch('/api/profile/pro/subscription')
      .then(async (response) => response.ok ? setSubscription(await response.json() as ProSubscriptionState) : undefined)
      .catch(() => undefined);
  }, [ready, session.profile]);

  const checkout = async () => {
    if (!session.profile) return;
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch('/api/profile/pro/checkout', { method: 'POST' });
      const result = await response.json() as ProActionResult;
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else setMessage(result.message);
    } catch {
      setMessage('No se pudo iniciar el checkout.');
    } finally {
      setBusy(false);
    }
  };

  return { ready, session, subscription, busy, message, checkout };
}

function ProCard({ compact = false }: { compact?: boolean }) {
  const { session, subscription, busy, message, checkout } = useProCheckout();
  const isPro = session.profile?.plan === 'pro' || subscription?.status === 'active';
  const action = isPro
    ? <span className="vertyx-pro-card__active">Plan activo</span>
    : session.profile
      ? <button type="button" onClick={checkout} disabled={busy}>{busy ? 'Abriendo checkout…' : 'Mejorar a Pro'}</button>
      : <Link href="/profile">Iniciar sesión</Link>;

  return <section className={`vertyx-pro-card ${compact ? 'vertyx-pro-card--compact' : ''}`}>
    <div className="vertyx-pro-card__art" aria-hidden="true"><i /><i /><i /></div>
    <div className="vertyx-pro-card__content">
      <span className="vertyx-pro-card__eyebrow"><StarLucideIcon className="h-4 w-4" /> Vertyx Pro</span>
      <h2 id={compact ? 'pro-offer-title' : undefined}>{isPro ? 'Tu experiencia Pro está lista.' : 'Haz que Vertyx se sienta más tuyo.'}</h2>
      <p>{isPro ? 'Tu perfil, ventajas y acceso prioritario ya están activos.' : 'Menos interrupciones. Más personalidad. Una mejor forma de disfrutar tu biblioteca.'}</p>
      <ul aria-label="Beneficios de Vertyx Pro">{benefits.map((benefit) => <li key={benefit}><span>✓</span>{benefit}</li>)}</ul>
    </div>
    <div className="vertyx-pro-card__purchase">
      <span className="vertyx-pro-card__label">Todo Pro</span>
      <div><strong>US$2</strong><span>/ mes</span></div>
      {action}
      {message && <small role="status">{message}</small>}
    </div>
  </section>;
}

export function ProProfileSection() { return <ProCard />; }

export default function ProWelcomeOffer() {
  const { ready, session } = useProCheckout();
  const [open, setOpen] = useState(true);
  if (!ready || !open || session.profile?.plan === 'pro') return null;

  return <div className="vertyx-pro-offer" role="dialog" aria-modal="true" aria-labelledby="pro-offer-title">
    <button type="button" className="vertyx-pro-offer__backdrop" onClick={() => setOpen(false)} aria-label="Cerrar oferta" />
    <div className="vertyx-pro-offer__dialog">
      <button type="button" className="vertyx-pro-offer__close" onClick={() => setOpen(false)} aria-label="Cerrar oferta">×</button>
      <ProCard compact />
      <button type="button" className="vertyx-pro-offer__dismiss" onClick={() => setOpen(false)}>Ahora no</button>
    </div>
  </div>;
}
