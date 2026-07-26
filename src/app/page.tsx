'use client';

import { useState } from 'react';
import heroData from '@/data/hero.json';
import rowsData from '@/data/rows.json';
import topData from '@/data/top.json';
import spotlightsData from '@/data/spotlights.json';
import type {
  ContentRowData,
  HeroSlide,
  SpotlightData,
  TopItem,
} from '@/types/content';
import IntroLoader from '@/components/IntroLoader';
import Header from '@/components/Header';
import MobileSearchOverlay from '@/components/MobileSearchOverlay';
import MobileBottomNav from '@/components/MobileBottomNav';
import HeroSlider from '@/components/HeroSlider';
import SearchCta from '@/components/SearchCta';
import ContentRow from '@/components/ContentRow';
import TopTenRow from '@/components/TopTenRow';
import SpotlightBanner from '@/components/SpotlightBanner';
import Footer from '@/components/Footer';
import PlatformRow from '@/components/PlatformRow';

const hero = heroData as HeroSlide[];
const rows = rowsData as ContentRowData[];
const { topMovies, topSeries } = topData as { topMovies: TopItem[]; topSeries: TopItem[] };
const spotlights = spotlightsData as SpotlightData[];

const rowByTitle = (title: string): ContentRowData => {
  const row = rows.find((r) => r.title === title);
  if (!row) throw new Error(`Fila no encontrada: ${title}`);
  return row;
};

/**
 * Home: mismo orden de secciones que el index.html original.
 * Loader → Hero → más vistas → Top10 películas → Top10 series → filas →
 * spotlight 1 → filas → spotlight 2 → filas → footer.
 */
export default function Home() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <IntroLoader />
      <Header onOpenMobileSearch={() => setMobileSearchOpen((v) => !v)} />
      <MobileSearchOverlay
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />

      <main style={{ marginTop: -50 }}>
        <HeroSlider slides={hero} />
        <div className="px-4 md:px-8 lg:px-12">
          <SearchCta />
          <PlatformRow />
        </div>

        <div className="relative">
          <section className="mt-0 md:mt-0 space-y-2 md:space-y-4 pb-12 md:pb-24 md:space-y-12">
            <ContentRow row={rowByTitle('Películas más vistas')} />

            <TopTenRow
              variant="PELÍCULAS"
              seeAllHref="/explore/?type=movie&sort=trending&time=day"
              items={topMovies}
            />
            <TopTenRow
              variant="SERIES"
              seeAllHref="/explore/?type=tv&sort=trending&time=day"
              items={topSeries}
            />

            <ContentRow row={rowByTitle('Series de Netflix')} />
            <ContentRow row={rowByTitle('Series mejores valoradas')} />
            <ContentRow row={rowByTitle('Películas coreanas')} />

            <SpotlightBanner data={spotlights[0]} />

            <ContentRow row={rowByTitle('Películas de comedia')} />
            <ContentRow row={rowByTitle('Películas de acción')} />
            <ContentRow row={rowByTitle('Películas románticas')} />
            <ContentRow row={rowByTitle('Películas de terror')} />
            <ContentRow row={rowByTitle('Películas de aventuras')} />
            <ContentRow row={rowByTitle('Películas de fantasía')} />
            <ContentRow row={rowByTitle('Películas de historia')} />
            <ContentRow row={rowByTitle('Películas de música')} />
            <ContentRow row={rowByTitle('Películas de misterio')} />
            <ContentRow row={rowByTitle('Películas de guerra')} />

            <SpotlightBanner data={spotlights[1]} />

            <ContentRow row={rowByTitle('Películas del oeste')} />
            <ContentRow row={rowByTitle('Series de acción y aventuras')} />
            <ContentRow row={rowByTitle('Series para niños/as')} />
            <ContentRow row={rowByTitle('Series de ciencia ficción y fantasía')} />
            <ContentRow row={rowByTitle('Series de telenovelas')} />
            <ContentRow row={rowByTitle('Series de guerra y política')} />
          </section>
        </div>
      </main>

      <MobileBottomNav />
      <Footer />
    </>
  );
}
