/**
 * Deterministic seeded randomness — stable across SSR and client renders.
 * FNV-1a string hash feeding a mulberry32 PRNG.
 */

export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string): () => number {
  return mulberry32(fnv1a(seed));
}

/** Random float in [min, max) */
export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Random integer in [min, max] */
export function rangeInt(rng: () => number, min: number, max: number): number {
  return Math.floor(range(rng, min, max + 1));
}

/** Pick one element deterministically */
export function pick<T>(rng: () => number, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error("pick: empty array");
  return item;
}
