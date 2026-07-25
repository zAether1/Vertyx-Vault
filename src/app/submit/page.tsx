import Reveal from '@/components/motion/Reveal';
import SubmissionForm from '@/components/submissions/SubmissionForm';
import VaultPageHero from '@/components/VaultPageHero';
import VaultShell from '@/components/VaultShell';

export default function SubmitPage() {
  return <VaultShell><main className="vault-route"><VaultPageHero eyebrow="Comunidad" title="Enviar contenido" description="Comparte una propuesta. La revisión editorial mantiene el catálogo cuidado y la experiencia intacta." badge="EN REVISIÓN" /><Reveal className="vault-route__content"><SubmissionForm /></Reveal></main></VaultShell>;
}
