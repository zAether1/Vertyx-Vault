import { notFound } from 'next/navigation';
import Link from 'next/link';
import CatalogCard from '@/components/CatalogCard';
import PlaybackProgress from '@/components/player/PlaybackProgress';
import { findCatalogTitle, getPlaybackSource, getRecommendations } from '@/server/catalog';
import { FavoriteButton, HistoryTracker } from '@/components/LibraryActions';
import Reveal from '@/components/motion/Reveal';

export default async function TitlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ episode?: string }> }) {
  const { id } = await params;
  const { episode } = await searchParams;
  const item = await findCatalogTitle(id);
  if (!item) notFound();
  const firstEpisode = item.seasons?.[0]?.episodes[0];
  const selectedEpisode = item.seasons?.flatMap((season) => season.episodes).find((entry) => entry.id === episode) ?? firstEpisode;
  const [source, recommendations] = await Promise.all([
    getPlaybackSource({ titleId: item.id, episodeId: selectedEpisode?.id }),
    getRecommendations(item.id),
  ]);
  return (
    <main className="vault-detail"><HistoryTracker id={item.id} />
      {item.backdrop && <div className="vault-detail__backdrop" style={{ backgroundImage: `url(${item.backdrop})` }} />}
      <Reveal className="vault-detail__content">
        <Link href="/explore" className="text-sm text-[#eee9f4]/65 hover:text-[#eee9f4]">← Volver a explorar</Link>
        <p className="vault-page__eyebrow mt-10">{item.kind === 'series' ? 'Serie' : 'Película'}{item.collection ? ` · ${item.collection}` : ''}</p>
        <h1 className="mt-3 text-4xl md:text-7xl font-bold tracking-tight">{item.title}</h1>
        <div className="vault-detail__meta">
          {item.year && <span>{item.year}</span>}
          {item.rating && <span>Valoración {item.rating}</span>}
          <span>{item.kind === 'series' ? 'Serie' : 'Película'}</span>
          {item.genres?.map((genre) => <span key={genre}>{genre}</span>)}
        </div>
        <p className="text-[#eee9f4]/75 max-w-2xl leading-relaxed">{item.description ?? 'Información ampliada disponible cuando se conecte el catálogo autorizado.'}</p>
      <div className="mt-7"><FavoriteButton id={item.id} /></div></Reveal>
      <section className="vault-player" aria-label={`Reproductor de ${item.title}`}>
        <PlaybackProgress id={item.id} title={selectedEpisode ? `${item.title} · ${selectedEpisode.title}` : item.title} source={source} />
      </section>
      {item.seasons?.length ? <section className="mt-10 max-w-5xl" aria-label="Temporadas y episodios">
        <h2 className="text-2xl font-bold">Temporadas y episodios</h2>
        <div className="mt-4 space-y-6">
          {item.seasons.map((season) => <div key={season.id} className="vault-glass rounded-2xl p-4">
            <h3 className="font-semibold">{season.title}</h3>
            <div className="mt-3 grid gap-2">
              {season.episodes.map((entry) => <Link key={entry.id} href={`/title/${item.id}?episode=${entry.id}`} className={`rounded-xl border px-3 py-3 transition ${selectedEpisode?.id === entry.id ? 'border-[#c9a8f0] bg-[#5f318f]/20' : 'border-[#b9a9ca]/12 hover:border-[#8f5bd7]/40'}`}>
                <span className="text-sm text-[#c9a8f0]">T{entry.seasonNumber}:E{entry.episodeNumber}</span>
                <strong className="block">{entry.title}</strong>
                {entry.overview && <span className="block text-sm text-[#eee9f4]/62 mt-1">{entry.overview}</span>}
              </Link>)}
            </div>
          </div>)}
        </div>
      </section> : null}
      {recommendations.length ? <section className="mt-12 max-w-6xl" aria-label="Recomendaciones">
        <h2 className="text-2xl font-bold">Recomendaciones</h2>
        <div className="vault-grid">{recommendations.map((entry) => <CatalogCard key={entry.id} item={entry} />)}</div>
      </section> : null}
    </main>
  );
}
