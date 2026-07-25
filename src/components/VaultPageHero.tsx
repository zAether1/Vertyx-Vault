import Link from 'next/link';
import { ChevronRightIcon } from '@/components/icons';

interface VaultPageHeroProps { eyebrow: string; title: string; description: string; badge?: string; }

export default function VaultPageHero({ eyebrow, title, description, badge }: VaultPageHeroProps) {
  return <section className="vault-page-hero"><div className="vault-page-hero__glow" /><div className="vault-page-hero__content"><Link href="/" className="vault-page-hero__back"><ChevronRightIcon className="h-4 w-4 rotate-180" />Inicio</Link><div className="mt-8 flex items-center gap-3"><span className="vault-page__eyebrow">{eyebrow}</span>{badge && <span className="vault-page-hero__badge">{badge}</span>}</div><h1>{title}</h1><p>{description}</p></div></section>;
}
