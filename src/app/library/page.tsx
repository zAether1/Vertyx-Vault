'use client';

import { useEffect, useMemo, useState } from 'react';
import CatalogCard from '@/components/CatalogCard';
import Reveal from '@/components/motion/Reveal';
import { catalog } from '@/lib/catalog';
import { useLibraryStore } from '@/store/library';

export default function LibraryPage() {
  const favorites = useLibraryStore((state) => state.favorites);
  const history = useLibraryStore((state) => state.history);
  const progress = useLibraryStore((state) => state.progress);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const resolve = (entries: { id: string }[]) => entries.map((entry) => catalog.find((item) => item.id === entry.id)).filter((item): item is (typeof catalog)[number] => Boolean(item));
  const saved = useMemo(() => resolve(favorites), [favorites]);
  const recent = useMemo(() => resolve(history), [history]);
  const inProgress = useMemo(() => progress.map((entry) => ({ entry, item: catalog.find((item) => item.id === entry.id) })).filter((value): value is { entry: (typeof progress)[number]; item: (typeof catalog)[number] } => Boolean(value.item)), [progress]);
  return <main className="vault-page"><Reveal><p className="vault-page__eyebrow">Tu espacio</p><h1 className="mt-2 text-4xl md:text-6xl font-bold">Mi biblioteca</h1></Reveal>{!ready ? <p className="text-[#eee9f4]/60 mt-12">Cargando tu biblioteca…</p> : <><section className="mt-12"><h2 className="text-2xl font-bold">Continuar viendo</h2>{inProgress.length ? <div className="vault-grid">{inProgress.map(({ item, entry }) => <div key={item.id} className="vault-progress-card"><CatalogCard item={item} /><div className="vault-progress-card__track" aria-label={`${Math.round((entry.currentTime / entry.duration) * 100)}% reproducido`}><div className="vault-progress-card__value" style={{ width: `${Math.min(100, (entry.currentTime / entry.duration) * 100)}%` }} /></div></div>)}</div> : <p className="text-[#eee9f4]/60 mt-4">El progreso aparecerá cuando una fuente autorizada esté disponible.</p>}</section><section className="mt-14"><h2 className="text-2xl font-bold">Mi Lista</h2>{saved.length ? <div className="vault-grid">{saved.map((item) => <CatalogCard key={item.id} item={item} />)}</div> : <p className="text-[#eee9f4]/60 mt-4">Guarda títulos desde su página de detalle.</p>}</section><section className="mt-14"><h2 className="text-2xl font-bold">Visto recientemente</h2>{recent.length ? <div className="vault-grid">{recent.map((item) => <CatalogCard key={item.id} item={item} />)}</div> : <p className="text-[#eee9f4]/60 mt-4">Tu historial aparecerá cuando abras un título.</p>}</section></>}</main>;
}
