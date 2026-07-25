import Link from 'next/link';
import ProfileSummary from '@/components/profile/ProfileSummary';
import Reveal from '@/components/motion/Reveal';

export default function ProfilePage() {
  return <main className="vault-page">
    <Reveal>
      <p className="vault-page__eyebrow">Cuenta</p>
      <h1 className="mt-2 text-4xl md:text-6xl font-bold">Perfil y sincronización</h1>
      <p className="mt-4 max-w-2xl text-[#eee9f4]/68">Vertyx Vault ya está preparado para autenticación y biblioteca entre dispositivos mediante un backend autorizado.</p>
    </Reveal>
    <ProfileSummary />
    <section className="mt-10 vault-glass rounded-3xl p-6 md:p-8">
      <h2 className="text-2xl font-bold">Siguiente conexión requerida</h2>
      <p className="mt-3 text-[#eee9f4]/65">La sesión local y la biblioteca ya funcionan con APIs internas. Configura `VERTYX_AUTH_API_URL` o `VERTYX_LIBRARY_API_URL` solo si quieres sustituirlas por servicios remotos persistentes.</p>
      <Link href="/library" className="vault-action mt-6 inline-block">Ver mi biblioteca</Link>
    </section>
  </main>;
}
