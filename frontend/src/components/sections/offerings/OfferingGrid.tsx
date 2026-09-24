import type { Offering } from "@/types/content";
import { cn } from "@/lib/cn";
import { OfferingCard } from "./OfferingCard";

interface OfferingGridProps {
  items: Array<Offering & { href: string }>;
  ctaLabel: string;
  columns?: 3 | 4;
  className?: string;
}

/**
 * Raster aus Leistungskarten. Jede Karte belegt 3 Grid-Zeilen (Subgrid);
 * kein Row-Gap, damit die Karteninnenabstände exakt bleiben – Abstand
 * zwischen Kartenreihen via mb-6.
 */
export function OfferingGrid({ items, ctaLabel, columns = 4, className }: OfferingGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-6 md:grid-cols-2",
        columns === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={item.title} data-reveal className="row-span-3 mb-6 grid grid-rows-subgrid">
          <OfferingCard offering={item} index={index + 1} href={item.href} ctaLabel={ctaLabel} />
        </li>
      ))}
    </ul>
  );
}
