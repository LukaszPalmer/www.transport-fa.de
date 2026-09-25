import type { DocumentSummary, InvoiceSummary, ShipmentSummary } from "@fa/shared";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { getService } from "@/content/services";
import {
  documentCategoryLabel,
  formatDate,
  formatDateTime,
  formatEuro,
  formatFileSize,
  paymentStatus,
  shipmentStatus,
} from "@/lib/portal-format";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Panel, StatusBadge } from "./ui";

export function ShipmentsPanel({ shipments, total }: { shipments: ShipmentSummary[]; total: number }) {
  return (
    <Panel title="Laufende Aufträge" icon="truck" className="lg:col-span-2">
      {shipments.length === 0 ? (
        <EmptyState
          title="Aktuell keine laufenden Aufträge"
          text="Sobald wir einen Auftrag für Sie anlegen – ob Umzug, Entrümpelung oder Transport –, sehen Sie hier Status, Termine und Ihren Fahrer."
          action={{ label: "Neue Anfrage stellen", href: routes.contactForm }}
        />
      ) : (
        <ul className="space-y-4">
          {shipments.map((shipment) => (
            <ShipmentItem key={shipment.id} shipment={shipment} />
          ))}
          {total > shipments.length && (
            <li className="text-sm text-slate-500">und {total - shipments.length} weitere Aufträge</li>
          )}
        </ul>
      )}
    </Panel>
  );
}

function ShipmentItem({ shipment }: { shipment: ShipmentSummary }) {
  const status = shipmentStatus[shipment.status];
  const service = getService(shipment.service);
  const nextDate = shipment.etaAt ?? shipment.plannedDeliveryAt ?? shipment.plannedPickupAt;

  return (
    <li className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {service?.name ?? "Auftrag"} · {shipment.shipmentNumber}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-lg font-bold text-primary">
            {shipment.pickupCity}
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
            <dt className="sr-only">Termin</dt>
            <dd>
              {shipment.etaAt ? "Voraussichtliche Ankunft " : "Geplant "}
              <span className="font-semibold text-primary">{formatDateTime(nextDate)}</span>
            </dd>
          </div>
        )}
        {shipment.driver && (
          <div className="flex items-center gap-2 text-slate-600">
            <Icon name="phone" className="size-4 text-slate-400" />
            <dt className="sr-only">Fahrer</dt>
            <dd>
              {shipment.driver.firstName} {shipment.driver.lastName} ·{" "}
              <a href={`tel:${shipment.driver.phone}`} className="font-semibold text-accent-ink hover:underline">
                {shipment.driver.phone}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}

export function InvoicesPanel({ invoices }: { invoices: InvoiceSummary[] }) {
  return (
    <Panel title="Offene Rechnungen" icon="coins">
      {invoices.length === 0 ? (
        <EmptyState title="Keine offenen Rechnungen" text="Neue Rechnungen, Angebote und Auftragsbestätigungen finden Sie hier, sobald wir sie für Sie hinterlegen." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {invoices.map((invoice) => {
            const status = invoice.paymentStatus ? paymentStatus[invoice.paymentStatus] : undefined;
            return (
              <li key={invoice.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">Rechnung {invoice.number}</p>
                  <p className="text-sm text-slate-500">
                    {invoice.dueDate ? `Fällig am ${formatDate(invoice.dueDate)}` : `Vom ${formatDate(invoice.issueDate)}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-semibold text-primary">{formatEuro(invoice.grossCents)}</span>
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

export function DocumentsPanel({ documents }: { documents: DocumentSummary[] }) {
  return (
    <Panel title="Neueste Dokumente" icon="file-text">
      {documents.length === 0 ? (
        <EmptyState
          title="Noch keine Dokumente"
          text="Zolldokumente, Frachtpapiere, Abliefernachweise und Belege erscheinen hier – der Upload eigener Dokumente folgt in Kürze."
        />
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
                    {documentCategoryLabel[document.category]} · {formatDate(document.createdAt)} · {formatFileSize(document.sizeBytes)}
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

export function SupportCard() {
  return (
    <section aria-labelledby="support-title" className="rounded-3xl bg-primary p-6 text-white shadow-card sm:p-8">
      <h2 id="support-title" className="font-display text-lg font-bold">
        Ihr direkter Draht
      </h2>
      <p className="mt-2 text-sm text-slate-300">{company.contact.hours}</p>
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
        Der Live-Chat mit unserem Team kommt in Kürze direkt hier ins Portal.
      </p>
    </section>
  );
}
