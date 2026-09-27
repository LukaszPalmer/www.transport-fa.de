import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { ReviewPlatformLinks } from "@/components/sections/reviews/ReviewsSection";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

const messages = defineMessages({
  de: {
    title: "Bewertung abgeben",
    description: "Wie zufrieden waren Sie mit FA Transport? Teilen Sie Ihre Erfahrung auf Google.",
    eyebrow: "Ihre Meinung zählt",
    heading: "Wie zufrieden waren Sie mit uns?",
    text: "Ihre ehrliche Bewertung hilft anderen Kunden bei der Entscheidung – und uns, noch besser zu werden. Es dauert weniger als eine Minute.",
    feedback: "Etwas lief nicht rund? Schreiben Sie uns direkt – wir kümmern uns persönlich darum.",
  },
  en: {
    title: "Leave a review",
    description: "How satisfied were you with FA Transport? Share your experience on Google.",
    eyebrow: "Your opinion counts",
    heading: "How satisfied were you with us?",
    text: "Your honest review helps other customers decide – and helps us get even better. It takes less than a minute.",
    feedback: "Something didn't go well? Write to us directly – we'll take care of it personally.",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  const t = messages[await getLocale()];
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: routes.review },
    // Service-Seite für Kunden (Link auf Rechnung/QR-Code) – nicht in Suchergebnissen.
    robots: { index: false, follow: true },
  };
}

/**
 * Kurzlink für Bewertungsanfragen nach Auftragsabschluss (z. B. per SMS,
 * E-Mail-Signatur oder QR-Code auf der Rechnung): transport-fa.de/bewerten
 */
export default async function ReviewRequestPage() {
  const t = messages[await getLocale()];
  return (
    <section className="relative isolate min-h-[80svh] overflow-hidden bg-primary pt-36 pb-24 lg:pt-44">
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <Container className="max-w-3xl text-center">
        <Eyebrow tone="dark">{t.eyebrow}</Eyebrow>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl">
          {t.heading}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
          {t.text}
        </p>
        <div className="mt-12 text-left">
          <ReviewPlatformLinks />
        </div>
        <p className="mt-8 text-sm text-slate-400">
          {t.feedback}
        </p>
      </Container>
    </section>
  );
}
