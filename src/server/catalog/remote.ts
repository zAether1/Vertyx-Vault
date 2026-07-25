import type { CatalogProvider, CatalogSearchFilters, CatalogTitle, PlaybackRequest } from '@/types/catalog';
import type { MediaSource } from '@/types/media';

const baseUrl = process.env.VERTYX_CATALOG_API_URL?.replace(/\/$/, '');
const apiKey = process.env.VERTYX_CATALOG_API_KEY;

async function request<T>(path: string, params?: Record<string, string | undefined>): Promise<T | undefined> {
  if (!baseUrl) return undefined;
  const url = new URL(`${baseUrl}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    next: { revalidate: 300 },
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Catalog provider responded with ${response.status}`);
  return response.json() as Promise<T>;
}

export const remoteCatalogProvider: CatalogProvider = {
  async search(filters: CatalogSearchFilters) {
    const payload = await request<{ items: CatalogTitle[] }>('/catalog/search', {
      q: filters.query,
      kind: filters.kind,
      genre: filters.genre,
      year: filters.year,
    });
    return payload?.items ?? [];
  },
  async findById(id: string) {
    return request<CatalogTitle>(`/catalog/titles/${encodeURIComponent(id)}`);
  },
  async recommendations(id: string) {
    const payload = await request<{ items: CatalogTitle[] }>(`/catalog/titles/${encodeURIComponent(id)}/recommendations`);
    return payload?.items ?? [];
  },
  async playbackSource(requestData: PlaybackRequest) {
    return request<MediaSource>(`/catalog/titles/${encodeURIComponent(requestData.titleId)}/source`, {
      episodeId: requestData.episodeId,
    });
  },
};

export function hasRemoteCatalogProvider() {
  return Boolean(baseUrl);
}
