import AdminPanel from '@/components/admin/AdminPanel';
import Reveal from '@/components/motion/Reveal';
import VaultShell from '@/components/VaultShell';

export default function AdminPage() {
  return <VaultShell><main className="vault-route vault-editorial-route"><Reveal className="vault-route__content"><AdminPanel /></Reveal></main></VaultShell>;
}
