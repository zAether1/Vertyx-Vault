'use client';

import {
  searchItemLink,
  searchItemMediaType,
  type SearchState,
} from '@/hooks/useLiveSearch';

interface SearchResultsProps {
  id: string;
  state: SearchState;
}

/**
 * Dropdown de resultados de búsqueda: mismo markup que el renderResults
 * inline del template (poster w92, overview truncado, % de popularidad).
 */
export default function SearchResults({ id, state }: SearchResultsProps) {
  const hidden = state.status === 'idle';

  return (
    <div
      id={id}
      className={`mt-2 bg-transparent backdrop-blur-md rounded-lg shadow-xl max-h-[70vh] overflow-y-auto absolute w-full border border-white/10 right-0 z-50 ${hidden ? 'hidden' : ''}`}
    >
      {state.status === 'empty' && (
        <p className="text-white p-3">No se encontraron resultados.</p>
      )}
      {state.status === 'error' && (
        <p className="text-white p-3">Error al obtener resultados.</p>
      )}
      {state.status === 'results' &&
        state.items.map((item) => {
          const title = item.title || item.name || 'Untitled';
          const posterPath = item.poster_path
            ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
            : 'https://via.placeholder.com/92x138?text=No+Image';
          const matchPercent = item.popularity
            ? `${Math.round(item.popularity)}%`
            : 'N/A';
          const overview = item.overview || 'No description';

          return (
            <a
              key={`${item.media_type}-${item.id}`}
              href={searchItemLink(item)}
              className="flex items-center p-3 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10 last:border-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterPath}
                alt={title}
                className="w-16 h-24 object-cover rounded-sm"
              />
              <div className="ml-3 flex-1 overflow-hidden">
                <h3 className="text-white font-medium truncate">{title}</h3>
                <p className="text-white/80 text-sm mt-1 truncate">{overview}</p>
                <div className="flex items-center mt-1">
                  <span className="text-green-400 text-sm">{matchPercent}</span>
                  <span className="text-white/70 text-xs ml-2">{searchItemMediaType(item)}</span>
                </div>
              </div>
            </a>
          );
        })}
    </div>
  );
}
