import type { InvoiceListResponse } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { apiServer } from "@/lib/api/server";
import { formatEuro } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { EmptyState, PortalHero, StatTile } from "@/components/portal/dashboard/ui";
import { InvoiceLibrary } from "@/components/portal/invoices/InvoiceLibrary";
import { Container } from "@/components/ui/Container";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Rechnungen",
    eyebrow: "Rechnungen",
    title: "Rechnungen & Belege",
    verifyFirst: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse",
    verifyText: "Danach sehen Sie hier alle Rechnungen und Angebote.",
    toOverview: "Zur Übersicht",
    heroText: "Angebote, Auftragsbestätigungen und Rechnungen an einem Ort – jederzeit ansehen, ausdrucken und als PDF herunterladen.",
    openAmount: "Offener Betrag",
    allPaid: "Alles beglichen",
    openCount: (count: number) => `${count} offene ${count === 1 ? "Rechnung" : "Rechnungen"}`,
    overdue: "Überfällig",
    overdueDetail: "Bitte prüfen Sie die markierten Rechnungen",
    noOverdue: "Keine überfälligen Rechnungen",
    paid: "Bezahlt",
    paidDetail: "Beglichene Rechnungen",
  },
  en: {
    metaTitle: "Customer portal – Invoices",
    eyebrow: "Invoices",
    title: "Invoices & documents",
    verifyFirst: "Please confirm your email address first",
    verifyText: "After that you will see all invoices and quotes here.",
    toOverview: "Go to overview",
    heroText:
      "Quotes, order confirmations and invoices in one place – view, print and download them as PDF at any time. Invoices are issued in German, as required for German accounting.",
    openAmount: "Amount outstanding",
    allPaid: "All settled",
    openCount: (count: number) => `${count} open ${count === 1 ? "invoice" : "invoices"}`,
    overdue: "Overdue",
    overdueDetail: "Please check the highlighted invoices",
    noOverdue: "No overdue invoices",
    paid: "Paid",
    paidDetail: "Settled invoices",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

/** Rechnungen, Angebote, Auftragsbestätigungen und Gutschriften – ansehen, drucken, herunterladen. */
export default async function InvoicesPage({ searchParams }: PageProps<"/[lang]/kundenportal/rechnungen">) {
  const me = await requireCustomer(routes.portalInvoices);
  const locale = await getLocale();
  const t = messages[locale];

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

  const [{ invoices, stats }, params] = await Promise.all([apiServer<InvoiceListResponse>("/portal/invoices"), searchParams]);
  const highlightId = typeof params.beleg === "string" ? params.beleg : undefined;

  return (
    <>
      <PortalHero
        eyebrow={t.eyebrow}
        title={t.title}
        text={t.heroText}
      />

      <Container className="relative z-10 -mt-24 space-y-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            icon="coins"
            label={t.openAmount}
            value={formatEuro(stats.openGrossCents, locale)}
            detail={stats.openCount === 0 ? t.allPaid : t.openCount(stats.openCount)}
          />
          <StatTile
            icon="clock"
            label={t.overdue}
            value={String(stats.overdueCount)}
            detail={stats.overdueCount > 0 ? t.overdueDetail : t.noOverdue}
            highlight={stats.overdueCount > 0 ? "warning" : undefined}
          />
          <StatTile icon="check" label={t.paid} value={String(stats.paidCount)} detail={t.paidDetail} />
        </div>

        <InvoiceLibrary invoices={invoices} highlightId={highlightId} />
      </Container>
    </>
  );
}
