import { sectionIds } from "@/content/navigation";
import { servicesSection } from "@/content/home";
import { serviceHref, services } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { OfferingGrid } from "@/components/sections/offerings/OfferingGrid";

/** Startseite: Übersicht der Leistungsbereiche mit Links auf die Detailseiten. */
export function ServicesSection() {
  const items = services.map((service) => ({
    icon: service.icon,
    title: service.name,
    description: service.teaser,
    highlights: service.highlights,
    href: serviceHref(service.slug),
  }));

  return (
    <section id={sectionIds.services} aria-labelledby="services-title" className="defer-render bg-surface py-24 lg:py-32">
      <Container>
        <SectionHeading
          id="services-title"
          eyebrow={servicesSection.eyebrow}
          title={servicesSection.title}
          description={servicesSection.description}
        />

        <OfferingGrid items={items} ctaLabel="Mehr erfahren" className="mt-16" />

        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-slate-600">
          {servicesSection.footnote}
          <SmartLink
            href={servicesSection.footnoteCta.href}
            className="group inline-flex items-center gap-1 font-semibold text-accent-ink underline-offset-4 hover:underline"
          >
            {servicesSection.footnoteCta.label}
            <Icon name="arrow-right" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </SmartLink>
        </p>
      </Container>
    </section>
  );
}
