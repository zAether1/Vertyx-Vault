'use client';

import { useEffect, useMemo, useState } from 'react';
import CatalogCard from '@/components/CatalogCard';
import Reveal from '@/components/motion/Reveal';
import { catalog } from '@/lib/catalog';
import { useLibraryStore } from '@/store/library';

export default function LibraryPage() {
  const favorites = useLibraryStore((state) => state.favorites);
  const history = useLibraryStore((state) => state.history);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const resolve = (entries: { id: string }[]) => entries.map((entry) => catalog.find((item) => item.id === entry.id)).filter((item): item is (typeof catalog)[number] => Boolean(item));
  const saved = useMemo(() => resolve(favorites), [favorites]);
  const recent = useMemo(() => resolve(history), [history]);
  return <main className="vault-page"><Reveal><p className="vault-page__eyebrow">Tu espacio</p><h1 className="mt-2 text-4xl md:text-6xl font-bold">Mi biblioteca</h1></Reveal>{!ready ? <p className="text-white/60 mt-12">Cargando tu biblioteca…</p> : <><section className="mt-12"><h2 className="text-2xl font-bold">Mi lista</h2>{saved.length ? <div className="vault-grid">{saved.map((item) => <CatalogCard key={item.id} item={item} />)}</div> : <p className="text-white/60 mt-4">Guarda títulos desde su página de detalle.</p>}</section><section className="mt-14"><h2 className="text-2xl font-bold">Visto recientemente</h2>{recent.length ? <div className="vault-grid">{recent.map((item) => <CatalogCard key={item.id} item={item} />)}</div> : <p className="text-white/60 mt-4">Tu historial aparecerá cuando abras un título.</p>}</section></>}</main>;
}
