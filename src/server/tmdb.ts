import type { CatalogTitle } from '@/types/catalog';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/original';
const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';

async function fetchTmdb<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!TMDB_API_KEY) return null;
  
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'es-ES');
  
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch (error) {
    console.error(`[TMDB] Error fetching ${path}:`, error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTmdbData(data: any, originalTitle: CatalogTitle): CatalogTitle {
  // Find logo in Spanish, English, or fallback to first available
  const logos = data.images?.logos ?? [];
  const esLogo = logos.find((l: any) => l.iso_639_1 === 'es');
  const enLogo = logos.find((l: any) => l.iso_639_1 === 'en');
  const anyLogo = logos[0];
  const logoPath = esLogo?.file_path || enLogo?.file_path || anyLogo?.file_path;

  // Format cast (top 8)
  const cast = (data.credits?.cast ?? [])
    .slice(0, 8)
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profileUrl: c.profile_path ? `${TMDB_IMG_W500}${c.profile_path}` : undefined,
    }));

  // Format production companies
  const productionCompanies = (data.production_companies ?? [])
    .map((c: any) => ({
      name: c.name,
      logoUrl: c.logo_path ? `${TMDB_IMG_W500}${c.logo_path}` : undefined,
    }));

  // Translate statuses if possible
  const statusMap: Record<string, string> = {
    'Released': 'Estrenado',
    'Post Production': 'En Post-Producción',
    'In Production': 'En Producción',
    'Planned': 'Planificada',
    'Canceled': 'Cancelada',
    'Rumored': 'Rumoreada',
    'Returning Series': 'En Emisión',
    'Ended': 'Finalizada',
  };

  return {
    ...originalTitle,
    title: data.title || data.name || originalTitle.title,
    description: data.overview || originalTitle.description,
    backdrop: data.backdrop_path ? `${TMDB_IMG_BASE}${data.backdrop_path}` : originalTitle.backdrop,
    poster: data.poster_path ? `${TMDB_IMG_W500}${data.poster_path}` : originalTitle.poster,
    logo: logoPath ? `${TMDB_IMG_W500}${logoPath}` : originalTitle.logo,
    status: statusMap[data.status] || data.status,
    releaseDate: data.release_date || data.first_air_date,
    runtime: data.runtime || (data.episode_run_time && data.episode_run_time[0]),
    budget: data.budget,
    revenue: data.revenue,
    productionCompanies,
    cast,
  };
}

export async function enrichCatalogTitle(title: CatalogTitle): Promise<CatalogTitle> {
  if (!TMDB_API_KEY) return title; // Skip if no API key
  
  // Only enrich if we have an ID that looks like a TMDB ID (numbers)
  const match = title.id.match(/\d+/);
  const tmdbId = match ? match[0] : title.id;
  
  const path = title.kind === 'series' ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
  
  const data = await fetchTmdb(path, {
    append_to_response: 'credits,images',
    include_image_language: 'es,en,null'
  });

  if (!data) return title;
  
  return formatTmdbData(data, title);
}
