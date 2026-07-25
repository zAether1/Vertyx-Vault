'use client';

import { useMemo, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CatalogCard from '@/components/CatalogCard';
import type { CatalogKind, CatalogTitle } from '@/types/catalog';

const FILTERS: { value: 'all' | CatalogKind; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'movie', label: 'Películas' },
  { value: 'series', label: 'Series' },
];

export default function ExploreCatalog({ items, initialKind = 'all', initialGenre = 'all', initialYear = 'all' }: { items: CatalogTitle[]; initialKind?: 'all' | CatalogKind; initialGenre?: string; initialYear?: string }) {
  const [kind, setKind] = useState<'all' | CatalogKind>(initialKind);
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState(initialYear);
  const genres = useMemo(() => ['all', ...Array.from(new Set(items.flatMap((item) => item.genres ?? []))).sort((a, b) => a.localeCompare(b, 'es'))], [items]);
  const years = useMemo(() => ['all', ...Array.from(new Set(items.map((item) => item.year).filter((value): value is string => Boolean(value)))).sort((a, b) => b.localeCompare(a))], [items]);
  const visibleItems = useMemo(() => items.filter((item) => {
    const kindMatches = kind === 'all' || item.kind === kind;
    const genreMatches = genre === 'all' || item.genres?.includes(genre);
    const yearMatches = year === 'all' || item.year === year;
    return kindMatches && genreMatches && yearMatches;
  }), [items, kind, genre, year]);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('[data-catalog-card]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .38, stagger: .025, ease: 'power2.out', overwrite: true });
  }, { dependencies: [kind, genre, year, visibleItems.length] });

  return <>
    <div className="vault-filter-bar" role="group" aria-label="Filtrar catálogo por tipo">
      {FILTERS.map((filter) => <button key={filter.value} type="button" className={`vault-filter ${kind === filter.value ? 'vault-filter--active' : ''}`} aria-pressed={kind === filter.value} onClick={() => setKind(filter.value)}>{filter.label}</button>)}
    </div>
    {genres.length > 1 && <div className="vault-filter-bar" role="group" aria-label="Filtrar catálogo por género">
      {genres.map((value) => <button key={value} type="button" className={`vault-filter ${genre === value ? 'vault-filter--active' : ''}`} aria-pressed={genre === value} onClick={() => setGenre(value)}>{value === 'all' ? 'Todos los géneros' : value}</button>)}
    </div>}
    {years.length > 1 && <div className="vault-filter-bar" role="group" aria-label="Filtrar catálogo por año">
      {years.slice(0, 12).map((value) => <button key={value} type="button" className={`vault-filter ${year === value ? 'vault-filter--active' : ''}`} aria-pressed={year === value} onClick={() => setYear(value)}>{value === 'all' ? 'Todos los años' : value}</button>)}
    </div>}
    <p className="text-sm text-[#eee9f4]/50 mt-5" aria-live="polite">{visibleItems.length} títulos disponibles</p>
    {visibleItems.length ? <div className="vault-grid">{visibleItems.map((item) => <div key={item.id} data-catalog-card><CatalogCard item={item} /></div>)}</div> : <p className="text-[#eee9f4]/60 mt-12">No encontramos títulos con ese filtro.</p>}
  </>;
}
