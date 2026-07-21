import type { Genre, GenreId } from "./types";

export const genres: Genre[] = [
  { id: "scifi", label: { en: "Sci-Fi", es: "Ciencia ficción" } },
  { id: "thriller", label: { en: "Thriller", es: "Thriller" } },
  { id: "drama", label: { en: "Drama", es: "Drama" } },
  { id: "documentary", label: { en: "Documentary", es: "Documental" } },
  { id: "animation", label: { en: "Animation", es: "Animación" } },
  { id: "noir", label: { en: "Noir", es: "Noir" } },
];

export const genreById: Record<GenreId, Genre> = Object.fromEntries(
  genres.map((g) => [g.id, g]),
) as Record<GenreId, Genre>;
