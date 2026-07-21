import type { CSSProperties } from "react";
import { createRng, range, rangeInt } from "@/lib/seeded";
import type { GenreId } from "@/data/types";

type PosterMode = "poster" | "backdrop";

interface GenerativePosterProps {
  seed: string;
  genre: GenreId;
  mode?: PosterMode;
  className?: string;
  style?: CSSProperties;
}

/** Brand-constrained hue: deep purples or dark electric blues. */
function brandHue(rng: () => number): number {
  return rng() > 0.45 ? range(rng, 255, 285) : range(rng, 215, 235);
}

function GenreMotif({ genre, rng, w, h }: { genre: GenreId; rng: () => number; w: number; h: number }) {
  const stroke = `hsl(${brandHue(rng)} 70% 75%)`;
  const opacity = range(rng, 0.08, 0.14);

  switch (genre) {
    case "scifi": {
      // Orbital arcs
      const cx = range(rng, w * 0.2, w * 0.8);
      const cy = range(rng, h * 0.15, h * 0.5);
      return (
        <g stroke={stroke} strokeWidth={1} fill="none" opacity={opacity}>
          {Array.from({ length: 4 }, (_, i) => (
            <circle key={i} cx={cx} cy={cy} r={30 + i * range(rng, 26, 40)} />
          ))}
          <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="none" />
        </g>
      );
    }
    case "thriller": {
      // Converging diagonals
      const fx = range(rng, w * 0.3, w * 0.7);
      const fy = range(rng, h * 0.3, h * 0.7);
      return (
        <g stroke={stroke} strokeWidth={1} opacity={opacity}>
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i / 7) * Math.PI * 2 + rng();
            return (
              <line
                key={i}
                x1={fx}
                y1={fy}
                x2={fx + Math.cos(angle) * w}
                y2={fy + Math.sin(angle) * w}
              />
            );
          })}
        </g>
      );
    }
    case "drama": {
      // Soft horizon band
      const y = range(rng, h * 0.55, h * 0.75);
      return (
        <g opacity={opacity}>
          <line x1={0} y1={y} x2={w} y2={y} stroke={stroke} strokeWidth={1.5} />
          <line x1={0} y1={y + 10} x2={w} y2={y + 10} stroke={stroke} strokeWidth={0.5} />
          <circle cx={range(rng, w * 0.2, w * 0.8)} cy={y - range(rng, 24, 60)} r={range(rng, 12, 26)} fill={stroke} opacity={0.5} />
        </g>
      );
    }
    case "documentary": {
      // Dot grid
      const cols = rangeInt(rng, 6, 9);
      const rows = rangeInt(rng, 8, 12);
      const ox = range(rng, 10, 40);
      const oy = range(rng, 10, 60);
      return (
        <g fill={stroke} opacity={opacity}>
          {Array.from({ length: cols * rows }, (_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            return (
              <circle
                key={i}
                cx={ox + (c * (w - ox * 2)) / (cols - 1)}
                cy={oy + (r * (h - oy * 2)) / (rows - 1)}
                r={1.4}
              />
            );
          })}
        </g>
      );
    }
    case "animation": {
      // Rounded blobs
      return (
        <g fill={stroke} opacity={opacity}>
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse
              key={i}
              cx={range(rng, 0, w)}
              cy={range(rng, 0, h)}
              rx={range(rng, 20, 70)}
              ry={range(rng, 16, 54)}
            />
          ))}
        </g>
      );
    }
    case "noir": {
      // Venetian-blind bars of light
      const count = rangeInt(rng, 5, 8);
      const tilt = range(rng, -8, 8);
      return (
        <g fill={stroke} opacity={opacity} transform={`rotate(${tilt} ${w / 2} ${h / 2})`}>
          {Array.from({ length: count }, (_, i) => (
            <rect key={i} x={-w * 0.2} y={(i * h) / count} width={w * 1.4} height={range(rng, 3, 7)} />
          ))}
        </g>
      );
    }
  }
}

/**
 * Deterministic generative key art. Same seed → same artwork on server and
 * client. Two radial brand-hue gradients over graphite, a genre motif layer,
 * film grain and a vignette. No network requests.
 */
export function GenerativePoster({
  seed,
  genre,
  mode = "poster",
  className,
  style,
}: GenerativePosterProps) {
  const rng = createRng(seed + mode);
  const w = mode === "poster" ? 300 : 640;
  const h = mode === "poster" ? 450 : 360;

  const hueA = brandHue(rng);
  const hueB = brandHue(rng);
  const gx1 = range(rng, 0.1, 0.9);
  const gy1 = range(rng, 0.05, 0.6);
  const gx2 = range(rng, 0.1, 0.9);
  const gy2 = range(rng, 0.4, 0.95);
  const uid = `vv-${seed.replace(/[^a-zA-Z0-9-]/g, "")}-${mode}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      style={style}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`${uid}-a`} cx={gx1} cy={gy1} r="0.9">
          <stop offset="0%" stopColor={`hsl(${hueA} 55% 26%)`} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id={`${uid}-b`} cx={gx2} cy={gy2} r="0.85">
          <stop offset="0%" stopColor={`hsl(${hueB} 60% 20%)`} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id={`${uid}-vig`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgb(0 0 0 / 0.55)" />
        </radialGradient>
        {mode === "backdrop" && (
          <linearGradient id={`${uid}-wash`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(5 4 8 / 0.85)" />
            <stop offset="55%" stopColor="rgb(5 4 8 / 0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        )}
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.05" />
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>

      <rect width={w} height={h} fill="#12111c" />
      <rect width={w} height={h} fill={`url(#${uid}-a)`} />
      <rect width={w} height={h} fill={`url(#${uid}-b)`} />
      <GenreMotif genre={genre} rng={rng} w={w} h={h} />
      <rect width={w} height={h} fill={`url(#${uid}-vig)`} />
      {mode === "backdrop" && <rect width={w} height={h} fill={`url(#${uid}-wash)`} />}
      <rect width={w} height={h} filter={`url(#${uid}-grain)`} opacity={0.6} fill="transparent" />
    </svg>
  );
}
