import { NAV_ITEMS, type NavIconName } from '@/data/navigation';
import { HomeIcon, MoviesIcon, TrendingIcon, TvIcon } from '@/components/icons';

const NAV_ICONS: Record<NavIconName, (props: { className?: string }) => React.ReactNode> = {
  home: HomeIcon,
  trending: TrendingIcon,
  movies: MoviesIcon,
  tv: TvIcon,
  library: HomeIcon,
};

const LABELS: Record<NavIconName, string> = {
  home: 'Home',
  trending: 'Trending',
  movies: 'Movies',
  tv: 'Series',
  library: 'Mi lista',
};

/** Dock flotante de navegación móvil del template (esquina inferior derecha). */
export default function MobileBottomNav() {
  return (
    <div className="md:hidden fixed right-4 bottom-4 bg-[#051237]/80 backdrop-blur-lg z-50 rounded-full py-1 shadow-2xl shadow-blue-900/20 border border-blue-900/30">
      <div className="flex flex-col justify-around items-center px-2.5 gap-3">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const active = item.path === '/';
          return (
            <a
              key={item.id}
              href={item.path}
              className="flex items-center justify-center p-2 relative"
              aria-label={LABELS[item.icon]}
            >
              <div
                className={`flex items-center justify-center ${active ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
