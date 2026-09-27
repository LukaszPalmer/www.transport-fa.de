import type { DocumentSummary, InvoiceSummary, ShipmentSummary } from "@fa/shared";
import Link from "next/link";
import { getTrackingApp } from "@/content/app";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { getService } from "@/content/services";
import { defineMessages, type Locale } from "@/i18n/config";
import { formatDate, formatDateTime, formatEuro, formatFileSize, portalLabels } from "@/lib/portal-format";
import { Icon } from "@/components/ui/Icon";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { EmptyState, Panel, StatusBadge } from "./ui";

const messages = defineMessages({
  de: {
    shipments: "Laufende Aufträge",
    toTracking: "Zum Tracking",
    noShipments: "Aktuell keine laufenden Aufträge",
    noShipmentsText:
      "Sobald wir einen Auftrag für Sie anlegen – ob Umzug, Entrümpelung oder Transport –, sehen Sie hier Status, Termine und Ihren Fahrer.",
    newEnquiry: "Neue Anfrage stellen",
    more: (count: number) => `und ${count} weitere Aufträge`,
    job: "Auftrag",
    appointment: "Termin",
    driver: "Fahrer",
    eta: "Voraussichtliche Ankunft ",
    planned: "Geplant ",
    openInvoices: "Offene Rechnungen",
    allReceipts: "Alle Belege",
    noInvoices: "Keine offenen Rechnungen",
    noInvoicesText: "Neue Rechnungen, Angebote und Auftragsbestätigungen finden Sie unter „Rechnungen“, sobald wir sie Ihnen senden.",
    dueOn: (date: string) => `Fällig am ${date}`,
    issuedOn: (date: string) => `Vom ${date}`,
    latestDocuments: "Neueste Dokumente",
    allDocuments: "Alle Dokumente",
    noDocuments: "Noch keine Dokumente",
    noDocumentsText: "Zolldokumente, Frachtpapiere, Abliefernachweise und Belege erscheinen hier.",
    upload: "Dokument hochladen",
    support: "Ihr direkter Draht",
    chatHint: "Schreiben Sie uns jederzeit über den Live-Chat unten rechts.",
    appTitle: "Ihre Aufträge bald auch als App",
    appText:
      "Live-Position, Ankunftszeit und Push-Nachrichten bei jedem Statuswechsel – kostenlos für iOS und Android. Sie melden sich mit Ihrem Kundenportal-Zugang an. Bis dahin finden Sie alles hier im Portal.",
    comingSoon: "Bald verfügbar",
    comingSoonTooltip: "App folgt in Kürze",
  },
  en: {
    shipments: "Current jobs",
    toTracking: "Go to tracking",
    noShipments: "No current jobs",
    noShipmentsText:
      "As soon as we create a job for you – whether a removal, clearance or transport – you will see its status, dates and your driver here.",
    newEnquiry: "Send a new enquiry",
    more: (count: number) => `and ${count} more ${count === 1 ? "job" : "jobs"}`,
    job: "Job",
    appointment: "Date",
    driver: "Driver",
    eta: "Estimated arrival ",
    planned: "Planned ",
    openInvoices: "Open invoices",
    allReceipts: "All documents",
    noInvoices: "No open invoices",
    noInvoicesText: "New invoices, quotes and order confirmations appear under “Invoices” as soon as we send them to you.",
    dueOn: (date: string) => `Due on ${date}`,
    issuedOn: (date: string) => `Issued ${date}`,
    latestDocuments: "Latest documents",
    allDocuments: "All documents",
    noDocuments: "No documents yet",
    noDocumentsText: "Customs documents, freight papers, proofs of delivery and receipts appear here.",
    upload: "Upload a document",
    support: "Your direct line",
    chatHint: "Write to us any time via the live chat at the bottom right.",
    appTitle: "Your jobs soon available as an app",
    appText:
      "Live position, arrival time and push notifications at every status change – free for iOS and Android. You sign in with your customer portal account. Until then, you'll find everything here in the portal.",
    comingSoon: "Coming soon",
    comingSoonTooltip: "App coming soon",
  },
});

export function ShipmentsPanel({ shipments, total, locale }: { shipments: ShipmentSummary[]; total: number; locale: Locale }) {
  const t = messages[locale];
  return (
    <Panel title={t.shipments} icon="truck" className="lg:col-span-2" action={shipments.length > 0 ? { label: t.toTracking, href: routes.portalTracking } : undefined}>
      {shipments.length === 0 ? (
        <EmptyState title={t.noShipments} text={t.noShipmentsText} action={{ label: t.newEnquiry, href: routes.contactForm }} />
      ) : (
        <ul className="space-y-4">
          {shipments.map((shipment) => (
            <ShipmentItem key={shipment.id} shipment={shipment} locale={locale} />
          ))}
          {total > shipments.length && <li className="text-sm text-slate-500">{t.more(total - shipments.length)}</li>}
        </ul>
      )}
    </Panel>
  );
}

