import Link from 'next/link';
import { contentHref } from '@/lib/routes';
import type { CatalogItem } from '@/lib/catalog';

export default function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <Link href={contentHref(item)} className="vault-title-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.poster} alt={`Póster de ${item.title}`} loading="lazy" />
      <div className="vault-title-card__meta">
        <strong>{item.title}</strong>
        <span>{item.kind === 'series' ? 'Serie' : 'Película'}{item.year ? ` · ${item.year}` : ''}</span>
      </div>
    </Link>
  );
}
