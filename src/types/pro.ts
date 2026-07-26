export type ProStatus = 'inactive' | 'active' | 'past_due' | 'canceled';

export interface ProBenefit {
  id: string;
  label: string;
  enabled: boolean;
}

export interface ProSubscriptionState {
  ready: boolean;
  status: ProStatus;
  priceUsd: 5;
  interval: 'month';
  checkoutUrl?: string;
  portalUrl?: string;
  discordSync: 'connected' | 'pending' | 'unavailable';
  benefits: ProBenefit[];
  message?: string;
}

export interface ProActionResult {
  ok: boolean;
  ready: boolean;
  message: string;
  checkoutUrl?: string;
  portalUrl?: string;
  subscription?: ProSubscriptionState;
}

export const PRO_BENEFITS: ProBenefit[] = [
  { id: 'animated-badge', label: 'Insignia Pro animada', enabled: true },
  { id: 'exclusive-frames', label: 'Marcos exclusivos', enabled: true },
  { id: 'exclusive-banners', label: 'Banners exclusivos', enabled: true },
  { id: 'premium-colors', label: 'Colores premium', enabled: true },
  { id: 'early-access', label: 'Acceso anticipado', enabled: true },
  { id: 'no-ads', label: 'Sin anuncios', enabled: true },
  { id: 'discord-role', label: 'Rol Pro en Discord', enabled: false },
];
