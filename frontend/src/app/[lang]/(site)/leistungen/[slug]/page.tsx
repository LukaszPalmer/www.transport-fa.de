import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, serviceContactHref, serviceHref, services } from "@/content/services";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
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

const messages = defineMessages({
  de: {
    quote: "Kostenloses Angebot anfordern",
    scope: "Leistungsumfang ansehen",
    survey: "Besichtigung vereinbaren",
    inNumbers: (name: string) => `${name} in Zahlen`,
    request: "Angebot anfragen",
    process: "Klar strukturiert, verbindlich abgestimmt – Sie wissen jederzeit, was als Nächstes passiert.",
    faq: (name: string) => `Häufige Fragen: ${name}`,
    ctaTitle: "Kostenloses Angebot in Kürze.",
    ctaText: "Schildern Sie uns Ihr Vorhaben – wir melden uns schnell mit einem transparenten, verbindlichen Angebot.",
    ctaButton: "Angebot anfordern",
  },
  en: {
    quote: "Request a free quote",
    scope: "See what's included",
    survey: "Arrange a survey",
    inNumbers: (name: string) => `${name} in figures`,
    request: "Request a quote",
    process: "Clearly structured, bindingly agreed – you always know what happens next.",
    faq: (name: string) => `Frequently asked questions: ${name}`,
    ctaTitle: "A free quote, fast.",
    ctaText: "Tell us about your project – we'll get back to you quickly with a transparent, binding quote.",
    ctaButton: "Request a quote",
  },
});

/** Alle Leistungsseiten werden zur Build-Zeit statisch erzeugt; unbekannte Slugs → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/leistungen/[slug]">): Promise<Metadata> {
  const service = getService((await params).slug, await getLocale());
  if (!service) return {};
  return {
    title: service.seo.title,
    description: service.seo.description,
    alternates: { canonical: serviceHref(service.slug) },
    openGraph: { title: service.seo.title, description: service.seo.description, images: [service.hero.media.poster] },
  };
}

/** Template aller Leistungsseiten – Inhalte kommen vollständig aus src/content/services.ts. */
export default async function ServicePage({ params }: PageProps<"/[lang]/leistungen/[slug]">) {
  const locale = await getLocale();
  const t = messages[locale];
  const service = getService((await params).slug, locale);
  if (!service) notFound();

  const contactHref = serviceContactHref(service.slug);
  const { hero } = service;

  return (
    <>
      <JsonLd data={serviceJsonLd(service, locale)} />
      <JsonLd data={faqJsonLd(service.faqs)} />

      <PageHero
        size="large"
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        headlineAccent={hero.headlineAccent}
        subheadline={hero.subheadline}
        media={hero.media}
        primaryCta={{ label: t.quote, href: contactHref }}
        secondaryCta={{ label: t.scope, href: "#leistungsumfang" }}
        aside={
          <HeroFactsCard
            title={hero.factsTitle}
            facts={hero.facts}
            cta={{ label: t.survey, href: contactHref }}
          />
        }
      />

      <StatsBar stats={service.stats} label={t.inNumbers(service.name)} />

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
            ctaLabel={t.request}
            items={service.scope.items.map((item) => ({ ...item, href: contactHref }))}
          />
        </Container>
      </section>

      <ProcessSteps
        title={service.processTitle}
        description={t.process}
        steps={service.process}
      />

      {service.showTrackingApp && <TrackingAppSection />}

      <ReviewsSection service={service.slug} />

      <FaqSection faqs={service.faqs} title={t.faq(service.name)} contactHref={contactHref} />

      <RelatedServices current={service.slug} />

      <ContactCta
        title={t.ctaTitle}
        description={t.ctaText}
        primaryCta={{ label: t.ctaButton, href: contactHref }}
      />
    </>
  );
}
