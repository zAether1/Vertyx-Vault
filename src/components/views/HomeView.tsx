"use client";

import { catalog, featuredItems } from "@/data/catalog";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { Hero } from "@/components/sections/Hero";
import { ContentRow } from "@/components/sections/ContentRow";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { ContinueWatchingRow } from "@/components/sections/ContinueWatchingRow";
import { Footer } from "@/components/layout/Footer";

export function HomeView() {
  const { t } = useI18n();

  const hero = featuredItems[0] ?? catalog[0]!;
  const trending = [...catalog].sort((a, b) => b.score - a.score).slice(0, 14);
  const newest = [...catalog].sort((a, b) => b.year - a.year).slice(0, 14);
  const curated = catalog.filter((c) => c.featured || c.score >= 90).slice(0, 14);
  const acclaimed = [...catalog].sort((a, b) => b.score - a.score).slice(4, 18);

  return (
    <>
      <Hero item={hero} />
      <div className="space-y-16 pb-24 pt-10" data-i18n-region>
        <ContinueWatchingRow />
        <ContentRow title={t.home.trendingNow} items={trending} />
        <ContentRow title={t.home.newArrivals} items={newest} />
        <CategoryGrid />
        <ContentRow title={t.home.curatedForYou} items={curated} />
        <ContentRow title={t.home.acclaimed} items={acclaimed} />
      </div>
      <Footer />
    </>
  );
}
