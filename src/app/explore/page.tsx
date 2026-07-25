import ExploreCatalog from '@/components/explore/ExploreCatalog';
import { searchCatalog } from '@/server/catalog';
import type { CatalogKind } from '@/types/catalog';

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; genre?: string; year?: string }> }) {
  const { q, type, genre, year } = await searchParams;
  const initialKind: 'all' | CatalogKind = type === 'movie' || type === 'series' || type === 'tv' ? (type === 'tv' ? 'series' : type) : 'all';
  const items = await searchCatalog({ query: q, kind: initialKind, genre, year });
  return <main className="vault-page">
    <p className="vault-page__eyebrow">Explorar</p>
    <h1 className="mt-2 text-4xl md:text-6xl font-bold">{q ? `Resultados para “${q}”` : 'Encuentra tu próxima historia'}</h1>
    <ExploreCatalog items={items} initialKind={initialKind} initialGenre={genre ?? 'all'} initialYear={year ?? 'all'} />
  </main>;
}
