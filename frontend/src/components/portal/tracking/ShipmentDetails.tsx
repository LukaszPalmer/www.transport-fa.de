import type { DocumentItem, ShipmentDetail, ShipmentStatus, StopView } from "@fa/shared";
import { Download, Printer, Truck } from "lucide-react";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { getService } from "@/content/services";
import { defineMessages, type Locale } from "@/i18n/config";
import { documentUrl } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, formatFileSize, portalLabels } from "@/lib/portal-format";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Panel, StatusBadge } from "../dashboard/ui";

/** Regulärer Ablauf eines Auftrags – für die Zeitleiste. */
const FLOW: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT", "DELIVERED"];

const messages = defineMessages({
  de: {
    driver: "Ihr Fahrer",
    plate: (plate: string) => `Kennzeichen ${plate}`,
    driverPending: "Wird zugewiesen, sobald die Tour geplant ist.",
    eta: "Voraussichtliche Ankunft",
    plannedDelivery: "Geplante Lieferung",
    tbd: "Wird abgestimmt",
    pickupAt: (time: string) => `Abholung ${time}`,
    distance: "Strecke",
    covered: (covered: number, total: number) => `${covered} von ${total} km`,
    progress: "Fortschritt der Fahrt",
    status: "Status",
    cancelled: "Dieser Auftrag wurde storniert.",
    job: "Auftrag",
    pickup: "Abholung",
    delivery: "Lieferung",
    jobNumber: "Auftragsnummer",
    service: "Leistung",
    cargo: "Ladung",
    reference: "Ihre Referenz",
    documents: "Dokumente zu diesem Auftrag",
    upload: "Hochladen",
    noDocuments: "Noch keine Dokumente",
    noDocumentsText: "Laden Sie Zoll- und Frachtpapiere unter „Dokumente“ hoch und ordnen Sie sie diesem Auftrag zu – wir geben sie dem Fahrer mit.",
    handToDriver: "Dem Fahrer mitgeben",
    view: "Ansehen & Drucken",
    downloadLabel: (title: string) => `${title} herunterladen`,
    allDocuments: "Alle Dokumente",
    manage: " ansehen und verwalten.",
  },
  en: {
    driver: "Your driver",
    plate: (plate: string) => `Registration ${plate}`,
    driverPending: "Assigned as soon as the route is planned.",
    eta: "Estimated arrival",
    plannedDelivery: "Planned delivery",
    tbd: "To be agreed",
    pickupAt: (time: string) => `Pickup ${time}`,
    distance: "Distance",
    covered: (covered: number, total: number) => `${covered} of ${total} km`,
    progress: "Journey progress",
    status: "Status",
    cancelled: "This job has been cancelled.",
    job: "Job",
    pickup: "Pickup",
    delivery: "Delivery",
    jobNumber: "Job number",
    service: "Service",
    cargo: "Load",
    reference: "Your reference",
    documents: "Documents for this job",
    upload: "Upload",
    noDocuments: "No documents yet",
    noDocumentsText: "Upload customs and freight papers under “Documents” and assign them to this job – we'll give them to the driver.",
    handToDriver: "Hand to the driver",
    view: "View & print",
    downloadLabel: (title: string) => `Download ${title}`,
    allDocuments: "View and manage",
    manage: " all documents.",
  },
});

