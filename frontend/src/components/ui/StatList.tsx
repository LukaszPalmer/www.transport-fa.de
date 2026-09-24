import type { Stat } from "@/types/content";
import { cn } from "@/lib/cn";

interface StatListProps {
  stats: Stat[];
  /** Grid-Layout (Spalten, Abstände, Hintergrund) – bewusst vom Aufrufer gesteuert. */
  className?: string;
  itemClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
  detailClassName?: string;
  /** Kurze Akzent-Linie über jedem Wert. */
  accent?: boolean;
}

/**
 * Semantische Kennzahlen-Liste (<dl>): Screenreader lesen „Label: Wert“,
 * visuell steht der Wert oben (CSS order).
 */
export function StatList({
  stats,
  className,
  itemClassName,
  valueClassName,
  labelClassName,
  detailClassName,
  accent,
}: StatListProps) {
  return (
    <dl className={cn("grid", className)}>
      {stats.map((stat) => (
        <div key={stat.label} className={cn("flex flex-col", itemClassName)}>
          <dt className={cn("order-2", labelClassName)}>{stat.label}</dt>
          <dd
            className={cn(
              "order-1 font-display font-extrabold tracking-tight tabular-nums",
              accent &&
                "before:mb-4 before:block before:h-1 before:w-8 before:rounded-full before:bg-accent",
              valueClassName,
            )}
          >
            {stat.value}
          </dd>
          {stat.detail && (
            <dd className={cn("order-3 mt-1 text-sm", detailClassName)}>{stat.detail}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
