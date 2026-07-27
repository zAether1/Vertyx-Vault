import { listPublishedSubmissions } from '@/server/database/repositories';
import { findContent } from '@/lib/catalog';
import type { CatalogSearchFilters, CatalogSeason, CatalogTitle, PlaybackRequest } from '@/types/catalog';
import type { MediaSource } from '@/types/media';
import type { ContentSubmission } from '@/types/submission';

function buildSeasons(item: ContentSubmission): CatalogSeason[] | undefined {
  if (item.kind !== 'series') return undefined;
  const eps = item.episodes ?? [];
  if (!eps.length) {
    return [{ id: `${item.id}-s1`, title: 'Temporada 1', seasonNumber: 1, episodes: [{ id: `${item.id}-s1e1`, title: 'Episodio 1', seasonNumber: 1, episodeNumber: 1, overview: 'Episodio disponible.' }] }];
  }
  const seasonMap = new Map<number, typeof eps>();
  for (const ep of eps) {
    const list = seasonMap.get(ep.season) ?? [];
    list.push(ep);
    seasonMap.set(ep.season, list);
  }
  const seasons: CatalogSeason[] = [];
  for (const [num, epList] of Array.from(seasonMap.entries()).sort((a, b) => a[0] - b[0])) {
    seasons.push({
      id: `${item.id}-s${num}`,
      title: `Temporada ${num}`,
      seasonNumber: num,
      episodes: epList.sort((a, b) => a.episode - b.episode).map(ep => ({
        id: ep.id,
        title: ep.title,
        seasonNumber: ep.season,
        episodeNumber: ep.episode,
      })),
    });
  }
  return seasons;
}

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
    seasons: buildSeasons(item),
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

  // If requesting a specific episode, find it
  if (request.episodeId && item.episodes?.length) {
    const tmdbMatch = request.episodeId.match(/-s(\d+)e(\d+)$/);
    let ep = item.episodes.find(e => e.id === request.episodeId);
    
    if (!ep && tmdbMatch) {
      const s = parseInt(tmdbMatch[1], 10);
      const e = parseInt(tmdbMatch[2], 10);
      ep = item.episodes.find(e => e.season === s && e.episode === e);
    }

    if (ep) {
      return ep.playbackKind === 'embed'
        ? { kind: 'embed', url: ep.playbackUrl, title: `${item.title} - T${ep.season} E${ep.episode}` }
        : { kind: ep.playbackKind, url: ep.playbackUrl, poster: item.coverUrl };
    }
  }

  // Fallback to main playback URL (or first episode for series)
  if (item.kind === 'series' && item.episodes?.length) {
    const first = item.episodes[0];
    return first.playbackKind === 'embed'
      ? { kind: 'embed', url: first.playbackUrl, title: `${item.title} - ${first.title}` }
      : { kind: first.playbackKind, url: first.playbackUrl, poster: item.coverUrl };
  }

  return item.playbackKind === 'embed'
    ? { kind: 'embed', url: item.playbackUrl, title: item.title }
    : { kind: item.playbackKind, url: item.playbackUrl, poster: item.coverUrl };
}

