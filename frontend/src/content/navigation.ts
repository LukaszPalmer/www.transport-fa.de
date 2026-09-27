import type { NavChild, NavGroup, NavItem, NavLink } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { getServices, serviceHref } from "./services";

/**
 * Anker-IDs der Startseiten-Sektionen. Links nutzen "/#id", damit sie auch
 * von Unterseiten zurück zur Sektion führen.
 */
export const sectionIds = {
  services: "leistungen",
  fleet: "flotte",
  about: "ueber-uns",
  reviews: "bewertungen",
  referral: "empfehlung",
  blog: "blog",
  careers: "karriere",
  contact: "kontakt",
} as const;

export const routes = {
  contact: "/kontakt",
  contactForm: "/kontakt#anfrage",
  careers: "/karriere",
  application: "/karriere#bewerbung",
  portal: "/kundenportal",
  portalLogin: "/kundenportal/anmelden",
  portalTracking: "/kundenportal/tracking",
  portalInvoices: "/kundenportal/rechnungen",
  portalDocuments: "/kundenportal/dokumente",
  portalVerify: "/kundenportal/email-bestaetigen",
  portalRegister: "/kundenportal/registrieren",
  portalForgot: "/kundenportal/passwort-vergessen",
  portalReset: "/kundenportal/passwort-zuruecksetzen",
  portalSettings: "/kundenportal/einstellungen",
  review: "/bewerten",
  blog: "/blog",
  admin: "/admin",
  adminLogin: "/admin/login",
  adminUsers: "/admin/users",
  adminOrders: "/admin/orders",
  adminInvoices: "/admin/invoices",
  adminInvoiceNew: "/admin/invoices/new",
  adminInvoiceDrafts: "/admin/invoices/drafts",
  adminChat: "/admin/chat",
  adminTeam: "/admin/team",
  adminLeads: "/admin/leads",
  adminAccounting: "/admin/accounting",
  adminActivity: "/admin/activity",
} as const;

const labels = {
  de: {
    services: "Leistungen",
    about: "Über uns",
    fleet: "Flotte",
    blog: "Blog",
    careers: "Karriere",
    contact: "Kontakt",
    imprint: "Impressum",
    privacy: "Datenschutz",
    sitemap: "Sitemap",
    company: "Unternehmen",
    fleetTech: "Flotte & Technologie",
    blogGuides: "Blog & Ratgeber",
    referral: "Empfehlungsprogramm",
    portal: "Kundenportal",
    review: "Bewertung abgeben",
  },
  en: {
    services: "Services",
    about: "About us",
    fleet: "Fleet",
    blog: "Blog",
    careers: "Careers",
    contact: "Contact",
    imprint: "Legal notice",
    privacy: "Privacy policy",
    sitemap: "Sitemap",
    company: "Company",
    fleetTech: "Fleet & technology",
    blogGuides: "Blog & guides",
    referral: "Referral programme",
    portal: "Customer portal",
    review: "Leave a review",
  },
} satisfies Record<Locale, Record<string, string>>;

/** Menüs der Website in der gewünschten Sprache (URLs sind in beiden Sprachen gleich). */
export function getNavigation(locale: Locale) {
  const t = labels[locale];
  const serviceNav: NavChild[] = getServices(locale).map((service) => ({
    label: service.name,
    href: serviceHref(service.slug),
    description: service.teaser,
    icon: service.icon,
  }));

  const mainNav: NavItem[] = [
    { label: t.services, href: `/#${sectionIds.services}`, children: serviceNav },
    { label: t.about, href: `/#${sectionIds.about}` },
    { label: t.fleet, href: `/#${sectionIds.fleet}` },
    { label: t.blog, href: routes.blog },
    { label: t.careers, href: routes.careers },
    { label: t.contact, href: routes.contact },
  ];

  const legalNav: NavLink[] = [
    { label: t.imprint, href: "/impressum" },
    { label: t.privacy, href: "/datenschutz" },
    { label: t.sitemap, href: "/sitemap.xml" },
  ];

  const footerNav: NavGroup[] = [
    { title: t.services, items: serviceNav.map(({ label, href }) => ({ label, href })) },
    {
      title: t.company,
      items: [
        { label: t.about, href: `/#${sectionIds.about}` },
        { label: t.fleetTech, href: `/#${sectionIds.fleet}` },
        { label: t.blogGuides, href: routes.blog },
        { label: t.referral, href: `/#${sectionIds.referral}` },
        { label: t.careers, href: routes.careers },
        { label: t.contact, href: routes.contact },
        { label: t.portal, href: routes.portal },
        { label: t.review, href: routes.review },
      ],
    },
  ];

  return { serviceNav, mainNav, legalNav, footerNav };
}
