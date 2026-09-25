import type { PortalOverview } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { apiServer } from "@/lib/api/server";
import { formatEuro, greeting } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { ResendVerificationButton } from "@/components/portal/AccountActions";
import { AuthAlert } from "@/components/portal/auth-fields";
import { DocumentsPanel, InvoicesPanel, ShipmentsPanel, SupportCard } from "@/components/portal/dashboard/sections";
import { PortalHero, StatTile } from "@/components/portal/dashboard/ui";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Kundenportal – Übersicht" };

/** Startseite nach der Anmeldung: laufende Aufträge, offene Rechnungen, Dokumente. */
export default async function DashboardPage({ searchParams }: PageProps<"/kundenportal">) {
  const me = await requireCustomer(routes.portal);
  const params = await searchParams;
  const firstName = me.customer.firstName;

  if (!me.user.emailVerified) {
    return (
      <>
        <PortalHero eyebrow="Kundenportal" title={`Willkommen, ${firstName}!`} text="Nur noch ein Schritt bis zu Ihrem Kundenportal." />
        <Container className="relative z-10 -mt-24 pb-24">
          <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-elevated ring-1 ring-primary/5 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-primary">Bitte bestätigen Sie Ihre E-Mail-Adresse</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Wir haben einen Bestätigungslink an <strong className="text-primary">{me.user.email}</strong> gesendet. Nach der
              Bestätigung sehen Sie hier alle Aufträge, Dokumente und Rechnungen. Der Link ist 24 Stunden gültig.
            </p>
            <div className="mt-8">
              <ResendVerificationButton />
            </div>
          </section>
        </Container>
      </>
    );
  }

  const overview = await apiServer<PortalOverview>("/portal/overview");
  const { stats } = overview;

  return (
    <>
      <PortalHero
        eyebrow={`Kundennummer ${overview.customer.customerNumber}`}
        title={`${greeting()}, ${firstName}.`}
        text="Hier finden Sie alle Aufträge, Termine und Dokumente an einem Ort."
      />

      <Container className="relative z-10 -mt-24 space-y-6 pb-24">
        {params.willkommen && <AuthAlert tone="success">Willkommen bei FA Transport – Ihr Konto ist eingerichtet.</AuthAlert>}
        {params.verifiziert && <AuthAlert tone="success">Vielen Dank – Ihre E-Mail-Adresse ist bestätigt.</AuthAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            icon="truck"
            label="Laufende Aufträge"
            value={String(stats.activeShipments)}
            detail={stats.activeShipments === 0 ? "Keine aktiven Aufträge" : "in Planung oder unterwegs"}
          />
          <StatTile
            icon="coins"
            label="Offene Rechnungen"
            value={String(stats.openInvoices)}
            detail={
              stats.overdueInvoices > 0
                ? `${stats.overdueInvoices} überfällig · ${formatEuro(stats.openInvoicesGrossCents)}`
                : stats.openInvoices > 0
                  ? `Summe ${formatEuro(stats.openInvoicesGrossCents)}`
                  : "Alles beglichen"
            }
            highlight={stats.overdueInvoices > 0 ? "warning" : undefined}
          />
          <StatTile icon="file-text" label="Dokumente" value={String(stats.documents)} detail="Belege, Zoll- und Frachtpapiere" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ShipmentsPanel shipments={overview.activeShipments} total={stats.activeShipments} />
          <SupportCard />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InvoicesPanel invoices={overview.openInvoices} />
          <DocumentsPanel documents={overview.recentDocuments} />
        </div>
      </Container>
    </>
  );
}
