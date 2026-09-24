import type { NavGroup, NavItem, NavLink } from "@/types/content";
import { services, serviceHref } from "./services";

/**
 * Anker-IDs der Startseiten-Sektionen. Links nutzen "/#id", damit sie auch
 * von Unterseiten zurück zur Sektion führen.
 */
export const sectionIds = {
  services: "leistungen",
  fleet: "flotte",
  about: "ueber-uns",
  reviews: "bewertungen",
  careers: "karriere",
  contact: "kontakt",
} as const;

export const routes = {
  contact: "/kontakt",
  contactForm: "/kontakt#anfrage",
  careers: "/karriere",
  application: "/karriere#bewerbung",
  portal: "/kundenportal",
  portalRegister: "/kundenportal/registrieren",
  portalForgot: "/kundenportal/passwort-vergessen",
  portalReset: "/kundenportal/passwort-zuruecksetzen",
  portalAccount: "/kundenportal/konto",
  review: "/bewerten",
} as const;

export const serviceNav = services.map((service) => ({
  label: service.name,
  href: serviceHref(service.slug),
  description: service.teaser,
  icon: service.icon,
}));

export const mainNav: NavItem[] = [
  { label: "Leistungen", href: `/#${sectionIds.services}`, children: serviceNav },
  { label: "Über uns", href: `/#${sectionIds.about}` },
  { label: "Flotte", href: `/#${sectionIds.fleet}` },
  { label: "Karriere", href: routes.careers },
  { label: "Kontakt", href: routes.contact },
];

export const legalNav: NavLink[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

export const footerNav: NavGroup[] = [
  {
    title: "Leistungen",
    items: serviceNav.map(({ label, href }) => ({ label, href })),
  },
  {
    title: "Unternehmen",
    items: [
      { label: "Über uns", href: `/#${sectionIds.about}` },
      { label: "Flotte & Technologie", href: `/#${sectionIds.fleet}` },
      { label: "Karriere", href: routes.careers },
      { label: "Kontakt", href: routes.contact },
      { label: "Kundenportal", href: routes.portal },
      { label: "Bewertung abgeben", href: routes.review },
    ],
  },
];
