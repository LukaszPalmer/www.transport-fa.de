import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Globale 404-Seite (liegt außerhalb der Gruppen-Layouts → Header/Footer selbst einbinden). */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-primary pt-18">
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          />
          <Container className="py-24 text-center">
            <Eyebrow tone="dark">Fehler 404</Eyebrow>
            <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Diese Route existiert nicht.</h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-slate-300">
              Die angeforderte Seite wurde verschoben oder nie ausgeliefert. Wir bringen Sie zurück auf Kurs.
            </p>
            <div className="mt-10 flex justify-center">
              <ButtonLink href="/" size="lg" withArrow>
                Zur Startseite
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
