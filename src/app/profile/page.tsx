import Link from 'next/link';
import ProfileSummary from '@/components/profile/ProfileSummary';
import Reveal from '@/components/motion/Reveal';

export default function ProfilePage() {
  return <main className="vault-page"><Reveal><Link href="/" className="vault-action vault-back-link inline-block">← Volver al inicio</Link><p className="vault-page__eyebrow mt-10">Cuenta</p><h1 className="mt-2 text-4xl font-bold md:text-6xl">Tu espacio Vertyx</h1><p className="mt-4 max-w-2xl text-[#eee9f4]/68">Tu perfil, biblioteca y permisos se mantienen preparados para una futura sincronización segura entre dispositivos.</p></Reveal><ProfileSummary /></main>;
}
