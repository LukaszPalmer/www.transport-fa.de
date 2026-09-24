import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { company } from "@/content/company";
import { AnchorScroll } from "@/components/layout/AnchorScroll";
import "./globals.css";

/**
 * Schriften werden von next/font zur Build-Zeit selbst gehostet:
 * kein Request an Google (DSGVO), automatisches Preloading und
 * metrik-angepasste Fallbacks → kein Layout-Shift beim Font-Swap.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.name} – Umzüge, Entrümpelungen & Transporte`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  applicationName: company.name,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: company.name,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0b132b",
  colorScheme: "light",
};

/**
 * Root-Layout: nur Dokument-Rahmen. Header/Footer liefern die Gruppen-Layouts
 * – (site) für die Website, (portal) für das fokussierte Kundenportal.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" data-scroll-behavior="smooth" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-3 focus:font-semibold focus:text-primary"
        >
          Zum Inhalt springen
        </a>
        {children}
        <AnchorScroll />
      </body>
    </html>
  );
}
