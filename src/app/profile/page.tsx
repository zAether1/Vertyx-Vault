import ProfileSummary from '@/components/profile/ProfileSummary';
import Reveal from '@/components/motion/Reveal';
import VaultPageHero from '@/components/VaultPageHero';
import VaultShell from '@/components/VaultShell';

export default function ProfilePage() {
  return <VaultShell><main className="vault-route"><VaultPageHero eyebrow="Cuenta" title="Tu espacio Vertyx" description="Tu identidad, tu biblioteca y la actividad que acompaña cada historia." badge="MI PERFIL" /><Reveal className="vault-route__content"><ProfileSummary /></Reveal></main></VaultShell>;
}
