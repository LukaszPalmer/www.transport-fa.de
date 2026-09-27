import type { ReactNode } from "react";
import { getLocale } from "@/i18n/server";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

/** Gemeinsames Layout für Rechtstexte (Impressum, Datenschutz, AGB …). */
export async function LegalPage({ title, children }: LegalPageProps) {
  const locale = await getLocale();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary pt-36 pb-16 lg:pt-44 lg:pb-20">
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <Container>
          <Eyebrow tone="dark">{locale === "en" ? "Legal" : "Rechtliches"}</Eyebrow>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">{title}</h1>
        </Container>
      </section>

      <Container className="py-16 lg:py-24">
        <div className="max-w-3xl text-slate-700 [&_a]:font-medium [&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary [&_h2:first-child]:mt-0 [&_h3]:mt-8 [&_h3]:font-semibold [&_h3]:text-primary [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
          {children}
        </div>
      </Container>
    </>
  );
}
