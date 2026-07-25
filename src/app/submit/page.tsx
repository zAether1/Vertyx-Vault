import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import SubmissionForm from '@/components/submissions/SubmissionForm';

export default function SubmitPage() {
  return <main className="vault-page"><Reveal><Link href="/" className="vault-filter inline-block">← Volver al inicio</Link><p className="vault-page__eyebrow mt-10">Comunidad</p><h1 className="mt-2 text-4xl font-bold md:text-6xl">Enviar contenido</h1><p className="mt-4 max-w-2xl text-[#eee9f4]/68">Propón una fuente autorizada para revisión editorial. Vertyx Vault no aloja archivos ni publica automáticamente las solicitudes.</p></Reveal><SubmissionForm /></main>;
}
