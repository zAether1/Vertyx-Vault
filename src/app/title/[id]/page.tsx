import { notFound } from 'next/navigation';
import Link from 'next/link';
import MediaPlayer from '@/components/player/MediaPlayer';
import { findContent } from '@/lib/catalog';

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = findContent(id);
  if (!item) notFound();
  return (
    <main className="vault-detail">
      {item.backdrop && <div className="vault-detail__backdrop" style={{ backgroundImage: `url(${item.backdrop})` }} />}
      <div className="vault-detail__content">
        <Link href="/explore" className="text-sm text-white/65 hover:text-white">← Volver a explorar</Link>
        <p className="vault-page__eyebrow mt-10">{item.kind === 'series' ? 'Serie' : 'Película'}{item.collection ? ` · ${item.collection}` : ''}</p>
        <h1 className="mt-3 text-4xl md:text-7xl font-bold tracking-tight">{item.title}</h1>
        <div className="vault-detail__meta">
          {item.year && <span>{item.year}</span>}
          {item.rating && <span>Valoración {item.rating}</span>}
          <span>{item.kind === 'series' ? 'Serie' : 'Película'}</span>
        </div>
        <p className="text-white/75 max-w-2xl leading-relaxed">{item.description ?? 'Información ampliada disponible cuando se conecte el catálogo autorizado.'}</p>
      </div>
      <section className="vault-player" aria-label={`Reproductor de ${item.title}`}>
        <MediaPlayer title={item.title} />
      </section>
    </main>
  );
}
