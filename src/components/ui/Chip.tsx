import type { ReactNode } from "react";

export function Chip({
  children,
  active = false,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-3 py-1 text-micro font-mono uppercase tracking-[0.08em] transition-colors duration-[var(--duration-fast)] ${
        active
          ? "border-primary-500/50 bg-primary-900/40 text-primary-300"
          : "border-graphite-700 bg-graphite-900/60 text-ink-faint"
      } ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
