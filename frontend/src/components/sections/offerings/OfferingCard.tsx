import type { Offering } from "@/types/content";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

interface OfferingCardProps {
  offering: Offering;
  index: number;
  href: string;
  ctaLabel: string;
}

/**
 * Leistungskarte. Die gesamte Karte ist klickbar (Stretched Link über
 * ::after), bleibt aber semantisch ein einzelner, beschrifteter Link.
 *
 * Layout: 3 Zeilen (Kopf · Highlights · Link) als CSS Subgrid – so laufen
 * Trennlinien und Links über alle Karten einer Reihe exakt bündig, egal wie
 * lang die Beschreibungstexte sind (siehe OfferingGrid).
 */
export function OfferingCard({ offering, index, href, ctaLabel }: OfferingCardProps) {
  const { icon, title, description, highlights } = offering;

  return (
    <article className="group relative row-span-3 grid grid-rows-subgrid gap-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card transition-[translate,box-shadow,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-accent to-accent-bright transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
      />

      <div>
        <div className="flex items-start justify-between">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-accent transition-colors duration-500 ease-out-expo group-hover:bg-accent group-hover:text-primary">
            <Icon name={icon} className="size-6" />
          </div>
          <span aria-hidden="true" className="font-mono text-xs font-medium text-slate-400">
            {String(index).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-8 text-xl font-bold text-primary">{title}</h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600 hyphens-auto">{description}</p>
      </div>

      <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-6">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-2.5 text-sm text-slate-700">
            <Icon name="check" className="mt-0.5 size-4 shrink-0 text-accent-ink" strokeWidth={2.25} />
            {highlight}
          </li>
        ))}
      </ul>

      <div className="self-end pt-8">
        <SmartLink
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink after:absolute after:inset-0"
        >
          {ctaLabel}
          <span className="sr-only">: {title}</span>
          <Icon
            name="arrow-up-right"
            className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </SmartLink>
      </div>
    </article>
  );
}
