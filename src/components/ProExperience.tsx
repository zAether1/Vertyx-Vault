'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StarLucideIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import type { ProActionResult, ProSubscriptionState } from '@/types/pro';

const benefits = ['Sin anuncios', 'Marcos y banners exclusivos', 'Acceso anticipado', 'Rol Pro en Discord'];

function useProCheckout() {
  const { session, ready } = useSessionSnapshot();
  const [subscription, setSubscription] = useState<ProSubscriptionState>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  useEffect(() => {
    if (!ready || !session.profile || session.profile.plan === 'pro') return;
    void fetch('/api/profile/pro/subscription').then(async (response) => response.ok ? setSubscription(await response.json() as ProSubscriptionState) : undefined).catch(() => undefined);
  }, [ready, session.profile]);
  const checkout = async () => {
    if (!session.profile) return;
    setBusy(true); setMessage(undefined);
    try {
      const response = await fetch('/api/profile/pro/checkout', { method: 'POST' });
      const result = await response.json() as ProActionResult;
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else setMessage(result.message);
    } catch { setMessage('No se pudo iniciar el checkout.'); }
    finally { setBusy(false); }
  };
  return { ready, session, subscription, busy, message, checkout };
}

function ProCard({ compact = false }: { compact?: boolean }) {
  const { session, subscription, busy, message, checkout } = useProCheckout();
  const isPro = session.profile?.plan === 'pro' || subscription?.status === 'active';
  return <section className={`vertyx-pro-card ${compact ? 'vertyx-pro-card--compact' : ''}`}>
    <div className="vertyx-pro-card__orb" aria-hidden="true" />
    <div className="vertyx-pro-card__content">
      <span className="vertyx-pro-card__eyebrow"><StarLucideIcon className="h-4 w-4" /> VERTYX PRO</span>
      <h2 id={compact ? 'pro-offer-title' : undefined}>{isPro ? 'Tu acceso premium está activo' : 'Tu vault, sin límites.'}</h2>
      <p>{isPro ? 'Disfruta tu experiencia Pro y sincroniza tu rol de Discord.' : 'Eleva tu perfil, elimina anuncios y entra primero a lo que viene.'}</p>
      {!compact && <ul>{benefits.map((benefit) => <li key={benefit}>✓ {benefit}</li>)}</ul>}
    </div>
    <div className="vertyx-pro-card__price"><strong>US$2</strong><span>/ mes</span>{isPro ? <b>ACTIVO</b> : session.profile ? <button type="button" onClick={checkout} disabled={busy}>{busy ? 'Abriendo…' : 'Hazte Pro'}</button> : <Link href="/profile">Inicia sesión</Link>}{message && <small>{message}</small>}</div>
  </section>;
}

export function ProProfileSection() { return <ProCard />; }

export default function ProWelcomeOffer() {
  const { ready, session } = useProCheckout();
  const [open, setOpen] = useState(true);
  if (!ready || !open || session.profile?.plan === 'pro') return null;
  return <div className="vertyx-pro-offer" role="dialog" aria-modal="true" aria-labelledby="pro-offer-title">
    <button type="button" className="vertyx-pro-offer__backdrop" onClick={() => setOpen(false)} aria-label="Cerrar oferta" />
    <div className="vertyx-pro-offer__dialog"><button type="button" className="vertyx-pro-offer__close" onClick={() => setOpen(false)} aria-label="Cerrar">×</button><ProCard compact /><p>Oferta de bienvenida. Puedes cerrarla y volver a verla al recargar.</p></div>
  </div>;
}
