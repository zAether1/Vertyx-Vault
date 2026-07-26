import ProfileStudio from '@/components/profile/ProfileStudio';
import Reveal from '@/components/motion/Reveal';
import VaultShell from '@/components/VaultShell';

export default function ProfilePage() {
  return <VaultShell><main className="vault-route"><Reveal className="vault-route__content"><ProfileStudio /></Reveal></main></VaultShell>;
}
