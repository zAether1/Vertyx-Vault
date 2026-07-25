import { getLocalMediaSource } from '@/data/media-sources';
import { catalog, findContent, filterCatalog } from '@/lib/catalog';
import type { CatalogProvider, CatalogSearchFilters, CatalogTitle, PlaybackRequest } from '@/types/catalog';
import type { MediaSource } from '@/types/media';

const inferGenres = (collection?: string): string[] => {
  const value = collection?.toLocaleLowerCase('es') ?? '';
  if (value.includes('acción')) return ['Acción'];
  if (value.includes('comedia')) return ['Comedia'];
  if (value.includes('terror')) return ['Terror'];
  if (value.includes('románt')) return ['Romance'];
  if (value.includes('fantasía')) return ['Fantasía'];
  if (value.includes('misterio')) return ['Misterio'];
  if (value.includes('aventura')) return ['Aventura'];
  if (value.includes('guerra')) return ['Guerra'];
  if (value.includes('historia')) return ['Historia'];
  return [];
};

const withMetadata = (item: CatalogTitle): CatalogTitle => ({
  ...item,
  genres: item.genres ?? inferGenres(item.collection),
  seasons: item.kind === 'series' ? item.seasons ?? [{
    id: `${item.id}-s1`,
    title: 'Temporada 1',
    seasonNumber: 1,
    episodes: [{
      id: `${item.id}-s1e1`,
      title: 'Episodio 1',
      seasonNumber: 1,
      episodeNumber: 1,
      overview: 'Episodio preparado para conectarse a una fuente autorizada.',
      poster: item.backdrop ?? item.poster,
    }],
  }] : undefined,
});

const matchesExtraFilters = (item: CatalogTitle, filters: CatalogSearchFilters) => {
  const genreMatches = !filters.genre || filters.genre === 'all' || item.genres?.some((genre) => genre.toLocaleLowerCase('es') === filters.genre?.toLocaleLowerCase('es'));
  const yearMatches = !filters.year || filters.year === 'all' || item.year === filters.year;
  return genreMatches && yearMatches;
};

export const localCatalogProvider: CatalogProvider = {
  async search(filters) {
    return filterCatalog(filters.query, filters.kind).map(withMetadata).filter((item) => matchesExtraFilters(item, filters));
  },
  async findById(id) {
    const item = findContent(id);
    return item ? withMetadata(item) : undefined;
  },
  async recommendations(id) {
    const current = findContent(id);
    const sameCollection = catalog.filter((item) => item.id !== id && item.collection === current?.collection).slice(0, 8);
    const fallback = catalog.filter((item) => item.id !== id).slice(0, 8);
    return (sameCollection.length ? sameCollection : fallback).map(withMetadata);
  },
  async playbackSource(request: PlaybackRequest): Promise<MediaSource | undefined> {
    return getLocalMediaSource(request.titleId, request.episodeId);
  },
};
