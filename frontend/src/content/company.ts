import type { SocialLink } from "@/types/content";

/**
 * Zentrale Unternehmensdaten – Single Source of Truth für Header, Footer,
 * Kontakt-CTAs, Impressum und strukturierte Daten (JSON-LD).
 *
 * TODO(Inhalt): Adresse, Telefon, E-Mail, Registerdaten und Social-URLs sind
 * Platzhalter und müssen vor dem Livegang durch die echten Daten ersetzt werden.
 */
const socialLinks: SocialLink[] = [
  { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/fa-transport" },
  { platform: "xing", label: "XING", href: "https://www.xing.com/pages/fa-transport" },
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/fatransport" },
  { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@fatransport" },
];

export const company = {
  name: "FA Transport",
  legalName: "FA Transport GmbH",
  foundingYear: 1999,
  description:
    "Umzüge, Entrümpelungen, Haushaltsauflösungen sowie Transport & Logistik – termintreu, transparent und zum Festpreis. Ihr Partner aus einer Hand.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.transport-fa.de",
  portalUrl: "/kundenportal",
  contact: {
    phone: "+49 (0) 123 456 78-0",
    phoneHref: "tel:+49123456780",
    email: "kontakt@transport-fa.de",
    quoteEmail: "kontakt@transport-fa.de",
    careersEmail: "kontakt@transport-fa.de",
    hours: "Mo–Fr 7–19 Uhr · Disposition 24/7",
  },
  address: {
    street: "Musterstraße 1",
    postalCode: "12345",
    city: "Musterstadt",
    country: "Deutschland",
    countryCode: "DE",
  },
  register: {
    court: "Amtsgericht Musterstadt",
    number: "HRB 000000",
    vatId: "DE000000000",
    managingDirectors: "Vorname Nachname",
  },
  social: socialLinks,
};
