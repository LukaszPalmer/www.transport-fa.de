import type { PortalOverview } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { apiServer } from "@/lib/api/server";
import { formatEuro, greeting } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { ResendVerificationButton } from "@/components/portal/AccountActions";
import { AuthAlert } from "@/components/portal/auth-fields";
import { DocumentsPanel, InvoicesPanel, ShipmentsPanel, SupportCard, TrackingAppCard } from "@/components/portal/dashboard/sections";
import { PortalHero, StatTile } from "@/components/portal/dashboard/ui";
import { Container } from "@/components/ui/Container";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Übersicht",
    portal: "Kundenportal",
    welcome: (name: string) => `Willkommen, ${name}!`,
    oneStep: "Nur noch ein Schritt bis zu Ihrem Kundenportal.",
    confirmTitle: "Bitte bestätigen Sie Ihre E-Mail-Adresse",
    confirmBefore: "Wir haben einen Bestätigungslink an ",
    confirmAfter: " gesendet. Nach der Bestätigung sehen Sie hier alle Aufträge, Dokumente und Rechnungen. Der Link ist 24 Stunden gültig.",
    customerNumber: (number: string) => `Kundennummer ${number}`,
    heroText: "Hier finden Sie alle Aufträge, Termine und Dokumente an einem Ort.",
    welcomeAlert: "Willkommen bei FA Transport – Ihr Konto ist eingerichtet.",
    verifiedAlert: "Vielen Dank – Ihre E-Mail-Adresse ist bestätigt.",
    activeShipments: "Laufende Aufträge",
    noActive: "Keine aktiven Aufträge",
    activeDetail: "in Planung oder unterwegs",
    openInvoices: "Offene Rechnungen",
    overdue: (count: number, sum: string) => `${count} überfällig · ${sum}`,
    sum: (sum: string) => `Summe ${sum}`,
    allPaid: "Alles beglichen",
    documents: "Dokumente",
    documentsDetail: "Belege, Zoll- und Frachtpapiere",
  },
  en: {
    metaTitle: "Customer portal – Overview",
    portal: "Customer portal",
    welcome: (name: string) => `Welcome, ${name}!`,
    oneStep: "Just one more step to your customer portal.",
    confirmTitle: "Please confirm your email address",
    confirmBefore: "We have sent a confirmation link to ",
    confirmAfter: ". Once confirmed, you will see all your jobs, documents and invoices here. The link is valid for 24 hours.",
    customerNumber: (number: string) => `Customer number ${number}`,
    heroText: "All your jobs, dates and documents in one place.",
    welcomeAlert: "Welcome to FA Transport – your account is set up.",
    verifiedAlert: "Thank you – your email address has been confirmed.",
    activeShipments: "Current jobs",
    noActive: "No active jobs",
    activeDetail: "planned or on the way",
    openInvoices: "Open invoices",
    overdue: (count: number, sum: string) => `${count} overdue · ${sum}`,
    sum: (sum: string) => `Total ${sum}`,
    allPaid: "All settled",
    documents: "Documents",
    documentsDetail: "Receipts, customs and freight papers",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

/** Startseite nach der Anmeldung: laufende Aufträge, offene Rechnungen, Dokumente. */
export default async function DashboardPage({ searchParams }: PageProps<"/[lang]/kundenportal">) {
  const me = await requireCustomer(routes.portal);
  const locale = await getLocale();
  const t = messages[locale];
  const params = await searchParams;
  const firstName = me.customer.firstName;

  if (!me.user.emailVerified) {
    return (
      <>
        <PortalHero eyebrow={t.portal} title={t.welcome(firstName)} text={t.oneStep} />
        <Container className="relative z-10 -mt-24 pb-24">
          <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-elevated ring-1 ring-primary/5 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-primary">{t.confirmTitle}</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {t.confirmBefore}
              <strong className="text-primary">{me.user.email}</strong>
              {t.confirmAfter}
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
        eyebrow={t.customerNumber(overview.customer.customerNumber)}
        title={`${greeting(new Date(), locale)}, ${firstName}.`}
        text={t.heroText}
      />

      <Container className="relative z-10 -mt-24 space-y-6 pb-24">
        {params.willkommen && <AuthAlert tone="success">{t.welcomeAlert}</AuthAlert>}
        {params.verifiziert && <AuthAlert tone="success">{t.verifiedAlert}</AuthAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            icon="truck"
            label={t.activeShipments}
            value={String(stats.activeShipments)}
            detail={stats.activeShipments === 0 ? t.noActive : t.activeDetail}
          />
          <StatTile
            icon="coins"
            label={t.openInvoices}
            value={String(stats.openInvoices)}
            detail={
              stats.overdueInvoices > 0
                ? t.overdue(stats.overdueInvoices, formatEuro(stats.openInvoicesGrossCents, locale))
                : stats.openInvoices > 0
                  ? t.sum(formatEuro(stats.openInvoicesGrossCents, locale))
                  : t.allPaid
            }
            highlight={stats.overdueInvoices > 0 ? "warning" : undefined}
          />
          <StatTile icon="file-text" label={t.documents} value={String(stats.documents)} detail={t.documentsDetail} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ShipmentsPanel shipments={overview.activeShipments} total={stats.activeShipments} locale={locale} />
          <SupportCard locale={locale} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InvoicesPanel invoices={overview.openInvoices} locale={locale} />
          <DocumentsPanel documents={overview.recentDocuments} locale={locale} />
        </div>

        <TrackingAppCard locale={locale} />
      </Container>
    </>
  );
}
