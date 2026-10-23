import { COMPANY, hasRegisterEntry, ownerTitle } from "@fa/shared";
import type { Faq, ServiceArea } from "@/types/content";
import { blogHref, getCategory, type BlogPost } from "@/content/blog";
import { company } from "@/content/company";
import { creditFor } from "@/content/image-credits";
import { routes } from "@/content/navigation";
import { googlePlaceId, reviewPlatforms } from "@/content/reviews";
import { getService, getServices, serviceHref } from "@/content/services";
import { intlLocale, LOCALES, type Locale } from "@/i18n/config";
import { faqAnchor } from "@/lib/anchors";
import { absoluteUrl, type SeoImage } from "@/lib/seo";

/**
 * Schema.org-Daten (JSON-LD) als verknüpfter Graph: Jede Entität hat eine feste @id, Seiten verweisen
 * darauf, statt sie zu wiederholen. Das Website-Layout liefert Unternehmen, Logo, Geschäftsführung und
 * Website auf jeder Seite (siteJsonLd); jede Seite ergänzt ihre eigenen Knoten (WebPage, Brotkrumen,
 * Service, Artikel, FAQ). Google und KI-Suchen führen Knoten mit gleicher @id zusammen.
 * Gespeist aus denselben Content-Quellen wie die sichtbare Seite – Markup und Inhalt bleiben deckungsgleich.
 *
 * Bewusst KEIN AggregateRating/Review: Google ignoriert selbst veröffentlichte Bewertungs-Markups für das
 * eigene Unternehmen (Self-serving Reviews). Die Bewertungen gehören ins Google-Unternehmensprofil.
 */

const site = company.siteUrl;

const ids = {
  organization: `${site}/#organization`,
  website: `${site}/#website`,
  logo: `${site}/#logo`,
  managingDirector: `${site}/#geschaeftsfuehrung`,
};

const wikidataUrl = (name: string) => (company.wikidata[name] ? `https://www.wikidata.org/wiki/${company.wikidata[name]}` : undefined);

/** Düsseldorf und Umgebung, dazu deutschlandweite Transporte – jeweils mit Wikidata-Verknüpfung. */
function areaServed(locale: Locale) {
  return [
    ...company.serviceArea.map((city) => ({ "@type": "City", name: city, sameAs: wikidataUrl(city) })),
    { "@type": "Country", name: locale === "en" ? "Germany" : company.address.country, sameAs: wikidataUrl("Deutschland") },
  ];
}

// --- Unternehmen & Website (jede Seite) ---------------------------------------------------

function organizationNode(locale: Locale) {
  const { address, contact } = company;
  const telephone = contact.phoneHref.replace("tel:", "");
  const services = getServices(locale);

  return {
    // MovingCompany ⊂ LocalBusiness ⊂ Organization – passend für Umzüge, Räumungen und Transporte.
    "@type": "MovingCompany",
    "@id": ids.organization,
    name: company.legalName,
    alternateName: company.name,
    legalName: company.legalName,
    url: site,
    logo: { "@id": ids.logo },
    image: { "@id": ids.logo },
    description: company.descriptions[locale],
    email: contact.email,
    telephone,
    vatID: COMPANY.register.vatId.replace(/\s/g, ""),
    ...(hasRegisterEntry() && {
      identifier: { "@type": "PropertyValue", propertyID: "Handelsregister", value: `${COMPANY.register.court}, ${COMPANY.register.number}` },
    }),
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressRegion: "NW",
      addressCountry: address.countryCode,
    },
    geo: { "@type": "GeoCoordinates", latitude: address.geo.latitude, longitude: address.geo.longitude },
    ...(googlePlaceId && { hasMap: reviewPlatforms.google.profileUrl }),
    areaServed: areaServed(locale),
    // Fachgebiete = die Leistungen und Leistungsbausteine, die auf der Website beschrieben sind.
    knowsAbout: services.flatMap((service) => [service.name, ...service.scope.items.map((item) => item.title)]),
    knowsLanguage: ["de", "en"],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: company.openingHours.days,
      opens: company.openingHours.opens,
      closes: company.openingHours.closes,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone,
      email: contact.quoteEmail,
      availableLanguage: ["German", "English"],
      areaServed: address.countryCode,
    },
    employee: { "@id": ids.managingDirector },
    // Nur echte Profile – Platzhalter („folgt demnächst") gehören nicht in die Suchmaschinen-Daten.
    sameAs: [
      ...company.social.flatMap((social) => (social.href ? [social.href] : [])),
      ...Object.values(reviewPlatforms).flatMap((platform) => (platform.available && googlePlaceId ? [platform.profileUrl] : [])),
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "en" ? "Services" : "Leistungen",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@id": `${absoluteUrl(serviceHref(service.slug), locale)}#service`, "@type": "Service", name: service.name },
      })),
    },
  };
}

