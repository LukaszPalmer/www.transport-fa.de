import type { InvoiceListResponse } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { apiServer } from "@/lib/api/server";
import { formatEuro } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { EmptyState, PortalHero, StatTile } from "@/components/portal/dashboard/ui";
import { InvoiceLibrary } from "@/components/portal/invoices/InvoiceLibrary";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Kundenportal – Rechnungen" };

/** Rechnungen, Angebote, Auftragsbestätigungen und Gutschriften – ansehen, drucken, herunterladen. */
export default async function InvoicesPage({ searchParams }: PageProps<"/kundenportal/rechnungen">) {
  const me = await requireCustomer(routes.portalInvoices);

  if (!me.user.emailVerified) {
    return (
      <>
        <PortalHero eyebrow="Rechnungen" title="Rechnungen & Belege" />
        <Container className="relative z-10 -mt-24 pb-24">
          <EmptyState title="Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse" text="Danach sehen Sie hier alle Rechnungen und Angebote." action={{ label: "Zur Übersicht", href: routes.portal }} />
        </Container>
      </>
    );
  }

  const [{ invoices, stats }, params] = await Promise.all([apiServer<InvoiceListResponse>("/portal/invoices"), searchParams]);
  const highlightId = typeof params.beleg === "string" ? params.beleg : undefined;

  return (
    <>
      <PortalHero
        eyebrow="Rechnungen"
        title="Rechnungen & Belege"
        text="Angebote, Auftragsbestätigungen und Rechnungen an einem Ort – jederzeit ansehen, ausdrucken und als PDF herunterladen."
      />

      <Container className="relative z-10 -mt-24 space-y-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            icon="coins"
            label="Offener Betrag"
            value={formatEuro(stats.openGrossCents)}
            detail={stats.openCount === 0 ? "Alles beglichen" : `${stats.openCount} offene ${stats.openCount === 1 ? "Rechnung" : "Rechnungen"}`}
          />
          <StatTile
            icon="clock"
            label="Überfällig"
            value={String(stats.overdueCount)}
            detail={stats.overdueCount > 0 ? "Bitte prüfen Sie die markierten Rechnungen" : "Keine überfälligen Rechnungen"}
            highlight={stats.overdueCount > 0 ? "warning" : undefined}
          />
          <StatTile icon="check" label="Bezahlt" value={String(stats.paidCount)} detail="Beglichene Rechnungen" />
        </div>

        <InvoiceLibrary invoices={invoices} highlightId={highlightId} />
      </Container>
    </>
  );
}
