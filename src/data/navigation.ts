/** Navegación y sugerencias propias de Vertyx Vault. */

export const NAV_ITEMS = [
  { id: 'home-btn', path: '/', label: 'Inicio', icon: 'home' },
  { id: 'trending-btn', path: '/explore', label: 'Tendencias', icon: 'trending' },
  { id: 'movies-btn', path: '/explore?type=movie', label: 'Películas', icon: 'movies' },
  { id: 'tv-btn', path: '/explore?type=series', label: 'Series', icon: 'tv' },
  { id: 'library-btn', path: '/library', label: 'Mi lista', icon: 'library' },
] as const;

export type NavIconName = (typeof NAV_ITEMS)[number]['icon'];

export const SEARCH_SUGGESTIONS_TYPING = [
  'Busca una película, serie o colección',
  'Descubre historias para esta noche',
  'Explora títulos guardados en Vertyx Vault',
];

export const MOBILE_SUGGESTIONS = [
  { title: 'Acción', text: 'Explora historias de acción.' },
  { title: 'Ciencia ficción', text: 'Descubre universos de ciencia ficción.' },
  { title: 'Drama', text: 'Encuentra tu próximo drama.' },
  { title: 'Comedia', text: 'Busca una película para desconectar.' },
];
