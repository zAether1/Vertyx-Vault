"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  size?: "sm" | "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, children, size = "md", className, ...rest }, ref) {
    const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={`inline-flex ${dim} shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-dim transition-colors duration-[var(--duration-fast)] hover:bg-graphite-800 hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${className ?? ""}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
