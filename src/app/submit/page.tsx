import SubmissionForm from '@/components/submissions/SubmissionForm';
import Reveal from '@/components/motion/Reveal';
import VaultShell from '@/components/VaultShell';

export default function SubmitPage() {
  return <VaultShell><main className="vault-route vault-editorial-route"><Reveal className="vault-route__content"><SubmissionForm /></Reveal></main></VaultShell>;
}
