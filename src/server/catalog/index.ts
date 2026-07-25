import { localCatalogProvider } from '@/server/catalog/local';
import { hasRemoteCatalogProvider, remoteCatalogProvider } from '@/server/catalog/remote';
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

export function searchCatalog(filters: CatalogSearchFilters) {
  return withFallback(() => provider.search(filters), () => localCatalogProvider.search(filters));
}

export function findCatalogTitle(id: string) {
  return withFallback(() => provider.findById(id), () => localCatalogProvider.findById(id));
}

export function getRecommendations(id: string) {
  return withFallback(() => provider.recommendations(id), () => localCatalogProvider.recommendations(id));
}

export async function getPlaybackSource(request: PlaybackRequest) {
  const localSource = await localCatalogProvider.playbackSource(request);
  if (localSource) return localSource;
  return withFallback(() => provider.playbackSource(request), () => localCatalogProvider.playbackSource(request));
}
