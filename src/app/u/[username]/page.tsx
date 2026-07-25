import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Reveal from '@/components/motion/Reveal';
import PublicProfileView from '@/components/profile/PublicProfileView';
import VaultPageHero from '@/components/VaultPageHero';
import VaultShell from '@/components/VaultShell';
import { findPublicProfile, hasDatabase } from '@/server/database/repositories';

interface PublicUserPageProps { params: Promise<{ username: string }>; }

async function loadProfile(username: string) {
  if (!hasDatabase()) return undefined;
  return findPublicProfile(username);
}

export async function generateMetadata({ params }: PublicUserPageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).toLowerCase();
  const profile = await loadProfile(username);
  if (!profile) return { title: `@${username} — Vertyx Vault`, description: 'Perfil público de Vertyx Vault.' };
  return {
    title: `${profile.displayName} (@${profile.username}) — Vertyx Vault`,
    description: profile.bio || `Perfil público de ${profile.displayName} en Vertyx Vault.`,
  };
}

export default async function PublicUserPage({ params }: PublicUserPageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).toLowerCase();
  const profile = await loadProfile(username);
  if (hasDatabase() && !profile) notFound();
  return <VaultShell><main className="vault-route"><VaultPageHero eyebrow="Comunidad" title={`@${username}`} description="Perfil público con información visible según las preferencias de privacidad del usuario." badge="/U" /><Reveal className="vault-route__content"><PublicProfileView username={username} initialProfile={profile} /></Reveal></main></VaultShell>;
}
