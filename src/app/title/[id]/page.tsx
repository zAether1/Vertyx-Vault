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
        <Link href="/explore" className="vault-detail__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Volver a explorar
        </Link>
        <p className="vault-page__eyebrow vault-detail__eyebrow">{item.kind === 'series' ? 'Serie' : 'Película'}{item.collection ? ` · ${item.collection}` : ''}</p>
        <h1 className="vault-detail__title">{item.title}</h1>
        <div className="vault-detail__meta">
          {item.year && <span>{item.year}</span>}
          {item.rating && <span className="vault-detail__rating">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {item.rating}
          </span>}
          <span>{item.kind === 'series' ? 'Serie' : 'Película'}</span>
          {item.genres?.map((genre) => <span key={genre}>{genre}</span>)}
        </div>
        <p className="vault-detail__synopsis">{item.description ?? 'Información ampliada disponible cuando se conecte el catálogo autorizado.'}</p>
        <div className="vault-detail__actions">
          <FavoriteButton id={item.id} />
        </div>
      </Reveal>
      <section className="vault-cinema" aria-label={`Reproductor de ${item.title}`}>
        <div className="vault-cinema__glow" />
        <div className="vault-cinema__screen">
          <PlaybackProgress id={item.id} title={selectedEpisode ? `${item.title} · ${selectedEpisode.title}` : item.title} source={source} />
        </div>
        {selectedEpisode && <div className="vault-cinema__now-playing">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
          <span>Reproduciendo: <strong>{selectedEpisode.title}</strong></span>
        </div>}
      </section>
      {item.seasons?.length ? <section className="vault-episodes" aria-label="Temporadas y episodios">
        <h2 className="vault-episodes__heading">Temporadas y episodios</h2>
        <div className="vault-episodes__seasons">
          {item.seasons.map((season) => <div key={season.id} className="vault-episodes__season">
            <h3 className="vault-episodes__season-title">{season.title}</h3>
            <div className="vault-episodes__list">
              {season.episodes.map((entry) => <Link key={entry.id} href={`/title/${item.id}?episode=${entry.id}`} className={`vault-episodes__item ${selectedEpisode?.id === entry.id ? 'vault-episodes__item--active' : ''}`}>
                <span className="vault-episodes__number">
                  {selectedEpisode?.id === entry.id
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    : `${entry.episodeNumber}`}
                </span>
                <div className="vault-episodes__info">
                  <span className="vault-episodes__label">T{entry.seasonNumber} · E{entry.episodeNumber}</span>
                  <strong className="vault-episodes__name">{entry.title}</strong>
                  {entry.overview && <span className="vault-episodes__overview">{entry.overview}</span>}
                </div>
              </Link>)}
            </div>
          </div>)}
        </div>
      </section> : null}
      {recommendations.length ? <section className="vault-detail__recs" aria-label="Recomendaciones">
        <h2 className="vault-episodes__heading">Recomendaciones</h2>
        <div className="vault-grid">{recommendations.map((entry) => <CatalogCard key={entry.id} item={entry} />)}</div>
      </section> : null}
    </main>
  );
}
