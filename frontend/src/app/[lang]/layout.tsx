import type { Metadata, Viewport } from "next";
import { company } from "@/content/company";
import { LocaleProvider } from "@/i18n/client";
import { defineMessages, isLocale, LOCALES, type Locale } from "@/i18n/config";
import { WebVitals } from "@/components/analytics/WebVitals";
import { AnchorScroll } from "@/components/layout/AnchorScroll";
import { fontClasses } from "../fonts";
import "../globals.css";

const messages = defineMessages({
  de: {
    title: `${company.name} Düsseldorf – Umzüge, Entrümpelungen & Transporte`,
    description: company.descriptions.de,
    ogLocale: "de_DE",
    skip: "Zum Inhalt springen",
  },
  en: {
    title: `${company.name} Düsseldorf – Removals, Clearances & Transport`,
    description: company.descriptions.en,
    ogLocale: "en_GB",
    skip: "Skip to content",
  },
});

/** Beide Sprachfassungen werden vorgerendert – andere Werte gibt es nicht (404). */
export function generateStaticParams(): Array<{ lang: Locale }> {
  return LOCALES.map((lang) => ({ lang }));
}
export const dynamicParams = false;

/** Bestätigungscodes für Google Search Console und Bing Webmaster Tools (Meta-Tag-Methode, optional). */
const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION && { google: process.env.GOOGLE_SITE_VERIFICATION }),
  ...(process.env.BING_SITE_VERIFICATION && { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }),
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const t = messages[isLocale(lang) ? lang : "de"];
  const { geo } = company.address;
  return {
    metadataBase: new URL(company.siteUrl),
    title: { default: t.title, template: `%s | ${company.name}` },
    description: t.description,
    applicationName: company.name,
    authors: [{ name: company.legalName, url: company.siteUrl }],
    publisher: company.legalName,
    // Volle Snippets und große Bildvorschau in Google (Seiten können per noindex abweichen).
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
    },
    openGraph: { type: "website", locale: t.ogLocale, siteName: company.name },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false, email: false, address: false },
    verification,
    // Standort für Suchmaschinen, die Geo-Meta-Tags auswerten (Bing u. a.; Google nutzt JSON-LD).
    other: {
      "geo.region": "DE-NW",
      "geo.placename": company.address.city,
      "geo.position": `${geo.latitude};${geo.longitude}`,
      ICBM: `${geo.latitude}, ${geo.longitude}`,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b132b",
  colorScheme: "light",
};

/**
 * Root-Layout von Website und Kundenportal: Dokument-Rahmen und Sprache. Header/Footer liefern
 * die Gruppen-Layouts – (site) für die Website, (portal) für das fokussierte Kundenportal.
 * Der Admin-Bereich hat ein eigenes Root-Layout (app/(admin)/layout.tsx).
 */
export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "de";
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={fontClasses}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-3 focus:font-semibold focus:text-primary"
        >
          {messages[locale].skip}
        </a>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <AnchorScroll />
        {process.env.NEXT_PUBLIC_WEB_VITALS === "on" && <WebVitals />}
      </body>
    </html>
  );
}
