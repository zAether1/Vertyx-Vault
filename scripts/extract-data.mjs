/**
 * Extrae los datos de contenido de index.html (template original)
 * y los vuelca a src/data/*.json para consumirlos tipados desde Next.js.
 *
 * Uso: node scripts/extract-data.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const outDir = join(root, 'src', 'data');
mkdirSync(outDir, { recursive: true });

const localize = (url) =>
  url
    .replace(/^https?:\/\/image\.tmdb\.org/, '')
    .replace(/\/t\/p\//, '/t/p/')
    .replace(/\/\//g, '/');

// ---------------------------------------------------------------------------
// 1. Hero: var movies = [...]
// ---------------------------------------------------------------------------
const moviesMatch = html.match(/var movies = (\[[\s\S]*?\]);/);
if (!moviesMatch) throw new Error('No se encontró var movies');
const hero = JSON.parse(moviesMatch[1]).map((m) => ({
  // El slider original usa las URLs absolutas de image.tmdb.org en runtime
  bg: m.bg.replace(/([^:])\/\//g, '$1/'),
  logo: m.logo ? m.logo.replace(/([^:])\/\//g, '$1/') : '',
  title: m.title_text,
  desc: m.desc,
  type: m.type,
  rating: m.rating,
  release: m.release,
  thumbnail: m.thumbnail.replace(/([^:])\/\//g, '$1/'),
  // /watch/?type=movie&id=123 -> ruta interna
  watchHref: new URL(m.watch_link).pathname + new URL(m.watch_link).search,
  detailHref: new URL(m.link).pathname,
}));
writeFileSync(join(outDir, 'hero.json'), JSON.stringify(hero, null, 2));

// ---------------------------------------------------------------------------
// 2. Content rows: .scroll-section -> h2 + "Ver todo" + cards
// ---------------------------------------------------------------------------
const body = html.slice(html.indexOf('<body'));
const rows = [];
const sectionRe = /<div class="scroll-section[^"]*">([\s\S]*?)(?=<div class="scroll-section|<!-- top slider|<footer)/g;
let sm;
while ((sm = sectionRe.exec(body))) {
  const sec = sm[1];
  const title = (sec.match(/<h2[^>]*>([^<]*)<\/h2>/) || [])[1]?.trim();
  if (!title) continue;
  const seeAll = (sec.match(/<a href="([^"]*)"[^>]*>Ver todo<\/a>/) || [])[1] || '';
  const cards = [];
  const cardRe = /<a href="([^"]*)"[^>]*class="cursor-pointer relative group[\s\S]*?<img src="([^"]*)" alt="([^"]*)"[\s\S]*?stroke-dasharray="([\d.]+) 100"[\s\S]*?<span class="text-white font-bold text-sm drop-shadow-md">([\d.]+)<\/span>/g;
  let cm;
  while ((cm = cardRe.exec(sec))) {
    cards.push({
      href: cm[1],
      poster: '/' + cm[2].replace(/^\/+/, ''),
      title: cm[3],
      progress: parseFloat(cm[4]), // stroke-dasharray del círculo de rating
      rating: parseFloat(cm[5]),
    });
  }
  // "Ver todo" externo -> ruta interna /explore/?...
  let seeAllHref = seeAll;
  try {
    const u = new URL(seeAll);
    seeAllHref = u.pathname + u.search;
  } catch {}
  rows.push({ title, seeAllHref, cards });
}
writeFileSync(join(outDir, 'rows.json'), JSON.stringify(rows, null, 2));

// ---------------------------------------------------------------------------
// 3. Top sliders (películas y series): números 1-10 con póster
// ---------------------------------------------------------------------------
function extractTop(containerId) {
  const i = body.indexOf(`id="${containerId}"`);
  if (i === -1) return [];
  // hasta el cierre del contenedor: siguiente slider o sección
  const chunk = body.slice(i, i + 40000);
  const items = [];
  const re = /onclick="window\.location\.href='([^']*)';"[\s\S]*?<span[^>]*style="-webkit-text-stroke[^"]*"[^>]*>\s*(\d+)\s*<\/span>[\s\S]*?<img src="([^"]*)" alt="([^"]*)"/g;
  let m;
  while ((m = re.exec(chunk)) && items.length < 10) {
    items.push({
      href: m[1].replace(/&#0?38;/g, '&'),
      rank: parseInt(m[2], 10),
      poster: '/' + m[3].replace(/^\/+/, ''),
      title: m[4],
    });
  }
  return items;
}
const topMovies = extractTop('top-slider-container');
const topSeries = extractTop('top-series-slider-container');
writeFileSync(join(outDir, 'top.json'), JSON.stringify({ topMovies, topSeries }, null, 2));

// ---------------------------------------------------------------------------
// 4. Spotlight banners (2): banner ancho con póster, rating, año y CTA
// ---------------------------------------------------------------------------
const spotlights = [];
const spotRe = /<div class="relative w-full h-\[280px\][\s\S]*?<img alt="([^"]*)"[^>]*src="([^"]*)"[\s\S]*?<img alt="[^"]*"[^>]*src="([^"]*)"[\s\S]*?stroke-dasharray="(\d+), 100"[\s\S]*?<span class="text-white text-xs font-medium">([\d.]+)<\/span>[\s\S]*?<h2[^>]*>([^<]*)<\/h2>[\s\S]*?<span class="bg-blue-600[^"]*">([^<]*)<\/span>[\s\S]*?<span>([\d.]+)<\/span>[\s\S]*?<span class="text-white\/70">(\d+)<\/span>[\s\S]*?<p class="text-white\/80[^"]*">([\s\S]*?)<\/p>[\s\S]*?<a href="([^"]*)"/g;
let spm;
while ((spm = spotRe.exec(body))) {
  spotlights.push({
    title: spm[6].trim(),
    bg: '/' + spm[2].replace(/^\/+/, ''),
    poster: '/' + spm[3].replace(/^\/+/, ''),
    ratingDash: parseInt(spm[4], 10),
    rating: parseFloat(spm[5]),
    type: spm[7].trim(),
    year: spm[9],
    desc: spm[10].replace(/&#0?39;/g, "'").trim(),
    watchHref: spm[11],
  });
}
writeFileSync(join(outDir, 'spotlights.json'), JSON.stringify(spotlights, null, 2));

console.log(`hero: ${hero.length} slides`);
console.log(`rows: ${rows.length} filas, ${rows.reduce((a, r) => a + r.cards.length, 0)} cards`);
console.log(`top: ${topMovies.length} películas, ${topSeries.length} series`);
console.log(`spotlights: ${spotlights.length}`);
