import ProfileStudio from '@/components/profile/ProfileStudio';
import Reveal from '@/components/motion/Reveal';
import VaultPageHero from '@/components/VaultPageHero';
import VaultShell from '@/components/VaultShell';

export default function ProfilePage() {
  return <VaultShell><main className="vault-route"><VaultPageHero eyebrow="Cuenta" title="Tu espacio Vertyx" description="Identidad, seguridad, preferencias y beneficios Pro en una experiencia premium." badge="MI PERFIL" /><Reveal className="vault-route__content"><ProfileStudio /></Reveal></main></VaultShell>;
}
