import { searchCatalog } from '@/server/catalog';
import type { CatalogTitle } from '@/types/catalog';

export interface CatalogFacets {
  genres: string[];
  years: string[];
  kinds: Array<'movie' | 'series'>;
}

export async function getCatalogFacets(items?: CatalogTitle[]): Promise<CatalogFacets> {
  const catalogItems = items ?? await searchCatalog({ kind: 'all' });
  return {
    genres: Array.from(new Set(catalogItems.flatMap((item) => item.genres ?? []))).sort((a, b) => a.localeCompare(b, 'es')),
    years: Array.from(new Set(catalogItems.map((item) => item.year).filter((value): value is string => Boolean(value)))).sort((a, b) => b.localeCompare(a)),
    kinds: Array.from(new Set(catalogItems.map((item) => item.kind))).sort(),
  };
}
