import type { Faq, ServiceArea } from "@/types/content";
import { blogHref, getCategory, type BlogPost } from "@/content/blog";
import { COMPANY } from "@fa/shared";
import { company } from "@/content/company";
import { intlLocale, type Locale } from "@/i18n/config";
import { reviewPlatforms } from "@/content/reviews";
import { routes } from "@/content/navigation";
import { getService, getServices, serviceHref } from "@/content/services";

/**
 * Schema.org-Daten für Rich Results (Knowledge Panel, Sitelinks, FAQ).
 * Gespeist aus denselben Content-Quellen wie die sichtbare Seite.
 *
 * Bewusst KEIN AggregateRating: Google ignoriert selbst veröffentlichte
 * Bewertungs-Markups für das eigene Unternehmen (Self-serving Reviews).
 */
const organizationId = `${company.siteUrl}/#organization`;

/** Düsseldorf und Umgebung, dazu deutschlandweite Transporte. */
function areaServed(locale: Locale) {
  return [
    ...company.serviceArea.map((city) => ({ "@type": "City", name: city })),
    { "@type": "Country", name: locale === "en" ? "Germany" : company.address.country },
  ];
}

export function organizationJsonLd(locale: Locale = "de") {
  const { address, contact } = company;

  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "@id": organizationId,
    name: company.legalName,
    alternateName: company.name,
    url: company.siteUrl,
    logo: `${company.siteUrl}/icon.svg`,
    image: `${company.siteUrl}/opengraph-image`,
    description: company.descriptions[locale],
    email: contact.email,
    telephone: contact.phoneHref.replace("tel:", ""),
    vatID: COMPANY.register.vatId.replace(/\s/g, ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressCountry: address.countryCode,
    },
    geo: { "@type": "GeoCoordinates", latitude: address.geo.latitude, longitude: address.geo.longitude },
    areaServed: areaServed(locale),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: company.openingHours.days,
      opens: company.openingHours.opens,
      closes: company.openingHours.closes,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: contact.phoneHref.replace("tel:", ""),
      email: contact.quoteEmail,
      availableLanguage: ["de", "en"],
    },
    // Nur echte Profile – Platzhalter („folgt demnächst") gehören nicht in die Suchmaschinen-Daten.
    sameAs: [
      ...company.social.flatMap((social) => (social.href ? [social.href] : [])),
      ...Object.values(reviewPlatforms).flatMap((platform) => (platform.available ? [platform.profileUrl.split("?")[0]!] : [])),
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "en" ? "Services" : "Leistungen",
      itemListElement: getServices(locale).map((service) => ({
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

export function serviceJsonLd(service: ServiceArea, locale: Locale = "de") {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.seo.description,
    url: `${company.siteUrl}${serviceHref(service.slug)}`,
    provider: { "@id": organizationId, "@type": "MovingCompany", name: company.legalName },
    areaServed: areaServed(locale),
    inLanguage: intlLocale(locale),
  };
}

/** FAQPage-Knoten ohne @context – so auch in einem @graph verwendbar. */
function faqPageNode(faqs: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return { "@context": "https://schema.org", ...faqPageNode(faqs) };
}

/** Serialisiert JSON-LD sicher für <script> (verhindert </script>-Injection). */
/** Blog-Übersicht mit allen veröffentlichten Beiträgen. */
export function blogJsonLd(posts: BlogPost[], locale: Locale = "de") {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: locale === "en" ? `${company.name} – Blog & guides` : `${company.name} – Blog & Ratgeber`,
    url: `${company.siteUrl}${routes.blog}`,
    inLanguage: intlLocale(locale),
    publisher: { "@id": organizationId },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${company.siteUrl}${blogHref(post.slug)}`,
      datePublished: post.publishedAt,
    })),
  };
}

/** Einzelner Beitrag inkl. Brotkrumen (Startseite › Blog › Beitrag) und – falls vorhanden – FAQ. */
export function blogPostingJsonLd(post: BlogPost, locale: Locale = "de") {
  const url = `${company.siteUrl}${blogHref(post.slug)}`;
  const category = getCategory(post.category, locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: `${company.siteUrl}${post.cover.src}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: intlLocale(locale),
        mainEntityOfPage: url,
        articleSection: category?.name,
        keywords: post.keywords.join(", "),
        // Themenbezug zur Leistungsseite – hilft Suchmaschinen, Beitrag und Angebot zu verknüpfen.
        about: category ? { "@type": "Service", name: getService(category.service, locale)?.name, url: `${company.siteUrl}${serviceHref(category.service)}` } : undefined,
        author: post.author.team
          ? { "@type": "Organization", name: company.legalName, url: company.siteUrl }
          : { "@type": "Person", name: post.author.name, jobTitle: post.author.role },
        publisher: { "@id": organizationId },
      },
      ...(post.faqs?.length ? [faqPageNode(post.faqs)] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "Startseite", item: company.siteUrl },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${company.siteUrl}${routes.blog}` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
