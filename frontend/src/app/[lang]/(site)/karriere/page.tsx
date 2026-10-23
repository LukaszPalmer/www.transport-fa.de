import type { Metadata } from "next";
import { company } from "@/content/company";
import { drivingLicenses, getCareers, MAX_CV_MB } from "@/content/careers";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { routes } from "@/content/navigation";
import { pageMetadata } from "@/lib/seo";
import { webPageJsonLd } from "@/lib/structured-data";
import { CareerApplication } from "@/components/sections/careers/CareerApplication";
import { HeroFactsCard } from "@/components/sections/hero/HeroFactsCard";
import { PageHero } from "@/components/sections/hero/PageHero";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { StatsBar } from "@/components/sections/StatsBar";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";

const messages = defineMessages({
  de: {
    jobs: "Offene Stellen ansehen",
    initiative: "Initiativ bewerben",
    apply: "Direkt bewerben",
    inNumbers: "Karriere in Zahlen",
    whyEyebrow: "Warum FA Transport",
    whyTitle: "Ein Arbeitgeber, der mit anpackt.",
    whyText: "In allen Bereichen – ob Transport, Umzug oder Räumung – gelten bei uns dieselben Versprechen.",
    jobsEyebrow: "Offene Stellen",
    jobsTitle: "Finden Sie Ihren Platz im Team.",
    jobsText: "Stellen in allen Unternehmensbereichen – filtern Sie nach Ihrem Wunschbereich.",
    processEyebrow: "Bewerbungsprozess",
    processTitle: "In vier Schritten zu Ihrem neuen Job",
    formEyebrow: "Bewerbung",
    formTitle: "Jetzt bewerben – in 3 Minuten.",
    formText: "Kein Anschreiben nötig. Ein Lebenslauf hilft uns, ist aber kein Muss – wir rufen Sie zurück.",
    questions: "Fragen vorab?",
    questionsText: "Unser Personalteam ist für Sie da.",
    germanNote: "",
    home: "Startseite",
    breadcrumbs: "Brotkrumen",
    careers: "Karriere",
    posterAlt: "Zwei Lagermitarbeiter zwischen Palettenregalen, einer prüft Aufträge auf einem Tablet",
  },
  en: {
    jobs: "View open positions",
    initiative: "Apply speculatively",
    apply: "Apply directly",
    inNumbers: "Careers in figures",
    whyEyebrow: "Why FA Transport",
    whyTitle: "An employer who pitches in.",
    whyText: "In every area – transport, removals or clearances – the same promises apply.",
    jobsEyebrow: "Open positions",
    jobsTitle: "Find your place in the team.",
    jobsText: "Positions in every part of the company – filter by the area you're interested in.",
    processEyebrow: "Application process",
    processTitle: "Four steps to your new job",
    formEyebrow: "Application",
    formTitle: "Apply now – in 3 minutes.",
    formText: "No cover letter needed. A CV helps us but isn't a must – we'll call you back.",
    questions: "Questions first?",
    questionsText: "Our HR team is here for you.",
    germanNote: "Our teams work in German – good German skills are usually required.",
    home: "Home",
    breadcrumbs: "Breadcrumbs",
    careers: "Careers",
    posterAlt: "Two warehouse workers between pallet racks, one checking orders on a tablet",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { careersPage } = getCareers(locale);
  const { media } = careersPage.hero;
  return pageMetadata({
    path: routes.careers,
    locale,
    title: careersPage.seo.title,
    description: careersPage.seo.description,
    image: { url: media.poster, ...media.posterSize, alt: messages[locale].posterAlt },
  });
}

export default async function CareersPage() {
  const locale = await getLocale();
  const t = messages[locale];
  const { careersPage, benefits, careerAreas, jobs, applicationProcess, initiativeJob } = getCareers(locale);
  const { hero } = careersPage;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: routes.careers,
          locale,
          name: careersPage.seo.title,
          description: careersPage.seo.description,
          breadcrumbs: [{ name: t.careers, path: routes.careers }],
        })}
      />
      <PageHero
        size="large"
        breadcrumbs={{
          label: t.breadcrumbs,
          items: [
            { label: t.home, href: "/" },
            { label: t.careers, href: routes.careers },
          ],
        }}
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        headlineAccent={hero.headlineAccent}
        subheadline={hero.subheadline}
        media={hero.media}
        primaryCta={{ label: t.jobs, href: "#stellen" }}
        secondaryCta={{ label: t.initiative, href: "#bewerbung" }}
        aside={<HeroFactsCard title={hero.factsTitle} facts={hero.facts} cta={{ label: t.apply, href: "#bewerbung" }} />}
      />

      <StatsBar stats={careersPage.stats} label={t.inNumbers} />

      <section aria-labelledby="benefits-title" className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            id="benefits-title"
            eyebrow={t.whyEyebrow}
            title={t.whyTitle}
            description={t.whyText}
          />
          <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <li
                key={benefit.title}
                data-reveal
                className="group rounded-2xl border border-slate-200/80 bg-surface p-8 transition-[background-color,border-color,box-shadow] duration-500 ease-out-expo hover:border-accent/40 hover:bg-white hover:shadow-card-hover"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-primary">
                  <Icon name={benefit.icon} className="size-5" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-primary">{benefit.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-600">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CareerApplication
        jobs={jobs}
        areas={careerAreas}
        initiative={initiativeJob}
        licenses={drivingLicenses}
        maxCvMb={MAX_CV_MB}
        jobsHeading={
          <SectionHeading
            id="jobs-title"
            eyebrow={t.jobsEyebrow}
            title={t.jobsTitle}
            description={t.germanNote ? `${t.jobsText} ${t.germanNote}` : t.jobsText}
          />
        }
        between={
          <ProcessSteps
            tone="dark"
            eyebrow={t.processEyebrow}
            title={t.processTitle}
            steps={applicationProcess}
            id="application-process-title"
          />
        }
        formHeading={
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              id="application-title"
              eyebrow={t.formEyebrow}
              title={t.formTitle}
              description={t.formText}
            />
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6">
              <p className="text-sm font-semibold text-primary">{t.questions}</p>
              <p className="mt-1 text-sm text-slate-600">{t.questionsText}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Icon name="phone" className="size-4 text-accent-ink" />
                  <a href={company.contact.phoneHref} className="font-medium text-primary hover:text-accent-ink">
                    {company.contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="mail" className="size-4 text-accent-ink" />
                  <a href={`mailto:${company.contact.careersEmail}`} className="font-medium text-primary hover:text-accent-ink">
                    {company.contact.careersEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        }
      />
    </>
  );
}
