"use client";

import { forwardRef, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type ButtonVariant = "primary" | "ghost" | "glass";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill font-medium select-none " +
  "transition-[background-color,box-shadow,color,transform] duration-[var(--duration-fast)] " +
  "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40 cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-ink hover:bg-primary-500 shadow-glow-purple hover:shadow-glow-blue",
  ghost:
    "bg-transparent text-ink-dim hover:text-ink hover:bg-graphite-800 border border-graphite-700 hover:border-graphite-600",
  glass: "glass text-ink hover:bg-graphite-800/80",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-5 text-caption",
  lg: "h-12 px-7 text-body",
};

/** Pill button with a GSAP ripple emanating from the click point. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", size = "md", className, onPointerDown, children, ...rest }, ref) {
    const localRef = useRef<HTMLButtonElement | null>(null);

    const setRefs = (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e);
      const el = localRef.current;
      if (!el || prefersReducedMotion()) return;
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      const d = Math.max(rect.width, rect.height) * 2;
      Object.assign(ripple.style, {
        position: "absolute",
        left: `${e.clientX - rect.left - d / 2}px`,
        top: `${e.clientY - rect.top - d / 2}px`,
        width: `${d}px`,
        height: `${d}px`,
        borderRadius: "50%",
        background: "rgb(255 255 255 / 0.18)",
        pointerEvents: "none",
      });
      el.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.6,
          ease: "vv-out-quart",
          onComplete: () => ripple.remove(),
        },
      );
    };

    return (
      <button
        ref={setRefs}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
        onPointerDown={handlePointerDown}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
