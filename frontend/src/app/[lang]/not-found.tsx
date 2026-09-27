import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

const messages = defineMessages({
  de: {
    eyebrow: "Fehler 404",
    title: "Diese Route existiert nicht.",
    text: "Die angeforderte Seite wurde verschoben oder nie ausgeliefert. Wir bringen Sie zurück auf Kurs.",
    home: "Zur Startseite",
  },
  en: {
    eyebrow: "Error 404",
    title: "This route doesn't exist.",
    text: "The page you requested has been moved or never existed. Let's get you back on track.",
    home: "Back to the home page",
  },
});

/** Globale 404-Seite (liegt außerhalb der Gruppen-Layouts → Header/Footer selbst einbinden). */
export default async function NotFound() {
  const t = messages[await getLocale()];
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
            <Eyebrow tone="dark">{t.eyebrow}</Eyebrow>
            <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">{t.title}</h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-slate-300">{t.text}</p>
            <div className="mt-10 flex justify-center">
              <ButtonLink href="/" size="lg" withArrow>
                {t.home}
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
