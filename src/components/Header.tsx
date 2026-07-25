'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, type NavIconName } from '@/data/navigation';
import { useLiveSearch, useTypingPlaceholder } from '@/hooks/useLiveSearch';
import SearchResults from '@/components/SearchResults';
import { CloseIcon, HomeIcon, MoviesIcon, SearchIcon, TrendingIcon, TvIcon } from '@/components/icons';

const NAV_ICONS: Record<NavIconName, (props: { className?: string }) => React.ReactNode> = {
  home: HomeIcon,
  trending: TrendingIcon,
  movies: MoviesIcon,
  tv: TvIcon,
  library: HomeIcon,
};

function DesktopNav() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  useEffect(() => setSearch(window.location.search.slice(1)), []);
  return (
    <nav className="hidden md:flex items-center ml-8" aria-label="Navegación principal">
      <div className="flex items-center space-x-6">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const [itemPath, itemQuery] = item.path.split('?');
          const active = pathname === itemPath && (itemQuery ? search === itemQuery : pathname !== '/explore' || search === '');
          return (
            <a key={item.id} href={item.path} aria-current={active ? 'page' : undefined} className={`vault-nav-link flex items-center text-sm font-medium transition-colors ${active ? 'vault-nav-link--active' : ''}`}>
              <Icon className="h-5 w-5 stroke-[1.5]" />
              <span className="ml-2">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function DesktopSearch() {
  const { query, state, onInput, clear } = useLiveSearch();
  const placeholder = useTypingPlaceholder();
  return (
    <div className="relative w-96 hidden md:block">
      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#eee9f4]/70 z-10" />
      <form role="search" className="w-full relative" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
        <input type="search" name="q" placeholder={placeholder} value={query} onChange={(event) => onInput(event.target.value)} className="w-full bg-[#5f318f]/[0.07] text-[#eee9f4] text-sm placeholder-[#b9a9ca]/55 pl-11 pr-10 py-2.5 rounded-full border border-[#b9a9ca]/15 outline-none focus:border-[#c9a8f0]/60 transition-colors" autoComplete="off" />
        {query && <button type="button" onClick={clear} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#eee9f4]/70 hover:text-[#eee9f4]"><CloseIcon className="w-4 h-4" /></button>}
        <SearchResults id="vault-search-results" state={state} />
      </form>
    </div>
  );
}

/** Barra de navegación adaptativa de Vertyx Vault. */
export default function Header({ onOpenMobileSearch }: { onOpenMobileSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header className={`fixed top-0 z-50 flex w-full items-center justify-between px-4 py-3 lg:px-10 transition-all duration-300 ${scrolled ? 'vault-glass border-x-0 border-t-0 shadow-2xl shadow-black/20' : 'bg-transparent'}`}>
      <div className="flex items-center flex-1">
        <a href="/" className="flex items-center gap-2.5 group" aria-label="Vertyx Vault, inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vertyx-mark.svg" alt="" className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
          <span className="vault-wordmark text-lg leading-none"><strong>VERTYX</strong><span> VAULT</span></span>
        </a>
        <DesktopNav />
      </div>
      <DesktopSearch />
      <button type="button" aria-label="Buscar en Vertyx Vault" className="md:hidden p-2 text-[#eee9f4]/85 hover:text-[#eee9f4]" onClick={onOpenMobileSearch}>
        <SearchIcon className="h-5 w-5" />
      </button>
    </header>
  );
}