/** Unternehmen, Logo, Geschäftsführung und Website – vom Website-Layout auf jeder Seite ausgeliefert. */
export function siteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      {
        "@type": "ImageObject",
        "@id": ids.logo,
        url: `${site}/logo.png`,
        contentUrl: `${site}/logo.png`,
        width: 512,
        height: 512,
        caption: company.name,
      },
      { "@type": "Person", "@id": ids.managingDirector, name: company.owner, jobTitle: ownerTitle(locale), worksFor: { "@id": ids.organization } },
      {
        // Name der Website in den Google-Ergebnissen („Websitename").
        "@type": "WebSite",
        "@id": ids.website,
        url: site,
        name: company.name,
        alternateName: [company.legalName, "transport-fa.de"],
        inLanguage: LOCALES.map(intlLocale),
        publisher: { "@id": ids.organization },
      },
    ],
  };
}

// --- Seiten-Bausteine ------------------------------------------------------------------------

/** Bild als ImageObject – bei Stockfotos mit Bildnachweis und Lizenz (Google Bilder: „Lizenzierbar"). */
function imageNode(image: SeoImage, locale: Locale, id: string) {
  const credit = creditFor(image.url);
  const url = `${site}${image.url}`;
  return {
    "@type": "ImageObject",
    "@id": id,
    url,
    contentUrl: url,
    width: image.width,
    height: image.height,
    caption: image.alt,
    inLanguage: intlLocale(locale),
    ...(credit && {
      creditText: `${credit.photographer} / Pexels`,
      creator: { "@type": "Person", name: credit.photographer },
      copyrightNotice: `© ${credit.photographer}`,
      license: "https://www.pexels.com/license/",
      acquireLicensePage: credit.sourceUrl,
    }),
  };
}

interface WebPageInput {
  /** Sichtbarer Pfad ohne Sprachpräfix. */
  path: string;
  locale: Locale;
  name: string;
  description: string;
  type?: "WebPage" | "ContactPage" | "CollectionPage";
  /** Brotkrumen nach der Startseite (die kommt automatisch davor); letzter Eintrag = diese Seite. */
  breadcrumbs?: Array<{ name: string; path: string }>;
  image?: SeoImage;
  dateModified?: string;
  /** @id der Hauptentität (Service, Artikel …); ohne → das Unternehmen. */
  mainEntity?: string;
}

function webPageNodes({ path, locale, name, description, type = "WebPage", breadcrumbs, image, dateModified, mainEntity }: WebPageInput) {
  const url = absoluteUrl(path, locale);
  const primaryImage = image && imageNode(image, locale, `${url}#primaryimage`);
  const trail = breadcrumbs && [{ name: locale === "en" ? "Home" : "Startseite", path: "/" }, ...breadcrumbs];

  return [
    {
      "@type": type,
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: intlLocale(locale),
      isPartOf: { "@id": ids.website },
      about: { "@id": mainEntity ?? ids.organization },
      ...(mainEntity && { mainEntity: { "@id": mainEntity } }),
      ...(primaryImage && { primaryImageOfPage: { "@id": primaryImage["@id"] } }),
      ...(trail && { breadcrumb: { "@id": `${url}#breadcrumb` } }),
      ...(dateModified && { dateModified }),
    },
    ...(primaryImage ? [primaryImage] : []),
    ...(trail
      ? [
          {
            "@type": "BreadcrumbList",
            "@id": `${url}#breadcrumb`,
            itemListElement: trail.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: absoluteUrl(item.path, locale),
            })),
          },
        ]
      : []),
  ];
}