export function ShipmentFacts({ shipment, locale }: { shipment: ShipmentDetail; locale: Locale }) {
  const t = messages[locale];
  const arrival = shipment.live.etaAt ?? shipment.plannedDeliveryAt;
  const totalKm = shipment.route ? Math.round(shipment.route.distanceMeters / 1000) : undefined;
  const coveredKm = shipment.live.distanceCoveredMeters !== undefined ? Math.round(shipment.live.distanceCoveredMeters / 1000) : undefined;
  const progress = totalKm && coveredKm !== undefined ? Math.min(100, Math.round((coveredKm / totalKm) * 100)) : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Truck aria-hidden="true" className="size-4 text-accent-ink" />
          {t.driver}
        </p>
        {shipment.driver ? (
          <>
            <p className="mt-2 font-display text-lg font-bold text-primary">
              {shipment.driver.firstName} {shipment.driver.lastName}
            </p>
            <a href={`tel:${shipment.driver.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline">
              <Icon name="phone" className="size-4" />
              {shipment.driver.phone}
            </a>
            {shipment.vehicle && <p className="mt-1 text-sm text-slate-500">{t.plate(shipment.vehicle.plate)}</p>}
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{t.driverPending}</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Icon name="clock" className="size-4 text-accent-ink" />
          {shipment.live.etaAt ? t.eta : t.plannedDelivery}
        </p>
        <p className="mt-2 font-display text-lg font-bold text-primary">{arrival ? formatDateTime(arrival, locale) : t.tbd}</p>
        {shipment.plannedPickupAt && <p className="mt-1 text-sm text-slate-500">{t.pickupAt(formatDateTime(shipment.plannedPickupAt, locale))}</p>}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Icon name="map-pin" className="size-4 text-accent-ink" />
          {t.distance}
        </p>
        <p className="mt-2 font-display text-lg font-bold text-primary">
          {coveredKm !== undefined && totalKm ? t.covered(coveredKm, totalKm) : totalKm ? `${totalKm} km` : "–"}
        </p>
        {progress !== undefined && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={t.progress}>
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ShipmentTimeline({ shipment, locale }: { shipment: ShipmentDetail; locale: Locale }) {
  const t = messages[locale];
  const statusLabels = portalLabels(locale).shipmentStatus;
  const reached = new Map(shipment.statusHistory.map((change) => [change.status, change.at]));
  const cancelled = shipment.status === "CANCELLED";
  const currentIndex = FLOW.indexOf(shipment.status);

  return (
    <Panel title={t.status} icon="activity">
      <ol className="space-y-0">
        {FLOW.map((status, index) => {
          const at = reached.get(status);
          const done = !cancelled && (index <= currentIndex || Boolean(at));
          const current = !cancelled && index === currentIndex;
          return (
            <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
              {index < FLOW.length - 1 && (
                <span aria-hidden="true" className={cn("absolute top-7 left-[11px] h-[calc(100%-1.25rem)] w-0.5", done && index < currentIndex ? "bg-accent" : "bg-slate-200")} />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                  current ? "bg-accent" : done ? "bg-primary" : "bg-slate-200",
                )}
              >
                {done && !current && <Icon name="check" className="size-3.5 text-white" strokeWidth={3} />}
                {current && <span className="size-2 animate-pulse rounded-full bg-primary" />}
              </span>
              <div>
                <p className={cn("font-semibold", done ? "text-primary" : "text-slate-400")}>{statusLabels[status].label}</p>
                {at && <p className="text-sm text-slate-500">{formatDateTime(at, locale)}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {cancelled && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{t.cancelled}</p>}
    </Panel>
  );
}

function StopBlock({ label, marker, stop, date, locale }: { label: string; marker: string; stop: StopView; date?: string; locale: Locale }) {
  return (
    <div className="flex gap-4">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", marker === "A" ? "bg-primary text-white" : "border-[3px] border-accent bg-white text-primary")}>
        {marker}
      </span>
      <div className="text-sm">
        <p className="font-semibold text-primary">{label}</p>
        <p className="text-slate-600">
          {stop.street}, {stop.postalCode} {stop.city}
          {stop.countryCode !== "DE" && ` (${stop.countryCode})`}
        </p>
        {date && <p className="text-slate-500">{formatDateTime(date, locale)}</p>}
      </div>
    </div>
  );
}

export function ShipmentRouteInfo({ shipment, locale }: { shipment: ShipmentDetail; locale: Locale }) {
  const t = messages[locale];
  const service = getService(shipment.service, locale);
  return (
    <Panel title={t.job} icon="package">
      <div className="space-y-5">
        <StopBlock label={t.pickup} marker="A" stop={shipment.pickup} date={shipment.plannedPickupAt} locale={locale} />
        <StopBlock label={t.delivery} marker="B" stop={shipment.delivery} date={shipment.plannedDeliveryAt} locale={locale} />
      </div>
      <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">{t.jobNumber}</dt>
          <dd className="font-semibold text-primary">{shipment.shipmentNumber}</dd>
        </div>
        {service && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.service}</dt>
            <dd className="font-semibold text-primary">{service.name}</dd>
          </div>
        )}
        {shipment.cargoDescription && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.cargo}</dt>
            <dd className="text-right font-semibold text-primary">{shipment.cargoDescription}</dd>
          </div>
        )}
        {shipment.customerReference && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.reference}</dt>
            <dd className="font-semibold text-primary">{shipment.customerReference}</dd>
          </div>
        )}
      </dl>
    </Panel>
  );
}

export function ShipmentDocuments({ documents, locale }: { documents: DocumentItem[]; locale: Locale }) {
  const t = messages[locale];
  const labels = portalLabels(locale);
  return (
    <Panel title={t.documents} icon="file-text" action={{ label: t.upload, href: routes.portalDocuments }}>
      {documents.length === 0 ? (
        <EmptyState title={t.noDocuments} text={t.noDocumentsText} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {documents.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate font-semibold text-primary">{document.title}</p>
                <p className="text-sm text-slate-500">
                  {labels.documentCategoryLabel[document.category]} · {formatDate(document.createdAt, locale)} ·{" "}
                  {formatFileSize(document.sizeBytes, locale)}
                </p>
                {document.handToDriver && (
                  <span className="mt-1 inline-block">
                    <StatusBadge tone="info">{t.handToDriver}</StatusBadge>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <a href={documentUrl(document.id, "view")} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-primary hover:bg-slate-50">
                  <Printer aria-hidden="true" className="size-4" />
                  {t.view}
                </a>
                <a href={documentUrl(document.id, "download")} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-primary hover:bg-slate-50" aria-label={t.downloadLabel(document.title)}>
                  <Download aria-hidden="true" className="size-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-xs text-slate-500">
        <Link href={routes.portalDocuments} className="font-semibold text-accent-ink hover:underline">
          {t.allDocuments}
        </Link>
        {t.manage}
      </p>
    </Panel>
  );
}
