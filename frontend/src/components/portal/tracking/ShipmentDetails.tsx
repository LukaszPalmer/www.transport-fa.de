import type { DocumentItem, ShipmentDetail, ShipmentStatus, StopView } from "@fa/shared";
import { Download, Printer, Truck } from "lucide-react";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { getService } from "@/content/services";
import { documentUrl } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { documentCategoryLabel, formatDate, formatDateTime, formatFileSize, shipmentStatus } from "@/lib/portal-format";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Panel, StatusBadge } from "../dashboard/ui";

/** Regulärer Ablauf eines Auftrags – für die Zeitleiste. */
const FLOW: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT", "DELIVERED"];

export function ShipmentFacts({ shipment }: { shipment: ShipmentDetail }) {
  const arrival = shipment.live.etaAt ?? shipment.plannedDeliveryAt;
  const totalKm = shipment.route ? Math.round(shipment.route.distanceMeters / 1000) : undefined;
  const coveredKm = shipment.live.distanceCoveredMeters !== undefined ? Math.round(shipment.live.distanceCoveredMeters / 1000) : undefined;
  const progress = totalKm && coveredKm !== undefined ? Math.min(100, Math.round((coveredKm / totalKm) * 100)) : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Truck aria-hidden="true" className="size-4 text-accent-ink" />
          Ihr Fahrer
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
            {shipment.vehicle && <p className="mt-1 text-sm text-slate-500">Kennzeichen {shipment.vehicle.plate}</p>}
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Wird zugewiesen, sobald die Tour geplant ist.</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Icon name="clock" className="size-4 text-accent-ink" />
          {shipment.live.etaAt ? "Voraussichtliche Ankunft" : "Geplante Lieferung"}
        </p>
        <p className="mt-2 font-display text-lg font-bold text-primary">{arrival ? formatDateTime(arrival) : "Wird abgestimmt"}</p>
        {shipment.plannedPickupAt && <p className="mt-1 text-sm text-slate-500">Abholung {formatDateTime(shipment.plannedPickupAt)}</p>}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Icon name="map-pin" className="size-4 text-accent-ink" />
          Strecke
        </p>
        <p className="mt-2 font-display text-lg font-bold text-primary">
          {coveredKm !== undefined && totalKm ? `${coveredKm} von ${totalKm} km` : totalKm ? `${totalKm} km` : "–"}
        </p>
        {progress !== undefined && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Fortschritt der Fahrt">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ShipmentTimeline({ shipment }: { shipment: ShipmentDetail }) {
  const reached = new Map(shipment.statusHistory.map((change) => [change.status, change.at]));
  const cancelled = shipment.status === "CANCELLED";
  const currentIndex = FLOW.indexOf(shipment.status);

  return (
    <Panel title="Status" icon="activity">
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
                <p className={cn("font-semibold", done ? "text-primary" : "text-slate-400")}>{shipmentStatus[status].label}</p>
                {at && <p className="text-sm text-slate-500">{formatDateTime(at)}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {cancelled && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Dieser Auftrag wurde storniert.</p>}
    </Panel>
  );
}

function StopBlock({ label, marker, stop, date }: { label: string; marker: string; stop: StopView; date?: string }) {
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
        {date && <p className="text-slate-500">{formatDateTime(date)}</p>}
      </div>
    </div>
  );
}

export function ShipmentRouteInfo({ shipment }: { shipment: ShipmentDetail }) {
  const service = getService(shipment.service);
  return (
    <Panel title="Auftrag" icon="package">
      <div className="space-y-5">
        <StopBlock label="Abholung" marker="A" stop={shipment.pickup} date={shipment.plannedPickupAt} />
        <StopBlock label="Lieferung" marker="B" stop={shipment.delivery} date={shipment.plannedDeliveryAt} />
      </div>
      <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Auftragsnummer</dt>
          <dd className="font-semibold text-primary">{shipment.shipmentNumber}</dd>
        </div>
        {service && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Leistung</dt>
            <dd className="font-semibold text-primary">{service.name}</dd>
          </div>
        )}
        {shipment.cargoDescription && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Ladung</dt>
            <dd className="text-right font-semibold text-primary">{shipment.cargoDescription}</dd>
          </div>
        )}
        {shipment.customerReference && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Ihre Referenz</dt>
            <dd className="font-semibold text-primary">{shipment.customerReference}</dd>
          </div>
        )}
      </dl>
    </Panel>
  );
}

export function ShipmentDocuments({ documents }: { documents: DocumentItem[] }) {
  return (
    <Panel title="Dokumente zu diesem Auftrag" icon="file-text" action={{ label: "Hochladen", href: routes.portalDocuments }}>
      {documents.length === 0 ? (
        <EmptyState
          title="Noch keine Dokumente"
          text="Laden Sie Zoll- und Frachtpapiere unter „Dokumente“ hoch und ordnen Sie sie diesem Auftrag zu – wir geben sie dem Fahrer mit."
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {documents.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate font-semibold text-primary">{document.title}</p>
                <p className="text-sm text-slate-500">
                  {documentCategoryLabel[document.category]} · {formatDate(document.createdAt)} · {formatFileSize(document.sizeBytes)}
                </p>
                {document.handToDriver && (
                  <span className="mt-1 inline-block">
                    <StatusBadge tone="info">Dem Fahrer mitgeben</StatusBadge>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <a href={documentUrl(document.id, "view")} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-primary hover:bg-slate-50">
                  <Printer aria-hidden="true" className="size-4" />
                  Ansehen & Drucken
                </a>
                <a href={documentUrl(document.id, "download")} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-primary hover:bg-slate-50" aria-label={`${document.title} herunterladen`}>
                  <Download aria-hidden="true" className="size-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-xs text-slate-500">
        <Link href={routes.portalDocuments} className="font-semibold text-accent-ink hover:underline">
          Alle Dokumente
        </Link>{" "}
        ansehen und verwalten.
      </p>
    </Panel>
  );
}
