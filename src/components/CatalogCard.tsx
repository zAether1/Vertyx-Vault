import Image from 'next/image';
import Link from 'next/link';
import { contentHref } from '@/lib/routes';
import type { CatalogItem } from '@/lib/catalog';

export default function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <Link href={contentHref(item)} className="vault-title-card">
      <Image src={item.poster} alt={`Póster de ${item.title}`} width={360} height={540} sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px" />
      <div className="vault-title-card__meta">
        <strong>{item.title}</strong>
        <span>{item.kind === 'series' ? 'Serie' : 'Película'}{item.year ? ` · ${item.year}` : ''}</span>
      </div>
    </Link>
  );
}
