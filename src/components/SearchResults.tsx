'use client';

import { searchItemLink, searchItemMediaType, type SearchState } from '@/hooks/useLiveSearch';

interface SearchResultsProps {
  id: string;
  state: SearchState;
}

/** Dropdown de resultados sobre el índice local de Vertyx Vault. */
export default function SearchResults({ id, state }: SearchResultsProps) {
  const hidden = state.status === 'idle';

  return (
    <div
      id={id}
      className={`vault-glass mt-2 rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto absolute w-full right-0 z-50 ${hidden ? 'hidden' : ''}`}
    >
      {state.status === 'empty' && <p className="text-[#eee9f4] p-3">No hay coincidencias en el catálogo actual.</p>}
      {state.status === 'results' && state.items.map((item) => {
        const title = item.title || item.name || 'Sin título';
        return (
          <a key={item.id} href={searchItemLink(item)} className="flex items-center p-3 hover:bg-[#5f318f]/16 transition-colors border-b border-[#b9a9ca]/12 last:border-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.poster ?? '/vertyx-mark.svg'} alt="" className="w-12 h-[72px] object-cover rounded-md bg-[#5f318f]/10" />
            <div className="ml-3 flex-1 min-w-0">
              <h3 className="text-[#eee9f4] font-medium truncate">{title}</h3>
              <p className="text-[#eee9f4]/65 text-sm mt-1 truncate">{item.overview}</p>
              <span className="text-[#c9a8f0] text-xs mt-2 block">{searchItemMediaType(item)}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
