"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "glass";
type Size = "md" | "lg";

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill font-medium select-none " +
  "transition-[background-color,box-shadow,color,transform] duration-[var(--duration-fast)] " +
  "active:scale-[0.985] cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-ink hover:bg-primary-500 shadow-glow-purple hover:shadow-glow-blue",
  ghost:
    "bg-transparent text-ink-dim hover:text-ink hover:bg-graphite-800 border border-graphite-700 hover:border-graphite-600",
  glass: "glass text-ink hover:bg-graphite-800/80",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-5 text-caption",
  lg: "h-12 px-7 text-body",
};

/** Link styled as a Button — valid markup for navigation actions. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
