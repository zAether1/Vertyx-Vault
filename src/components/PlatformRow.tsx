'use client';

import Link from 'next/link';
import { PlaySolidIcon, TrendingIcon } from '@/components/icons';

const PLATFORMS = [
  { label: 'Trending', href: '/explore?sort=trending', icon: <TrendingIcon className="h-4 w-4" /> },
  { label: 'Latest Release', href: '/explore?sort=latest', icon: <PlaySolidIcon className="h-4 w-4" /> },
  { label: 'Netflix', href: '/explore?provider=netflix', icon: <span className="text-xs font-semibold">N</span> },
  { label: 'Prime Video', href: '/explore?provider=prime', icon: <span className="text-xs font-semibold">P</span> },
  { label: 'JioHotstar', href: '/explore?provider=jio', icon: <span className="text-xs font-semibold">J</span> },
  { label: 'SonyLIV', href: '/explore?provider=sony', icon: <span className="text-xs font-semibold">S</span> },
  { label: 'Crunchyroll', href: '/explore?provider=crunchyroll', icon: <span className="text-xs font-semibold">C</span> },
  { label: 'Kids', href: '/explore?genre=kids', icon: <span className="text-xs font-semibold">K</span> },
  { label: 'MX Player', href: '/explore?provider=mxplayer', icon: <span className="text-xs font-semibold">M</span> },
];

export default function PlatformRow() {
  return (
    <section className="mt-6 px-4 md:px-8 lg:px-12">
      <div className="vault-glass border border-[#b9a9ca]/12 backdrop-blur-xl rounded-[2rem] px-3 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 whitespace-nowrap">
          {PLATFORMS.map((platform) => (
            <Link
              key={platform.label}
              href={platform.href}
              className="vault-filter inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#eee9f4] transition-colors hover:text-[#fff]"
              aria-label={`Explorar ${platform.label}`}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5f318f]/20 text-[#c9a8f0]">
                {platform.icon}
              </span>
              {platform.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