/** FAQPage – jede Frage mit eigenem Anker (#faq-…), identisch zur sichtbaren FAQ. */
function faqPageNode(faqs: Faq[], url: string, locale: Locale) {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: intlLocale(locale),
    isPartOf: { "@id": `${url}#webpage` },
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      url: `${url}#${faqAnchor(faq.question)}`,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Einfache Seite (Startseite, Kontakt, Karriere, Rechtliches): WebPage + Brotkrumen. */
export function webPageJsonLd(input: WebPageInput) {
  return { "@context": "https://schema.org", "@graph": webPageNodes(input) };
}

// --- Leistungen --------------------------------------------------------------------------------

/** Standbild des Hero-Videos als Seitenbild einer Leistung. */
export function serviceImage(service: ServiceArea): SeoImage {
  return { url: service.hero.media.poster, ...service.hero.media.posterSize, alt: service.hero.mediaAlt };
}

export function serviceJsonLd(service: ServiceArea, locale: Locale) {
  const path = serviceHref(service.slug);
  const url = absoluteUrl(path, locale);
  const serviceId = `${url}#service`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...webPageNodes({
        path,
        locale,
        name: service.seo.title,
        description: service.seo.description,
        breadcrumbs: [{ name: service.name, path }],
        image: serviceImage(service),
        dateModified: service.updatedAt,
        mainEntity: serviceId,
      }),
      {
        "@type": "Service",
        "@id": serviceId,
        name: service.name,
        serviceType: service.name,
        description: service.seo.description,
        url,
        image: { "@id": `${url}#primaryimage` },
        provider: { "@id": ids.organization },
        areaServed: areaServed(locale),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: service.scope.title,
          itemListElement: service.scope.items.map((item) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: item.title, description: item.description },
          })),
        },
      },
      faqPageNode(service.faqs, url, locale),
    ],
  };
}

// --- Blog --------------------------------------------------------------------------------------

/** Titelbild eines Beitrags (Stockfoto mit Maßen aus den Bildnachweisen). */
export function postImage(post: BlogPost): SeoImage {
  const credit = creditFor(post.cover.src);
  return { url: post.cover.src, width: credit?.width ?? 1920, height: credit?.height ?? 1280, alt: post.cover.alt };
}

/** Blog-Übersicht: Sammelseite mit allen veröffentlichten Beiträgen. */
export function blogJsonLd(posts: BlogPost[], locale: Locale, page: { name: string; description: string }) {
  const url = absoluteUrl(routes.blog, locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...webPageNodes({
        path: routes.blog,
        locale,
        type: "CollectionPage",
        ...page,
        breadcrumbs: [{ name: "Blog", path: routes.blog }],
        mainEntity: `${url}#blog`,
      }),
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        name: locale === "en" ? `${company.name} – Blog & guides` : `${company.name} – Blog & Ratgeber`,
        url,
        inLanguage: intlLocale(locale),
        publisher: { "@id": ids.organization },
        blogPost: posts.map((post) => {
          const postUrl = absoluteUrl(blogHref(post.slug), locale);
          return {
            "@type": "BlogPosting",
            "@id": `${postUrl}#article`,
            headline: post.title,
            url: postUrl,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt ?? post.publishedAt,
          };
        }),
      },
    ],
  };
}

/** Einzelner Beitrag: Artikel mit Titelbild (inkl. Lizenzangaben), Brotkrumen und – falls vorhanden – FAQ. */
export function blogPostingJsonLd(post: BlogPost, locale: Locale) {
  const path = blogHref(post.slug);
  const url = absoluteUrl(path, locale);
  const category = getCategory(post.category, locale);
  const service = category && getService(category.service, locale);
  const serviceUrl = service && absoluteUrl(serviceHref(service.slug), locale);
  const dateModified = post.updatedAt ?? post.publishedAt;

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...webPageNodes({
        path,
        locale,
        name: post.title,
        description: post.excerpt,
        breadcrumbs: [
          { name: "Blog", path: routes.blog },
          { name: post.title, path },
        ],
        image: postImage(post),
        dateModified,
        mainEntity: `${url}#article`,
      }),
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        image: { "@id": `${url}#primaryimage` },
        datePublished: post.publishedAt,
        dateModified,
        inLanguage: intlLocale(locale),
        mainEntityOfPage: { "@id": `${url}#webpage` },
        isPartOf: { "@type": "Blog", "@id": `${absoluteUrl(routes.blog, locale)}#blog`, url: absoluteUrl(routes.blog, locale) },
        articleSection: category?.name,
        keywords: post.keywords.join(", "),
        // Themenbezug zur Leistungsseite – verknüpft Ratgeber und Angebot (Topic Cluster).
        about: service && serviceUrl ? { "@type": "Service", "@id": `${serviceUrl}#service`, name: service.name, url: serviceUrl } : undefined,
        author: post.author.team
          ? { "@id": ids.organization }
          : { "@type": "Person", name: post.author.name, jobTitle: post.author.role, worksFor: { "@id": ids.organization } },
        publisher: { "@id": ids.organization },
      },
      ...(post.faqs?.length ? [faqPageNode(post.faqs, url, locale)] : []),
    ],
  };
}

/** Serialisiert JSON-LD sicher für <script> (verhindert </script>-Injection). */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
