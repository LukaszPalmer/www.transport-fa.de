import type { DocumentListResponse } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { apiServer } from "@/lib/api/server";
import { requireCustomer } from "@/lib/session";
import { EmptyState, PortalHero } from "@/components/portal/dashboard/ui";
import { DocumentLibrary } from "@/components/portal/documents/DocumentLibrary";
import { UploadCard } from "@/components/portal/documents/UploadCard";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Dokumente",
    eyebrow: "Dokumente",
    title: "Ihre Dokumente",
    verifyFirst: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse",
    verifyText: "Danach können Sie hier Dokumente hochladen und abrufen.",
    toOverview: "Zur Übersicht",
    heroText: "Zoll- und Frachtpapiere hochladen, Unterlagen von uns abrufen – und alles jederzeit ausdrucken.",
    howTitle: "So kommen Papiere in den LKW",
    steps: ["Dokument hochladen und dem Auftrag zuordnen.", "„Dem Fahrer mitgeben“ anhaken.", "Wir drucken es aus und geben es dem Fahrer mit."],
    printHint: "Sie können jedes Dokument auch selbst über „Ansehen & Drucken“ ausdrucken.",
  },
  en: {
    metaTitle: "Customer portal – Documents",
    eyebrow: "Documents",
    title: "Your documents",
    verifyFirst: "Please confirm your email address first",
    verifyText: "After that you can upload and access documents here.",
    toOverview: "Go to overview",
    heroText: "Upload customs and freight papers, access documents from us – and print everything at any time.",
    howTitle: "How papers get into the truck",
    steps: ["Upload the document and assign it to the job.", "Tick “Hand to the driver”.", "We print it and give it to the driver."],
    printHint: "You can also print any document yourself via “View & print”.",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

/** Dokumente: eigene Uploads (z. B. Zollpapiere für den Fahrer) und Unterlagen vom Büro. */
export default async function DocumentsPage() {
  const me = await requireCustomer(routes.portalDocuments);
  const t = messages[await getLocale()];

  if (!me.user.emailVerified) {
    return (
      <>
        <PortalHero eyebrow={t.eyebrow} title={t.title} />
        <Container className="relative z-10 -mt-24 pb-24">
          <EmptyState title={t.verifyFirst} text={t.verifyText} action={{ label: t.toOverview, href: routes.portal }} />
        </Container>
      </>
    );
  }

  const { documents, shipments } = await apiServer<DocumentListResponse>("/portal/documents");

  return (
    <>
      <PortalHero
        eyebrow={t.eyebrow}
        title={t.title}
        text={t.heroText}
      />

      <Container className="relative z-10 -mt-24 space-y-6 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <UploadCard shipments={shipments} />
            <aside className="rounded-3xl bg-primary p-6 text-sm text-slate-300 shadow-card sm:p-8">
              <p className="flex items-center gap-2 font-display text-base font-bold text-white">
                <Icon name="truck" className="size-5 text-accent" />
                {t.howTitle}
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5">
                {t.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-4">{t.printHint}</p>
            </aside>
          </div>
          <div className="lg:col-span-2">
            <DocumentLibrary documents={documents} />
          </div>
        </div>
      </Container>
    </>
  );
}
