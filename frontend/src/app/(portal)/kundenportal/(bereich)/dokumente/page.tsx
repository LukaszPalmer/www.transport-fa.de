import type { DocumentListResponse } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { apiServer } from "@/lib/api/server";
import { requireCustomer } from "@/lib/session";
import { EmptyState, PortalHero } from "@/components/portal/dashboard/ui";
import { DocumentLibrary } from "@/components/portal/documents/DocumentLibrary";
import { UploadCard } from "@/components/portal/documents/UploadCard";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Kundenportal – Dokumente" };

/** Dokumente: eigene Uploads (z. B. Zollpapiere für den Fahrer) und Unterlagen vom Büro. */
export default async function DocumentsPage() {
  const me = await requireCustomer(routes.portalDocuments);

  if (!me.user.emailVerified) {
    return (
      <>
        <PortalHero eyebrow="Dokumente" title="Ihre Dokumente" />
        <Container className="relative z-10 -mt-24 pb-24">
          <EmptyState title="Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse" text="Danach können Sie hier Dokumente hochladen und abrufen." action={{ label: "Zur Übersicht", href: routes.portal }} />
        </Container>
      </>
    );
  }

  const { documents, shipments } = await apiServer<DocumentListResponse>("/portal/documents");

  return (
    <>
      <PortalHero
        eyebrow="Dokumente"
        title="Ihre Dokumente"
        text="Zoll- und Frachtpapiere hochladen, Unterlagen von uns abrufen – und alles jederzeit ausdrucken."
      />

      <Container className="relative z-10 -mt-24 space-y-6 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <UploadCard shipments={shipments} />
            <aside className="rounded-3xl bg-primary p-6 text-sm text-slate-300 shadow-card sm:p-8">
              <p className="flex items-center gap-2 font-display text-base font-bold text-white">
                <Icon name="truck" className="size-5 text-accent" />
                So kommen Papiere in den LKW
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5">
                <li>Dokument hochladen und dem Auftrag zuordnen.</li>
                <li>„Dem Fahrer mitgeben“ anhaken.</li>
                <li>Wir drucken es aus und geben es dem Fahrer mit.</li>
              </ol>
              <p className="mt-4">Sie können jedes Dokument auch selbst über „Ansehen & Drucken“ ausdrucken.</p>
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
