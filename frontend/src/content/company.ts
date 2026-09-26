import { COMPANY } from "@fa/shared";
import type { SocialLink } from "@/types/content";

/**
 * Zentrale Unternehmensdaten – Single Source of Truth für Header, Footer,
 * Kontakt-CTAs, Impressum und strukturierte Daten (JSON-LD).
 *
 * Kerndaten (Adresse, Kontakt, Register) kommen aus @fa/shared, damit auch die
 * E-Mails des Backends dieselben Angaben verwenden.
 *
 * TODO(Inhalt): Profil-URL als `href` eintragen, sobald ein Kanal online ist – bis dahin
 * erscheint das Icon mit dem Hinweis „Profil folgt demnächst" (kein Link, nicht im JSON-LD).
 */
const socialLinks: SocialLink[] = [
  { platform: "linkedin", label: "LinkedIn" },
  { platform: "instagram", label: "Instagram" },
  { platform: "facebook", label: "Facebook" },
];

export const company = {
  name: COMPANY.name,
  legalName: COMPANY.legalName,
  description:
    "Umzüge, Entrümpelungen, Haushaltsauflösungen sowie Transport & Logistik – termintreu, transparent und zum Festpreis. Ihr Partner aus einer Hand.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? COMPANY.websiteUrl,
  portalUrl: "/kundenportal",
  contact: {
    ...COMPANY.contact,
    quoteEmail: COMPANY.contact.email,
    careersEmail: COMPANY.contact.email,
  },
  address: COMPANY.address,
  register: COMPANY.register,
  social: socialLinks,
};