function ShipmentItem({ shipment, locale }: { shipment: ShipmentSummary; locale: Locale }) {
  const t = messages[locale];
  const status = portalLabels(locale).shipmentStatus[shipment.status];
  const service = getService(shipment.service, locale);
  const nextDate = shipment.etaAt ?? shipment.plannedDeliveryAt ?? shipment.plannedPickupAt;

  return (
    <li className="relative rounded-2xl border border-slate-200 p-5 transition-colors hover:border-accent/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {service?.name ?? t.job} · {shipment.shipmentNumber}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-lg font-bold text-primary">
            <Link href={`${routes.portalTracking}?sendung=${shipment.id}`} className="after:absolute after:inset-0">
              {shipment.pickupCity}
            </Link>
            <Icon name="arrow-right" className="size-4 text-accent-ink" />
            {shipment.deliveryCity}
          </p>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {nextDate && (
          <div className="flex items-center gap-2 text-slate-600">
            <Icon name="calendar-check" className="size-4 text-slate-400" />
            <dt className="sr-only">{t.appointment}</dt>
            <dd>
              {shipment.etaAt ? t.eta : t.planned}
              <span className="font-semibold text-primary">{formatDateTime(nextDate, locale)}</span>
            </dd>
          </div>
        )}
        {shipment.driver && (
          <div className="flex items-center gap-2 text-slate-600">
            <Icon name="phone" className="size-4 text-slate-400" />
            <dt className="sr-only">{t.driver}</dt>
            <dd>
              {shipment.driver.firstName} {shipment.driver.lastName} ·{" "}
              <a href={`tel:${shipment.driver.phone}`} className="relative z-10 font-semibold text-accent-ink hover:underline">
                {shipment.driver.phone}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}

export function InvoicesPanel({ invoices, locale }: { invoices: InvoiceSummary[]; locale: Locale }) {
  const t = messages[locale];
  const labels = portalLabels(locale);
  return (
    <Panel title={t.openInvoices} icon="coins" action={{ label: t.allReceipts, href: routes.portalInvoices }}>
      {invoices.length === 0 ? (
        <EmptyState title={t.noInvoices} text={t.noInvoicesText} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {invoices.map((invoice) => {
            const status = invoice.paymentStatus ? labels.paymentStatus[invoice.paymentStatus] : undefined;
            return (
              <li key={invoice.id} className="relative flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">
                    <Link href={`${routes.portalInvoices}?beleg=${invoice.id}`} className="after:absolute after:inset-0 hover:text-accent-ink">
                      {labels.invoiceTypeLabel[invoice.type]} {invoice.number}
                    </Link>
                  </p>
                  <p className="text-sm text-slate-500">
                    {invoice.dueDate ? t.dueOn(formatDate(invoice.dueDate, locale)) : t.issuedOn(formatDate(invoice.issueDate, locale))}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-semibold text-primary">{formatEuro(invoice.grossCents, locale)}</span>
                  {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function DocumentsPanel({ documents, locale }: { documents: DocumentSummary[]; locale: Locale }) {
  const t = messages[locale];
  const labels = portalLabels(locale);
  return (
    <Panel title={t.latestDocuments} icon="file-text" action={{ label: t.allDocuments, href: routes.portalDocuments }}>
      {documents.length === 0 ? (
        <EmptyState title={t.noDocuments} text={t.noDocumentsText} action={{ label: t.upload, href: routes.portalDocuments }} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-accent-ink ring-1 ring-slate-200">
                  <Icon name="file-text" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">{document.title}</p>
                  <p className="text-sm text-slate-500">
                    {labels.documentCategoryLabel[document.category]} · {formatDate(document.createdAt, locale)} ·{" "}
                    {formatFileSize(document.sizeBytes, locale)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function SupportCard({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return (
    <section aria-labelledby="support-title" className="rounded-3xl bg-primary p-6 text-white shadow-card sm:p-8">
      <h2 id="support-title" className="font-display text-lg font-bold">
        {t.support}
      </h2>
      <p className="mt-2 text-sm text-slate-300">{locale === "en" ? company.hoursEn : company.contact.hours}</p>
      <ul className="mt-5 space-y-3 text-sm">
        <li className="flex items-center gap-3">
          <Icon name="phone" className="size-4 text-accent" />
          <a href={company.contact.phoneHref} className="font-semibold hover:text-accent">
            {company.contact.phone}
          </a>
        </li>
        <li className="flex items-center gap-3">
          <Icon name="mail" className="size-4 text-accent" />
          <a href={`mailto:${company.contact.email}`} className="font-semibold hover:text-accent">
            {company.contact.email}
          </a>
        </li>
      </ul>
      <p className="mt-6 rounded-xl bg-white/5 p-4 text-sm text-slate-300 ring-1 ring-white/10">
        <Icon name="message" className="mr-2 inline size-4 text-accent" />
        {t.chatHint}
      </p>
    </section>
  );
}

/** FA Tracking App – im Portal angekündigt, solange die Apps noch nicht in den Stores sind. */
export function TrackingAppCard({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const { trackingApp } = getTrackingApp(locale);
  return (
    <section aria-labelledby="tracking-app-card-title" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-primary/5 sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">
            <Icon name="smartphone" className="size-4" />
            {trackingApp.eyebrow}
          </p>
          <h2 id="tracking-app-card-title" className="mt-2 font-display text-lg font-bold text-primary">
            {t.appTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.appText}</p>
        </div>
        <StoreBadges height={40} label={t.comingSoon} tooltip={t.comingSoonTooltip} className="shrink-0" />
      </div>
    </section>
  );
}
