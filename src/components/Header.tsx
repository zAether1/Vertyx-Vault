'use client';

import { useEffect, useRef, useState } from 'react';
import { NAV_ITEMS, type NavIconName } from '@/data/navigation';
import { useLiveSearch, useTypingPlaceholder } from '@/hooks/useLiveSearch';
import SearchResults from '@/components/SearchResults';
import {
  BellIcon,
  BoltIcon,
  CloseIcon,
  HomeIcon,
  MoviesIcon,
  SearchIcon,
  TrendingIcon,
  TvIcon,
} from '@/components/icons';

const NAV_ICONS: Record<NavIconName, (props: { className?: string }) => React.ReactNode> = {
  home: HomeIcon,
  trending: TrendingIcon,
  movies: MoviesIcon,
  tv: TvIcon,
};

function DesktopNav() {
  return (
    <div className="hidden md:flex items-center ml-8">
      <div className="flex items-center space-x-6">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          // Estado activo del original: azul en la ruta actual (home)
          const active = item.path === '/';
          return (
            <a
              key={item.id}
              id={item.id}
              href={item.path}
              className={`flex items-center text-sm font-medium ${active ? 'text-blue-500' : 'text-[#e5e5e5]'} transition-colors duration-200 hover:text-white`}
            >
              <Icon className="h-5 w-5 stroke-[1.5]" />
              <span className="ml-2">{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function DesktopSearch() {
  const { query, state, onInput, clear } = useLiveSearch();
  const placeholder = useTypingPlaceholder();

  return (
    <div className="relative w-96 mr-4 hidden md:block">
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3.5 h-5 w-5 text-white z-10" />
        <form
          role="search"
          method="get"
          action="/search"
          className="w-full relative"
          autoComplete="off"
          id="tmdb-search-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="search"
            name="q"
            id="tmdb-search-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onInput(e.target.value)}
            className="w-full bg-transparent text-white text-sm placeholder-white/70 pl-11 pr-10 py-2.5 rounded-full border border-white/30 outline-none focus:border-white/50"
            autoComplete="off"
          />
          {query !== '' && (
            <button
              type="button"
              id="clearSearch"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <CloseIcon className="w-4 h-4 text-white" />
            </button>
          )}
          <SearchResults id="tmdb-search-results" state={state} />
        </form>
      </div>
    </div>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const panel = panelRef.current;
      if (
        panel &&
        !panel.contains(e.target as Node) &&
        e.target !== bellRef.current
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="relative">
      <svg
        ref={bellRef}
        id="notification"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
        data-slot="icon"
        className="h-6 w-6 cursor-pointer text-white hover:text-gray-300 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      {badgeVisible && (
        <div
          id="notification-no"
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
        >
          <span className="text-[10px] font-bold text-white">1</span>
        </div>
      )}
      <div
        id="notification-template"
        ref={panelRef}
        style={{ right: 36, position: 'absolute' }}
        className={open ? '' : 'hidden'}
      >
        <div
          className="absolute right-0 top-8 w-80 bg-black/40 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.36)] border border-white/10 p-3 z-50"
          style={{ backdropFilter: 'blur(16px)', opacity: 1, transform: 'none' }}
        >
          <div className="relative">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-700/20 flex items-center justify-center">
                  <BoltIcon className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-white">Notificaciones</p>
              </div>
              <button
                id="close-notification"
                onClick={() => {
                  setOpen(false);
                  setBadgeVisible(false);
                }}
                className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <CloseIcon className="h-3 w-3 text-white/70" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-700/30 flex items-center justify-center">
                  <span className="text-blue-400 text-lg">🚀</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    El sitio está en modo de prueba
                  </p>
                  <p className="text-xs text-white/70 mt-1 mb-3">
                    ¿Encontraste algún error o problema? ¡Infórmanos en nuestro
                    canal de Telegram!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Header fijo del template: logo, nav desktop, búsqueda, campana y búsqueda móvil. */
export default function Header({
  onOpenMobileSearch,
}: {
  onOpenMobileSearch: () => void;
}) {
  return (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between px-4 py-0 -mt-2 transition-all lg:px-10 lg:py-0">
      <div className="flex items-center flex-1">
        <a className="cursor-pointer -ml-2" href="/">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_oficial.svg"
              alt="CINE HAX – Películas y Series GRATIS"
              className="h-24 w-auto -mt-1"
            />
          </div>
        </a>
        <DesktopNav />
      </div>

      <DesktopSearch />

      <div className="md:hidden">
        <button id="mobileSearchBtn" className="p-2" onClick={onOpenMobileSearch}>
          <span id="searchIcon">
            <SearchIcon className="h-5 w-5 text-white" />
          </span>
        </button>
      </div>

      <div className="flex items-center space-x-4 text-sm relative">
        <NotificationBell />
      </div>
    </header>
  );
}
