import type { MediaSource } from '@/types/media';

export type CatalogKind = 'movie' | 'series';

export interface CatalogEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  overview?: string;
  durationMinutes?: number;
  poster?: string;
}

export interface CatalogSeason {
  id: string;
  title: string;
  seasonNumber: number;
  episodes: CatalogEpisode[];
}

export interface CatalogTitle {
  id: string;
  title: string;
  kind: CatalogKind;
  poster: string;
  backdrop?: string;
  year?: string;
  rating?: number;
  description?: string;
  collection?: string;
  genres?: string[];
  seasons?: CatalogSeason[];
}

export interface CatalogSearchFilters {
  query?: string;
  kind?: CatalogKind | 'all' | 'tv';
  genre?: string;
  year?: string;
}

export interface PlaybackRequest {
  titleId: string;
  episodeId?: string;
}

export interface CatalogProvider {
  search(filters: CatalogSearchFilters): Promise<CatalogTitle[]>;
  findById(id: string): Promise<CatalogTitle | undefined>;
  recommendations(id: string): Promise<CatalogTitle[]>;
  playbackSource(request: PlaybackRequest): Promise<MediaSource | undefined>;
}
