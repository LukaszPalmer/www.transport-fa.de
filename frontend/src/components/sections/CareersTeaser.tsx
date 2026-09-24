import { careerAreas } from "@/content/careers";
import { careersTeaser } from "@/content/home";
import { routes, sectionIds } from "@/content/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";

/** Recruiting-Teaser für alle Unternehmensbereiche – verlinkt auf /karriere. */
export function CareersTeaser() {
  return (
    <section id={sectionIds.careers} aria-labelledby="careers-title" className="defer-render bg-white pb-24 lg:pb-32">
      <Container>
        <div className="flex flex-col gap-10 rounded-3xl border border-slate-200/80 bg-surface p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:p-16">
          <div className="max-w-2xl">
            <Eyebrow>{careersTeaser.eyebrow}</Eyebrow>
            <h2 id="careers-title" className="mt-4 text-3xl font-bold leading-tight text-primary sm:text-4xl">
              {careersTeaser.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{careersTeaser.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {careerAreas.map((area) => (
                <li
                  key={area.id}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700"
                >
                  <Icon name={area.icon} className="size-4 text-accent-ink" />
                  {area.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink href={careersTeaser.cta.href} variant="dark" size="lg" withArrow>
              {careersTeaser.cta.label}
            </ButtonLink>
            <ButtonLink href={routes.application} variant="outline" size="lg">
              Initiativ bewerben
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
