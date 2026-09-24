import type { Faq, ServiceArea } from "@/types/content";
import { company } from "@/content/company";
import { serviceHref, services } from "@/content/services";

/**
 * Schema.org-Daten für Rich Results (Knowledge Panel, Sitelinks, FAQ).
 * Gespeist aus denselben Content-Quellen wie die sichtbare Seite.
 *
 * Bewusst KEIN AggregateRating: Google ignoriert selbst veröffentlichte
 * Bewertungs-Markups für das eigene Unternehmen (Self-serving Reviews).
 */
const organizationId = `${company.siteUrl}/#organization`;

export function organizationJsonLd() {
  const { address, contact } = company;

  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "@id": organizationId,
    name: company.legalName,
    alternateName: company.name,
    url: company.siteUrl,
    logo: `${company.siteUrl}/icon.svg`,
    description: company.description,
    foundingDate: String(company.foundingYear),
    email: contact.email,
    telephone: contact.phoneHref.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressCountry: address.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: contact.phoneHref.replace("tel:", ""),
      email: contact.quoteEmail,
      availableLanguage: ["de", "en"],
    },
    sameAs: company.social.map((social) => social.href),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Leistungen",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.teaser,
          url: `${company.siteUrl}${serviceHref(service.slug)}`,
        },
      })),
    },
  };
}

export function serviceJsonLd(service: ServiceArea) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.seo.description,
    url: `${company.siteUrl}${serviceHref(service.slug)}`,
    provider: { "@id": organizationId, "@type": "MovingCompany", name: company.legalName },
    areaServed: { "@type": "Country", name: company.address.country },
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Serialisiert JSON-LD sicher für <script> (verhindert </script>-Injection). */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
