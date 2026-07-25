import heroData from '@/data/hero.json';
import topData from '@/data/top.json';
import { findCatalogTitle, searchCatalog } from '@/server/catalog';
import { contentIdFromLegacyHref } from '@/lib/routes';
import type { HeroSlide, TopItem } from '@/types/content';
import type { CatalogTitle } from '@/types/catalog';

const hero = heroData as HeroSlide[];
const top = topData as { topMovies: TopItem[]; topSeries: TopItem[] };

async function resolveIds(ids: string[]): Promise<CatalogTitle[]> {
  const items = await Promise.all(ids.map((id) => findCatalogTitle(id)));
  return items.filter((item): item is CatalogTitle => Boolean(item));
}

export async function getFeaturedTitles() {
  const ids = hero.map((item) => contentIdFromLegacyHref(item.watchHref, item.title));
  const items = await resolveIds(ids);
  return items.length ? items : (await searchCatalog({ kind: 'all' })).slice(0, 8);
}

export async function getTopTitles(kind?: 'movie' | 'series') {
  const source = kind === 'series' ? top.topSeries : kind === 'movie' ? top.topMovies : [...top.topMovies, ...top.topSeries];
  const ids = source.map((item) => contentIdFromLegacyHref(item.href, item.title));
  return resolveIds(ids);
}
