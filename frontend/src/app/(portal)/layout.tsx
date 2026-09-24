import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Portal-Seiten gehören nicht in Suchmaschinen.
  robots: { index: false, follow: false },
};

/** Fokussiertes Layout des Kundenportals – ohne Website-Header/-Footer. */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {children}
    </main>
  );
}
