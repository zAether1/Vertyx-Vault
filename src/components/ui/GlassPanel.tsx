import type { HTMLAttributes, ReactNode } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassPanel({ children, className, ...rest }: GlassPanelProps) {
  return (
    <div className={`glass rounded-panel ${className ?? ""}`} {...rest}>
      {children}
    </div>
  );
}
