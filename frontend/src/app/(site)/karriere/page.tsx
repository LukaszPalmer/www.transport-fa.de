import type { Metadata } from "next";
import { company } from "@/content/company";
import {
  applicationProcess,
  benefits,
  careerAreas,
  careersPage,
  drivingLicenses,
  initiativeJob,
  jobs,
  MAX_CV_MB,
} from "@/content/careers";
import { routes } from "@/content/navigation";
import { CareerApplication } from "@/components/sections/careers/CareerApplication";
import { HeroFactsCard } from "@/components/sections/hero/HeroFactsCard";
import { PageHero } from "@/components/sections/hero/PageHero";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { StatsBar } from "@/components/sections/StatsBar";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: careersPage.seo.title,
  description: careersPage.seo.description,
  alternates: { canonical: routes.careers },
  openGraph: { images: [careersPage.hero.media.poster] },
};

export default function CareersPage() {
  const { hero } = careersPage;

  return (
    <>
      <PageHero
        size="large"
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        headlineAccent={hero.headlineAccent}
        subheadline={hero.subheadline}
        media={hero.media}
        primaryCta={{ label: "Offene Stellen ansehen", href: "#stellen" }}
        secondaryCta={{ label: "Initiativ bewerben", href: "#bewerbung" }}
        aside={<HeroFactsCard title={hero.factsTitle} facts={hero.facts} cta={{ label: "Direkt bewerben", href: "#bewerbung" }} />}
      />

      <StatsBar stats={careersPage.stats} label="Karriere in Zahlen" />

      <section aria-labelledby="benefits-title" className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            id="benefits-title"
            eyebrow="Warum FA Transport"
            title="Ein Arbeitgeber, der mit anpackt."
            description="In allen Bereichen – ob Transport, Umzug, Räumung oder Büro – gelten bei uns dieselben Versprechen."
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
            eyebrow="Offene Stellen"
            title="Finden Sie Ihren Platz im Team."
            description="Stellen in allen Unternehmensbereichen – filtern Sie nach Ihrem Wunschbereich."
          />
        }
        between={
          <ProcessSteps
            tone="dark"
            eyebrow="Bewerbungsprozess"
            title="In vier Schritten zu Ihrem neuen Job"
            steps={applicationProcess}
            id="application-process-title"
          />
        }
        formHeading={
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              id="application-title"
              eyebrow="Bewerbung"
              title="Jetzt bewerben – in 3 Minuten."
              description="Kein Anschreiben nötig. Ein Lebenslauf hilft uns, ist aber kein Muss – wir rufen Sie zurück."
            />
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6">
              <p className="text-sm font-semibold text-primary">Fragen vorab?</p>
              <p className="mt-1 text-sm text-slate-600">Unser Personalteam ist für Sie da.</p>
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
