import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { ReviewPlatformLinks } from "@/components/sections/reviews/ReviewsSection";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Bewertung abgeben",
  description: "Wie zufrieden waren Sie mit FA Transport? Teilen Sie Ihre Erfahrung auf Google oder MyHammer.",
  alternates: { canonical: routes.review },
  // Service-Seite für Kunden (Link auf Rechnung/QR-Code) – nicht in Suchergebnissen.
  robots: { index: false, follow: true },
};

/**
 * Kurzlink für Bewertungsanfragen nach Auftragsabschluss (z. B. per SMS,
 * E-Mail-Signatur oder QR-Code auf der Rechnung): transport-fa.de/bewerten
 */
export default function ReviewRequestPage() {
  return (
    <section className="relative isolate min-h-[80svh] overflow-hidden bg-primary pt-36 pb-24 lg:pt-44">
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <Container className="max-w-3xl text-center">
        <Eyebrow tone="dark">Ihre Meinung zählt</Eyebrow>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl">
          Wie zufrieden waren Sie mit uns?
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
          Ihre ehrliche Bewertung hilft anderen Kunden bei der Entscheidung – und uns, noch besser zu werden. Es dauert
          weniger als eine Minute.
        </p>
        <div className="mt-12 text-left">
          <ReviewPlatformLinks />
        </div>
        <p className="mt-8 text-sm text-slate-400">
          Etwas lief nicht rund? Schreiben Sie uns direkt – wir kümmern uns persönlich darum.
        </p>
      </Container>
    </section>
  );
}
