"use client";

import { catalog, featuredItems } from "@/data/catalog";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { ContentRow } from "@/components/sections/ContentRow";
import { TopTenRow } from "@/components/sections/TopTenRow";
import { SpotlightBanner } from "@/components/sections/SpotlightBanner";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { ContinueWatchingRow } from "@/components/sections/ContinueWatchingRow";
import { Footer } from "@/components/layout/Footer";

export function HomeView() {
  const { t } = useI18n();

  const byScore = [...catalog].sort((a, b) => b.score - a.score);
  const heroItems = [
    ...featuredItems,
    ...byScore.filter((c) => !c.featured),
  ].slice(0, 6);

  const mostWatched = byScore.slice(0, 14);
  const newest = [...catalog].sort((a, b) => b.year - a.year).slice(0, 14);
  const curated = catalog.filter((c) => c.featured || c.score >= 90).slice(0, 14);
  const topMovies = byScore.filter((c) => c.kind === "film").slice(0, 10);
  const topSeries = byScore.filter((c) => c.kind === "series").slice(0, 10);
  const spotlightA = byScore.find((c) => c.kind === "film" && !c.featured) ?? byScore[0]!;
  const spotlightB = byScore.find((c) => c.kind === "series" && c.id !== spotlightA.id) ?? byScore[1]!;

  return (
    <>
      <HeroSlider items={heroItems} />
      <div className="space-y-16 pb-24 pt-12" data-i18n-region>
        <ContinueWatchingRow />
        <ContentRow title={t.home.mostWatched} items={mostWatched} />
        <TopTenRow title={t.home.topMoviesToday} items={topMovies} />
        <SpotlightBanner item={spotlightA} />
        <ContentRow title={t.home.newArrivals} items={newest} />
        <CategoryGrid />
        <TopTenRow title={t.home.topSeriesToday} items={topSeries} />
        <SpotlightBanner item={spotlightB} />
        <ContentRow title={t.home.curatedForYou} items={curated} />
      </div>
      <Footer />
    </>
  );
}
