import type { Faq, ServiceArea } from "@/types/content";
import { blogHref, type BlogPost } from "@/content/blog";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
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
    // Nur echte Profile – Platzhalter („folgt demnächst") gehören nicht in die Suchmaschinen-Daten.
    sameAs: company.social.flatMap((social) => (social.href ? [social.href] : [])),
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
/** Blog-Übersicht mit allen veröffentlichten Beiträgen. */
export function blogJsonLd(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${company.name} – Blog & Ratgeber`,
    url: `${company.siteUrl}${routes.blog}`,
    inLanguage: "de-DE",
    publisher: { "@id": organizationId },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${company.siteUrl}${blogHref(post.slug)}`,
      datePublished: post.publishedAt,
    })),
  };
}

/** Einzelner Beitrag inkl. Brotkrumen (Startseite › Blog › Beitrag). */
export function blogPostingJsonLd(post: BlogPost) {
  const url = `${company.siteUrl}${blogHref(post.slug)}`;
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
        inLanguage: "de-DE",
        mainEntityOfPage: url,
        author: { "@type": "Person", name: post.author.name, jobTitle: post.author.role },
        publisher: { "@id": organizationId },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: company.siteUrl },
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
