import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EyebrowProps {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}

/** Kleine Kategorie-Zeile über Überschriften, mit Akzent-Linie. */
export function Eyebrow({ children, tone = "light", className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]",
        tone === "dark" ? "text-accent" : "text-accent-ink",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}
