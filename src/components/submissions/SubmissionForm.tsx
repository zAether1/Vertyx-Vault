'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { CirclePlayIcon, StarSmallIcon } from '@/components/icons';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import type { PlaybackKind, SubmissionKind } from '@/types/submission';
import { hasPermission } from '@/types/access';

const initial = { title: '', description: '', category: '', kind: 'movie' as SubmissionKind, genres: '', year: '', language: '', quality: '', provider: '', playbackKind: 'embed' as PlaybackKind, playbackUrl: '', coverUrl: '', notes: '' };
const fields = [['title', 'Título', 'text'], ['category', 'Categoría', 'text'], ['year', 'Año', 'text'], ['language', 'Idioma', 'text'], ['quality', 'Calidad', 'text'], ['provider', 'Proveedor', 'text'], ['coverUrl', 'Portada URL', 'url'], ['playbackUrl', 'URL del reproductor', 'url']] as const;

export default function SubmissionForm() {
  const { session, ready } = useSessionSnapshot();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<string>();
  const [busy, setBusy] = useState(false);
  const signedIn = session.state === 'authenticated';
  const canSubmit = Boolean(session.profile && hasPermission(session.profile.role, 'submission:create'));
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setStatus(undefined); const response = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, genres: form.genres.split(',').map((value) => value.trim()).filter(Boolean) }) }); const payload = await response.json() as { error?: string }; setBusy(false); if (!response.ok) { setStatus(payload.error ?? 'No se pudo enviar la solicitud.'); return; } setForm(initial); setStatus('Solicitud enviada. El contenido queda pendiente de revisión.'); };
  if (!ready) return null;
  if (!signedIn || !canSubmit) return <section className="vault-submission-lock"><div className="vault-submission-lock__icon"><CirclePlayIcon className="h-6 w-6" /></div><div><span className="vault-page__eyebrow">Acceso editorial</span><h2>Tu rol de Discord habilita las propuestas</h2><p>Vincula Discord y asegúrate de tener el rol de colaborador del servidor para proponer películas o series al equipo editorial.</p><Link href="/profile" className="vault-action">Ir a mi perfil</Link></div></section>;
  return <form onSubmit={submit} className="vault-submission"><header><div><span className="vault-page__eyebrow">Propuesta editorial</span><h2>Ficha de contenido</h2></div><span className="vault-submission__status"><StarSmallIcon className="h-3 w-3" />PENDIENTE</span></header><p className="vault-submission__intro">La propuesta no publica contenido. Una persona autorizada revisará la fuente, los metadatos y su disponibilidad antes de aprobarla.</p><div className="vault-submission__fields">{fields.map(([key, label, type]) => <label key={key}><span>{label}</span><input required={['title', 'category', 'provider', 'playbackUrl'].includes(key)} type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<label><span>Formato</span><select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as SubmissionKind })}><option value="movie">Película</option><option value="series">Serie</option></select></label><label><span>Tipo de reproductor</span><select value={form.playbackKind} onChange={(event) => setForm({ ...form, playbackKind: event.target.value as PlaybackKind })}><option value="embed">Embebido</option><option value="hls">HLS</option><option value="mp4">MP4</option><option value="dash">DASH</option></select></label><label className="vault-submission__wide"><span>Géneros</span><input value={form.genres} onChange={(event) => setForm({ ...form, genres: event.target.value })} placeholder="Acción, ciencia ficción" /></label><label className="vault-submission__wide"><span>Descripción</span><textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} /></label><label className="vault-submission__wide"><span>Observaciones</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} /></label></div><footer>{status && <p role="status">{status}</p>}<button className="vault-action" disabled={busy}><CirclePlayIcon className="h-4 w-4" />{busy ? 'Enviando…' : 'Enviar a revisión'}</button></footer></form>;
}
