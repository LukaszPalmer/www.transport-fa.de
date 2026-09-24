import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, serviceContactHref, serviceHref, services } from "@/content/services";
import { ContactCta } from "@/components/sections/ContactCta";
import { FaqSection } from "@/components/sections/FaqSection";
import { HeroFactsCard } from "@/components/sections/hero/HeroFactsCard";
import { PageHero } from "@/components/sections/hero/PageHero";
import { OfferingGrid } from "@/components/sections/offerings/OfferingGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { ReviewsSection } from "@/components/sections/reviews/ReviewsSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { TrackingAppSection } from "@/components/sections/app/TrackingAppSection";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqJsonLd, serviceJsonLd } from "@/lib/structured-data";

/** Alle Leistungsseiten werden zur Build-Zeit statisch erzeugt; unbekannte Slugs → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/leistungen/[slug]">): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: service.seo.title,
    description: service.seo.description,
    alternates: { canonical: serviceHref(service.slug) },
    openGraph: { title: service.seo.title, description: service.seo.description, images: [service.hero.media.poster] },
  };
}

/** Template aller Leistungsseiten – Inhalte kommen vollständig aus src/content/services.ts. */
export default async function ServicePage({ params }: PageProps<"/leistungen/[slug]">) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const contactHref = serviceContactHref(service.slug);
  const { hero } = service;

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      <JsonLd data={faqJsonLd(service.faqs)} />

      <PageHero
        size="large"
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        headlineAccent={hero.headlineAccent}
        subheadline={hero.subheadline}
        media={hero.media}
        primaryCta={{ label: "Kostenloses Angebot anfordern", href: contactHref }}
        secondaryCta={{ label: "Leistungsumfang ansehen", href: "#leistungsumfang" }}
        aside={
          <HeroFactsCard
            title={hero.factsTitle}
            facts={hero.facts}
            cta={{ label: "Besichtigung vereinbaren", href: contactHref }}
          />
        }
      />

      <StatsBar stats={service.stats} label={`${service.name} in Zahlen`} />

      <section id="leistungsumfang" aria-labelledby="scope-title" className="bg-surface py-24 lg:py-32">
        <Container>
          <SectionHeading
            id="scope-title"
            eyebrow={service.scope.eyebrow}
            title={service.scope.title}
            description={service.scope.description}
          />
          <OfferingGrid
            className="mt-16"
            columns={service.scope.items.length % 3 === 0 ? 3 : 4}
            ctaLabel="Angebot anfragen"
            items={service.scope.items.map((item) => ({ ...item, href: contactHref }))}
          />
        </Container>
      </section>

      <ProcessSteps
        title={service.processTitle}
        description="Klar strukturiert, verbindlich abgestimmt – Sie wissen jederzeit, was als Nächstes passiert."
        steps={service.process}
      />

      {service.showTrackingApp && <TrackingAppSection />}

      <ReviewsSection service={service.slug} />

      <FaqSection faqs={service.faqs} title={`Häufige Fragen: ${service.name}`} contactHref={contactHref} />

      <RelatedServices current={service.slug} />

      <ContactCta
        title="Kostenloses Angebot in Kürze."
        description="Schildern Sie uns Ihr Vorhaben – wir melden uns schnell mit einem transparenten, verbindlichen Angebot."
        primaryCta={{ label: "Angebot anfordern", href: contactHref }}
      />
    </>
  );
}
