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
      <div className="vault-detail__layout">
        {/* Columna Izquierda: Poster */}
        <div className="vault-detail__poster-wrap">
          {item.rating && <div className="vault-detail__poster-rating">{item.rating.toFixed(1)}</div>}
          <img src={item.poster} alt={`Póster de ${item.title}`} />
        </div>

        {/* Columna Derecha: Información */}
        <Reveal className="vault-detail__content">
          <Link href="/explore" className="vault-detail__back" style={{ marginBottom: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Volver a explorar
          </Link>
          
          {item.logo ? (
            <img src={item.logo} alt={item.title} className="vault-detail__logo" />
          ) : (
            <h1 className="vault-detail__title">{item.title}</h1>
          )}

          {item.productionCompanies && item.productionCompanies.length > 0 && (
            <div className="vault-detail__companies">
              {item.productionCompanies.map((c, i) => c.logoUrl ? (
                <img key={i} src={c.logoUrl} alt={c.name} className="vault-detail__company" title={c.name} />
              ) : null)}
            </div>
          )}

          <div className="vault-detail__meta">
            {item.releaseDate && (
              <span title="Fecha de estreno">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.releaseDate))}
              </span>
            )}
            {item.runtime ? (
              <span title="Duración">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {Math.floor(item.runtime / 60) > 0 ? `${Math.floor(item.runtime / 60)}h ` : ''}{item.runtime % 60}m
              </span>
            ) : item.year ? (
              <span>{item.year}</span>
            ) : null}
          </div>

          <h3 className="vault-detail__desc-title">Descripción</h3>
          <p className="vault-detail__synopsis">{item.description ?? 'Información ampliada disponible cuando se conecte el catálogo autorizado.'}</p>
          
          <div className="vault-detail__actions">
            <span className="vault-action" style={{ pointerEvents: 'none' }}>{item.kind === 'series' ? 'Serie' : 'Película'}</span>
            {item.genres?.map((genre) => <span key={genre} className="vault-action" style={{ pointerEvents: 'none' }}>{genre}</span>)}
            <FavoriteButton id={item.id} />
          </div>
        </Reveal>
      </div>

      <div className="vault-detail__stats">
        <div className="vault-detail__stat">
          <dt>Estado</dt>
          <dd>{item.status || 'Estrenado'}</dd>
        </div>
        <div className="vault-detail__stat">
          <dt>Presupuesto</dt>
          <dd>{item.budget ? Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.budget) : '—'}</dd>
        </div>
        <div className="vault-detail__stat">
          <dt>Ganancia</dt>
          <dd>{item.revenue ? Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.revenue) : '—'}</dd>
        </div>
      </div>

      {item.cast && item.cast.length > 0 && (
        <section className="vault-detail__cast">
          <h2 className="vault-detail__cast-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Producción y Créditos
          </h2>
          <div className="vault-detail__cast-grid">
            {item.cast.map(actor => (
              <div key={actor.id} className="vault-detail__actor">
                {actor.profileUrl ? (
                  <img src={actor.profileUrl} alt={actor.name} className="vault-detail__actor-img" />
                ) : (
                  <div className="vault-detail__actor-img" />
                )}
                <div className="vault-detail__actor-info">
                  <strong className="vault-detail__actor-name">{actor.name}</strong>
                  <span className="vault-detail__actor-role">{actor.character}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
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
