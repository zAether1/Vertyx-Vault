/** Tipos del contenido extraído del template original (src/data/*.json). */

export interface HeroSlide {
  bg: string;
  logo: string;
  title: string;
  desc: string;
  type: string;
  rating: number;
  release: string;
  thumbnail: string;
  watchHref: string;
  detailHref: string;
}

export interface RowCard {
  href: string;
  poster: string;
  title: string;
  /** stroke-dasharray del anillo de rating (p. ej. 75.36) */
  progress: number;
  rating: number;
}

export interface ContentRowData {
  title: string;
  seeAllHref: string;
  cards: RowCard[];
}

export interface TopItem {
  href: string;
  rank: number;
  poster: string;
  title: string;
}

export interface SpotlightData {
  title: string;
  bg: string;
  poster: string;
  ratingDash: number;
  rating: number;
  type: string;
  year: string;
  desc: string;
  watchHref: string;
}
