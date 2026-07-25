'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSessionSnapshot } from '@/hooks/useSessionSnapshot';
import type { PlaybackKind, SubmissionKind } from '@/types/submission';

const initial = { title: '', description: '', category: '', kind: 'movie' as SubmissionKind, genres: '', year: '', language: '', quality: '', provider: '', playbackKind: 'embed' as PlaybackKind, playbackUrl: '', coverUrl: '', notes: '' };

export default function SubmissionForm() {
  const { session, ready } = useSessionSnapshot();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<string>();
  const [busy, setBusy] = useState(false);
  const signedIn = session.state === 'authenticated';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setStatus(undefined);
    const response = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, genres: form.genres.split(',').map((value) => value.trim()).filter(Boolean) }) });
    const payload = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) { setStatus(payload.error ?? 'No se pudo enviar la solicitud.'); return; }
    setForm(initial); setStatus('Solicitud enviada. El contenido queda pendiente de revisión.');
  };

  if (!ready) return null;
  if (!signedIn) return <section className="mt-10 vault-glass rounded-3xl p-6 md:p-8"><p className="vault-page__eyebrow">Enviar contenido</p><h2 className="mt-2 text-2xl font-bold">Tu cuenta habilita las solicitudes</h2><p className="mt-3 max-w-xl text-[#eee9f4]/65">Los invitados pueden explorar y organizar su biblioteca. Crea una cuenta local para enviar títulos a revisión.</p><Link href="/profile" className="vault-action mt-6 inline-block">Ir a mi perfil</Link></section>;

  return <form onSubmit={submit} className="mt-10 vault-glass rounded-3xl p-6 md:p-8"><p className="vault-page__eyebrow">Solicitud editorial</p><h2 className="mt-2 text-2xl font-bold">Enviar contenido</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#eee9f4]/62">El envío no publica contenido. Todo queda en estado pendiente hasta la revisión de un equipo autorizado.</p><div className="mt-7 grid gap-4 md:grid-cols-2">{([
    ['title', 'Título', 'text'], ['category', 'Categoría', 'text'], ['year', 'Año', 'text'], ['language', 'Idioma', 'text'], ['quality', 'Calidad', 'text'], ['provider', 'Proveedor', 'text'], ['coverUrl', 'Portada (URL opcional)', 'url'], ['playbackUrl', 'URL del reproductor', 'url'],
  ] as const).map(([key, label, type]) => <label key={key} className="grid gap-2 text-sm text-[#eee9f4]/78"><span>{label}</span><input required={['title', 'category', 'provider', 'playbackUrl'].includes(key)} type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="vault-glass rounded-xl px-4 py-3 outline-none focus:border-[#c9a8f0]/60" /></label>)}<label className="grid gap-2 text-sm text-[#eee9f4]/78"><span>Formato</span><select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as SubmissionKind })} className="vault-glass rounded-xl px-4 py-3 outline-none"><option value="movie">Película</option><option value="series">Serie</option></select></label><label className="grid gap-2 text-sm text-[#eee9f4]/78"><span>Tipo de reproductor</span><select value={form.playbackKind} onChange={(event) => setForm({ ...form, playbackKind: event.target.value as PlaybackKind })} className="vault-glass rounded-xl px-4 py-3 outline-none"><option value="embed">Embebido</option><option value="hls">HLS</option><option value="mp4">MP4</option><option value="dash">DASH</option></select></label><label className="grid gap-2 text-sm text-[#eee9f4]/78 md:col-span-2"><span>Géneros, separados por coma</span><input value={form.genres} onChange={(event) => setForm({ ...form, genres: event.target.value })} className="vault-glass rounded-xl px-4 py-3 outline-none" /></label><label className="grid gap-2 text-sm text-[#eee9f4]/78 md:col-span-2"><span>Descripción</span><textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className="vault-glass rounded-xl px-4 py-3 outline-none" /></label><label className="grid gap-2 text-sm text-[#eee9f4]/78 md:col-span-2"><span>Observaciones</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="vault-glass rounded-xl px-4 py-3 outline-none" /></label></div>{status && <p className="mt-5 text-sm text-[#c9a8f0]" role="status">{status}</p>}<button className="vault-action mt-6" disabled={busy}>{busy ? 'Enviando…' : 'Enviar a revisión'}</button></form>;
}
