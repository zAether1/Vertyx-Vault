import { localCatalogProvider } from '@/server/catalog/local';
import { hasRemoteCatalogProvider, remoteCatalogProvider } from '@/server/catalog/remote';
import { findPublishedSubmission, getPublishedPlaybackSource, searchPublishedSubmissions } from '@/server/catalog/published';
import type { CatalogProvider, CatalogSearchFilters, PlaybackRequest } from '@/types/catalog';

const provider: CatalogProvider = hasRemoteCatalogProvider() ? remoteCatalogProvider : localCatalogProvider;

async function withFallback<T>(remoteCall: () => Promise<T>, localCall: () => Promise<T>) {
  if (!hasRemoteCatalogProvider()) return localCall();
  try {
    return await remoteCall();
  } catch (error) {
    console.error('[catalog-provider]', error);
    return localCall();
  }
}

export async function searchCatalog(filters: CatalogSearchFilters) {
  const [catalogItems, publishedItems] = await Promise.all([
    withFallback(() => provider.search(filters), () => localCatalogProvider.search(filters)),
    searchPublishedSubmissions(filters),
  ]);
  return [...publishedItems, ...catalogItems.filter((item) => !publishedItems.some((published) => published.id === item.id))];
}

export async function findCatalogTitle(id: string) {
  const published = await findPublishedSubmission(id);
  return published ?? withFallback(() => provider.findById(id), () => localCatalogProvider.findById(id));
}

export function getRecommendations(id: string) {
  return withFallback(() => provider.recommendations(id), () => localCatalogProvider.recommendations(id));
}

export async function getPlaybackSource(request: PlaybackRequest) {
  const published = await getPublishedPlaybackSource(request);
  return published ?? withFallback(() => provider.playbackSource(request), () => localCatalogProvider.playbackSource(request));
}
