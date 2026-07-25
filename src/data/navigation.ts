/** Datos de navegación y búsqueda del template original. */

export const NAV_ITEMS = [
  { id: 'home-btn', path: '/', label: 'Inicio', icon: 'home' },
  { id: 'trending-btn', path: '/trending', label: 'Tendencias', icon: 'trending' },
  { id: 'movies-btn', path: '/movies', label: 'Películas', icon: 'movies' },
  { id: 'tv-btn', path: '/tv', label: 'Series', icon: 'tv' },
] as const;

export type NavIconName = (typeof NAV_ITEMS)[number]['icon'];

/** Endpoint AJAX de búsqueda del template original. */
export const AJAX_URL = 'https://cinehax.com/wp-admin/admin-ajax.php';

export const SEARCH_SUGGESTIONS_TYPING = [
  "Prueba con 'Inception' para acción que te hará pensar",
  "Prueba 'Stranger Things' - La mejor ciencia ficción de terror",
  "¿Buscas anime? Busca 'Death Note'",
  "Mira 'Breaking Bad' - Crimen y drama",
  "Explora 'Demon Slayer' - Recomendado top de anime",
  "Busca 'Interstellar' - Thriller de espacio y tiempo",
  "¿Buscas drama coreano? Prueba 'Squid Game'",
];

export const MOBILE_SUGGESTIONS = [
  { title: 'Death Note', text: "¿Buscas anime? Busca 'Death Note'." },
  { title: 'Inception', text: "Prueba 'Inception' para disfrutar de una acción alucinante" },
  { title: 'Breaking Bad', text: "Ver 'Breaking Bad' - Crimen y drama" },
  { title: 'Squid Game', text: "¿Buscas un drama coreano? Prueba 'El Juego del Calamar'" },
  { title: 'The Office', text: "¿Buscas comedia? Prueba 'The Office'" },
];
