'use client';

import { useMemo, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CatalogCard from '@/components/CatalogCard';
import type { CatalogItem, ContentKind } from '@/lib/catalog';

const FILTERS: { value: 'all' | ContentKind; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'movie', label: 'Películas' },
  { value: 'series', label: 'Series' },
];

export default function ExploreCatalog({ items, initialKind = 'all' }: { items: CatalogItem[]; initialKind?: 'all' | ContentKind }) {
  const [kind, setKind] = useState<'all' | ContentKind>(initialKind);
  const visibleItems = useMemo(() => kind === 'all' ? items : items.filter((item) => item.kind === kind), [items, kind]);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('[data-catalog-card]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .38, stagger: .025, ease: 'power2.out', overwrite: true });
  }, { dependencies: [kind, visibleItems.length] });

  return <>
    <div className="vault-filter-bar" role="group" aria-label="Filtrar catálogo">
      {FILTERS.map((filter) => <button key={filter.value} type="button" className={`vault-filter ${kind === filter.value ? 'vault-filter--active' : ''}`} aria-pressed={kind === filter.value} onClick={() => setKind(filter.value)}>{filter.label}</button>)}
    </div>
    <p className="text-sm text-white/50 mt-5" aria-live="polite">{visibleItems.length} títulos disponibles</p>
    {visibleItems.length ? <div className="vault-grid">{visibleItems.map((item) => <div key={item.id} data-catalog-card><CatalogCard item={item} /></div>)}</div> : <p className="text-white/60 mt-12">No encontramos títulos con ese filtro.</p>}
  </>;
}
