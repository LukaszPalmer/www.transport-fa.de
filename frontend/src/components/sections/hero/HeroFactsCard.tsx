import type { CtaLink } from "@/types/content";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

interface HeroFactsCardProps {
  title: string;
  facts: string[];
  cta: CtaLink;
}

/** Glass-Karte im Hero der Unterseiten: Leistungsversprechen als Checkliste. */
export function HeroFactsCard({ title, facts, cta }: HeroFactsCardProps) {
  return (
    <div className="glass-dark w-full max-w-sm rounded-2xl p-6 text-white shadow-elevated">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent">{title}</p>
      <ul className="mt-5 space-y-3.5">
        {facts.map((fact) => (
          <li key={fact} className="flex items-start gap-3 text-sm leading-snug text-slate-200">
            <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
              <Icon name="check" className="size-3" strokeWidth={3} />
            </span>
            {fact}
          </li>
        ))}
      </ul>
      <SmartLink
        href={cta.href}
        className="group mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm font-semibold text-white transition-colors hover:text-accent"
      >
        {cta.label}
        <Icon
          name="arrow-right"
          className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
        />
      </SmartLink>
    </div>
  );
}
