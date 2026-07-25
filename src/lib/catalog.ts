import heroData from '@/data/hero.json';
import rowsData from '@/data/rows.json';
import topData from '@/data/top.json';
import type { ContentRowData, HeroSlide, RowCard, TopItem } from '@/types/content';
import { contentHref } from '@/lib/routes';

export type ContentKind = 'movie' | 'series';

export interface CatalogItem {
  id: string;
  title: string;
  kind: ContentKind;
  poster: string;
  backdrop?: string;
  year?: string;
  rating?: number;
  description?: string;
  collection?: string;
}

const hero = heroData as HeroSlide[];
const rows = rowsData as ContentRowData[];
const top = topData as { topMovies: TopItem[]; topSeries: TopItem[] };

function idFromHref(href: string): string | null {
  return new URLSearchParams(href.split('?')[1]).get('id');
}

function kindFromHref(href: string): ContentKind {
  return new URLSearchParams(href.split('?')[1]).get('type') === 'tv' ? 'series' : 'movie';
}

function itemFromCard(card: RowCard, collection: string): CatalogItem | null {
  const id = idFromHref(card.href);
  return id ? { id, title: card.title, kind: kindFromHref(card.href), poster: card.poster, rating: card.rating, collection } : null;
}

const index = new Map<string, CatalogItem>();
for (const slide of hero) {
  const id = idFromHref(slide.watchHref);
  if (id) index.set(id, {
    id,
    title: slide.title,
    kind: slide.type === 'SERIE' ? 'series' : 'movie',
    poster: slide.thumbnail,
    backdrop: slide.bg,
    year: slide.release,
    rating: slide.rating,
    description: slide.desc,
  });
}
for (const row of rows) {
  for (const card of row.cards) {
    const item = itemFromCard(card, row.title);
    if (!item) continue;
    index.set(item.id, { ...item, ...index.get(item.id), collection: index.get(item.id)?.collection ?? row.title });
  }
}
for (const item of [...top.topMovies, ...top.topSeries]) {
  const id = idFromHref(item.href);
  if (id && !index.has(id)) index.set(id, { id, title: item.title, kind: kindFromHref(item.href), poster: item.poster, rating: item.rank, collection: 'Top 10' });
}

export const catalog = [...index.values()];

export function findContent(id: string): CatalogItem | undefined {
  return index.get(id);
}

export function filterCatalog(query?: string, kind?: string): CatalogItem[] {
  const normalized = query?.trim().toLocaleLowerCase('es');
  return catalog.filter((item) => {
    const typeMatches = !kind || kind === 'all' || item.kind === kind || (kind === 'tv' && item.kind === 'series');
    return typeMatches && (!normalized || `${item.title} ${item.collection}`.toLocaleLowerCase('es').includes(normalized));
  });
}
