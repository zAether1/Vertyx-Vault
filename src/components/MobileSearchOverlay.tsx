'use client';

import { MOBILE_SUGGESTIONS } from '@/data/navigation';
import { useLiveSearch, useTypingPlaceholder } from '@/hooks/useLiveSearch';
import SearchResults from '@/components/SearchResults';
import { CloseIcon, SearchIcon } from '@/components/icons';

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Overlay de búsqueda móvil del template (mobileSearchTemplate). */
export default function MobileSearchOverlay({ open, onClose }: MobileSearchOverlayProps) {
  const { query, state, onInput } = useLiveSearch();
  const placeholder = useTypingPlaceholder(open);

  return (
    <div id="mobileSearchTemplate" className={`${open ? '' : 'hidden'} md:hidden`}>
      <div
        id="tmdb-search-overlay"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col pt-16 px-4"
        style={{ opacity: 1, transform: 'none' }}
      >
        <div className="relative flex items-center mb-4">
          <SearchIcon className="absolute left-3.5 h-5 w-5 text-[#e8dff2] z-10" />
          <div className="relative w-full">
            <form
              role="search"
              method="get"
              action="/search"
              className="w-full relative"
              autoComplete="off"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="search"
                name="q"
                id="tmdb-search-input-mobile"
                placeholder={placeholder}
                value={query}
                onChange={(e) => onInput(e.target.value)}
                className="w-full bg-transparent text-[#e8dff2] text-sm placeholder-violet-200/70 pl-11 pr-10 py-2.5 rounded-full border border-violet-200/30 outline-none focus:border-violet-200/50"
                autoComplete="off"
              />
              <SearchResults id="tmdb-search-results-mobile" state={state} />
            </form>
          </div>
          <CloseIcon
            className="absolute right-3.5 h-5 w-5 text-[#e8dff2] cursor-pointer hover:opacity-80 transition-opacity"
          />
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            className="absolute right-0 top-0 h-full w-12 opacity-0"
            onClick={onClose}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <br />
          <br />
          {query.trim().length < 2 && (
            <div
              id="tmdb-search-suggestions"
              className="flex flex-col items-center justify-center h-40 text-[#e8dff2]/70"
              style={{ marginTop: 10 }}
            >
              <div className="mt-1 space-y-2">
                {MOBILE_SUGGESTIONS.map((s) => (
                  <div
                    key={s.title}
                    className="px-4 py-2 bg-violet-200/10 rounded-full cursor-pointer hover:bg-violet-200/20 transition-colors"
                    onClick={() => onInput(s.title)}
                  >
                    <p className="text-sm text-[#e8dff2]" data-title={s.title}>
                      {s.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
