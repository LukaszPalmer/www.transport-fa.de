import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | FA Transport Admin" },
  // Interner Bereich – nie in Suchmaschinen.
  robots: { index: false, follow: false },
};

/** Admin-Bereich – eigenes Layout ohne Website-Header/-Footer. */
export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
      {children}
    </main>
  );
}
