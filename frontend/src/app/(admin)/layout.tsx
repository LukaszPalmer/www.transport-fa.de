import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { company } from "@/content/company";
import { fontClasses } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: { default: "Admin", template: "%s | FA Transport Admin" },
  // Interner Bereich – nie in Suchmaschinen.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b132b",
  colorScheme: "light",
};

/**
 * Admin-Bereich – eigenes Root-Layout (nur Deutsch, ohne Website-Header/-Footer).
 * Website und Kundenportal laufen über app/[lang]/layout.tsx.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={fontClasses}>
      <body className="flex min-h-dvh flex-col">
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
