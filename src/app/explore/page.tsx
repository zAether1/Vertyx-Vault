import ExploreCatalog from '@/components/explore/ExploreCatalog';
import { filterCatalog, type ContentKind } from '@/lib/catalog';

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q, type } = await searchParams;
  const initialKind: 'all' | ContentKind = type === 'movie' || type === 'series' || type === 'tv' ? (type === 'tv' ? 'series' : type) : 'all';
  const items = filterCatalog(q);
  return <main className="vault-page">
    <p className="vault-page__eyebrow">Explorar</p>
    <h1 className="mt-2 text-4xl md:text-6xl font-bold">{q ? `Resultados para “${q}”` : 'Encuentra tu próxima historia'}</h1>
    <ExploreCatalog items={items} initialKind={initialKind} />
  </main>;
}
