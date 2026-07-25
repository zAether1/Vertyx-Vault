import Link from 'next/link';
import CatalogCard from '@/components/CatalogCard';
import { filterCatalog } from '@/lib/catalog';

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q, type } = await searchParams;
  const items = filterCatalog(q, type);
  return (
    <main className="vault-page">
      <p className="vault-page__eyebrow">Explorar</p>
      <h1 className="mt-2 text-4xl md:text-6xl font-bold">{q ? `Resultados para “${q}”` : 'Encuentra tu próxima historia'}</h1>
      <div className="flex gap-3 mt-7 text-sm">
        <Link href="/explore" className="vault-glass rounded-full px-4 py-2">Todo</Link>
        <Link href="/explore?type=movie" className="vault-glass rounded-full px-4 py-2">Películas</Link>
        <Link href="/explore?type=series" className="vault-glass rounded-full px-4 py-2">Series</Link>
      </div>
      {items.length ? <div className="vault-grid">{items.map((item) => <CatalogCard key={item.id} item={item} />)}</div> : <p className="text-white/60 mt-12">No encontramos títulos con esos criterios.</p>}
    </main>
  );
}
