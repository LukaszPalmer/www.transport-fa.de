import type { Stat } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { StatList } from "@/components/ui/StatList";

/** Kennzahlen-Leiste – überlappt den Hero und schafft sofort Vertrauen. */
export function StatsBar({ stats, label = "Kennzahlen" }: { stats: Stat[]; label?: string }) {
  // Wortwerte („Festpreis“) brauchen eine kleinere Stufe als Zahlen („99,8 %“).
  const hasWordValues = stats.some((stat) => stat.value.length > 7);

  return (
    <section aria-label={label} className="relative z-10 -mt-24 md:-mt-28">
      <Container>
        <StatList
          stats={stats}
          // gap-px auf farbigem Grid-Hintergrund erzeugt die Trennlinien
          className="grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200/80 shadow-elevated ring-1 ring-primary/5 lg:grid-cols-4"
          itemClassName="bg-white p-6 sm:p-8"
          valueClassName={
            hasWordValues
              ? "text-xl text-primary break-words sm:text-3xl xl:text-4xl"
              : "text-3xl text-primary sm:text-4xl xl:text-5xl"
          }
          labelClassName="mt-2 text-sm font-semibold text-primary sm:text-base"
          detailClassName="text-slate-500"
          accent
        />
      </Container>
    </section>
  );
}
