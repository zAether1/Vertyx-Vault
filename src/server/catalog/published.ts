import { listPublishedSubmissions } from '@/server/database/repositories';
import { findContent } from '@/lib/catalog';
import type { CatalogSearchFilters, CatalogTitle, PlaybackRequest } from '@/types/catalog';
import type { MediaSource } from '@/types/media';
import type { ContentSubmission } from '@/types/submission';

function toCatalogTitle(item: ContentSubmission): CatalogTitle {
  const catalogItem = findContent(item.id);
  return {
    id: item.id,
    title: item.title,
    kind: item.kind,
    poster: item.coverUrl || catalogItem?.poster || '/vertyx-vault-logo.png',
    backdrop: catalogItem?.backdrop,
    year: item.year,
    description: item.description,
    collection: item.category,
    genres: item.genres,
  };
}

function matches(item: CatalogTitle, filters: CatalogSearchFilters) {
  const query = filters.query?.trim().toLocaleLowerCase('es');
  const kind = filters.kind === 'tv' ? 'series' : filters.kind;
  return (!query || `${item.title} ${item.description ?? ''}`.toLocaleLowerCase('es').includes(query))
    && (!kind || kind === 'all' || item.kind === kind)
    && (!filters.genre || filters.genre === 'all' || item.genres?.some((genre) => genre.toLocaleLowerCase('es') === filters.genre?.toLocaleLowerCase('es')))
    && (!filters.year || filters.year === 'all' || item.year === filters.year);
}

async function loadPublishedSubmissions() {
  try {
    return await listPublishedSubmissions();
  } catch (error) {
    console.error('[published-submissions]', error);
    return [];
  }
}

export async function searchPublishedSubmissions(filters: CatalogSearchFilters) {
  return (await loadPublishedSubmissions()).map(toCatalogTitle).filter((item) => matches(item, filters));
}

export async function findPublishedSubmission(id: string): Promise<CatalogTitle | undefined> {
  const item = (await loadPublishedSubmissions()).find((entry) => entry.id === id);
  return item ? toCatalogTitle(item) : undefined;
}

export async function getPublishedPlaybackSource(request: PlaybackRequest): Promise<MediaSource | undefined> {
  const item = (await loadPublishedSubmissions()).find((entry) => entry.id === request.titleId);
  if (!item) return undefined;
  return item.playbackKind === 'embed'
    ? { kind: 'embed', url: item.playbackUrl, title: item.title }
    : { kind: item.playbackKind, url: item.playbackUrl, poster: item.coverUrl };
}
