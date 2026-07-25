import Link from 'next/link';
import AdminPanel from '@/components/admin/AdminPanel';
import Reveal from '@/components/motion/Reveal';

export default function AdminPage() {
  return <main className="vault-page"><Reveal><Link href="/" className="vault-filter inline-block">← Volver al inicio</Link><p className="vault-page__eyebrow mt-10">Operaciones</p><h1 className="mt-2 text-4xl font-bold md:text-6xl">Administración</h1><p className="mt-4 max-w-2xl text-[#eee9f4]/68">Gestión de comunidad, revisión editorial y actividad operativa de Vertyx Vault.</p></Reveal><AdminPanel /></main>;
}
