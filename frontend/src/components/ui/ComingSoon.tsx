import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Platzhalter mit Tooltip („In Kürze verfügbar") für Angebote, die es noch nicht gibt –
 * per Maus, Tastatur und Antippen (Handy) erreichbar, ohne JavaScript. Kein Link, damit niemand auf
 * einer leeren oder fremden Seite landet.
 */
export function ComingSoon({
  id,
  label,
  tooltip,
  className,
  children,
}: {
  /** Eindeutige ID für aria-describedby. */
  id: string;
  /** Zugänglicher Name, z. B. „LinkedIn". */
  label: string;
  tooltip: string;
  className?: string;
  children: ReactNode;
}) {
  const tooltipId = `coming-soon-${id}`;
  return (
    <span tabIndex={0} role="img" aria-label={label} aria-describedby={tooltipId} className={cn("group/soon relative inline-flex cursor-default outline-offset-4", className)}>
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2.5 -translate-x-1/2 translate-y-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary opacity-0 shadow-elevated ring-1 ring-primary/10 transition-[opacity,transform] duration-200 group-hover/soon:translate-y-0 group-hover/soon:opacity-100 group-focus/soon:translate-y-0 group-focus/soon:opacity-100"
      >
        {tooltip}
        <span aria-hidden="true" className="absolute top-full left-1/2 -mt-1 size-2 -translate-x-1/2 rotate-45 bg-white" />
      </span>
    </span>
  );
}
