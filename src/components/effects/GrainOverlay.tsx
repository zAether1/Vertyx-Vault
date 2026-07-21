/** Fixed film-grain overlay — one SVG turbulence texture at very low opacity. */
export function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] h-full w-full opacity-[0.035] mix-blend-overlay"
    >
      <filter id="vv-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#vv-grain)" />
    </svg>
  );
}
