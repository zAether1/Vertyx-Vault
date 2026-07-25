import Reveal from '@/components/motion/Reveal';
import PublicProfileView from '@/components/profile/PublicProfileView';
import VaultPageHero from '@/components/VaultPageHero';
import VaultShell from '@/components/VaultShell';

export default async function PublicUserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <VaultShell><main className="vault-route"><VaultPageHero eyebrow="Comunidad" title={`@${decodeURIComponent(username)}`} description="Perfil público con información visible según las preferencias de privacidad del usuario." badge="/U" /><Reveal className="vault-route__content"><PublicProfileView username={decodeURIComponent(username)} /></Reveal></main></VaultShell>;
}
