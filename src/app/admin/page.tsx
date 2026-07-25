import AdminPanel from '@/components/admin/AdminPanel';
import Reveal from '@/components/motion/Reveal';
import VaultPageHero from '@/components/VaultPageHero';
import VaultShell from '@/components/VaultShell';

export default function AdminPage() {
  return <VaultShell><main className="vault-route"><VaultPageHero eyebrow="Operaciones" title="Sala de control" description="Moderación editorial, comunidad y actividad de Vertyx Vault en un solo lugar." badge="INTERNO" /><Reveal className="vault-route__content"><AdminPanel /></Reveal></main></VaultShell>;
}
