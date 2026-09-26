import type { ShipmentDetail, ShipmentListResponse, ShipmentSummary } from "@fa/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { formatDate, shipmentStatus } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { EmptyState, Panel, PortalHero, StatusBadge } from "@/components/portal/dashboard/ui";
import { LiveTrackingMap } from "@/components/portal/tracking/LiveTrackingMap";
import { ShipmentDocuments, ShipmentFacts, ShipmentRouteInfo, ShipmentTimeline } from "@/components/portal/tracking/ShipmentDetails";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Kundenportal – Tracking" };

/** Sendungsverfolgung: Aufträge links, gewählter Auftrag mit Live-Karte rechts. */
export default async function TrackingPage({ searchParams }: PageProps<"/kundenportal/tracking">) {
  const me = await requireCustomer(routes.portalTracking);
  const { sendung } = await searchParams;

  if (!me.user.emailVerified) {
    return (
      <>
        <PortalHero eyebrow="Tracking" title="Sendungsverfolgung" />
        <Container className="relative z-10 -mt-24 pb-24">
          <EmptyState title="Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse" text="Danach sehen Sie hier Ihre Aufträge live." action={{ label: "Zur Übersicht", href: routes.portal }} />
        </Container>
      </>
    );
  }

  const { active, past } = await apiServer<ShipmentListResponse>("/portal/shipments");
  const all = [...active, ...past];
  const selectedId = typeof sendung === "string" && all.some((shipment) => shipment.id === sendung) ? sendung : (active[0] ?? past[0])?.id;
  const selected = selectedId ? await apiServer<ShipmentDetail>(`/portal/shipments/${selectedId}`) : undefined;

  return (
    <>
      <PortalHero
        eyebrow="Tracking"
        title={selected ? `${selected.pickupCity} → ${selected.deliveryCity}` : "Sendungsverfolgung"}
        text={selected ? `${selected.shipmentNumber} · ${shipmentStatus[selected.status].label}` : "Verfolgen Sie Ihre Aufträge live – mit Fahrer, Ankunftszeit und Route."}
      />

      <Container className="relative z-10 -mt-24 pb-24">
        {!selected ? (
          <Panel title="Keine Aufträge" icon="truck">
            <EmptyState
              title="Aktuell gibt es nichts zu verfolgen"
              text="Sobald wir einen Auftrag für Sie planen, sehen Sie hier Status, Fahrer und – während der Fahrt – die Live-Position des LKW."
              action={{ label: "Neue Anfrage stellen", href: routes.contactForm }}
            />
          </Panel>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <aside className="space-y-4 lg:order-first">
              <ShipmentList title="Laufende Aufträge" shipments={active} selectedId={selected.id} />
              {past.length > 0 && <ShipmentList title="Abgeschlossen" shipments={past} selectedId={selected.id} />}
            </aside>

            <div className="space-y-6 lg:col-span-2">
              <LiveTrackingMap
                key={selected.id}
                shipmentId={selected.id}
                pickup={selected.pickup}
                delivery={selected.delivery}
                routePolyline={selected.route?.polyline}
                initialLive={selected.live}
              />
              <ShipmentFacts shipment={selected} />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ShipmentTimeline shipment={selected} />
                <ShipmentRouteInfo shipment={selected} />
              </div>
              <ShipmentDocuments documents={selected.documents} />
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

function ShipmentList({ title, shipments, selectedId }: { title: string; shipments: ShipmentSummary[]; selectedId: string }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-primary/5">
      <h2 className="px-2 pt-1 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h2>
      {shipments.length === 0 ? (
        <p className="px-2 pb-2 text-sm text-slate-500">Keine</p>
      ) : (
        <ul className="space-y-1">
          {shipments.map((shipment) => {
            const status = shipmentStatus[shipment.status];
            const active = shipment.id === selectedId;
            return (
              <li key={shipment.id}>
                <Link
                  href={`${routes.portalTracking}?sendung=${shipment.id}`}
                  aria-current={active ? "true" : undefined}
                  className={cn("block rounded-2xl p-3 transition-colors", active ? "bg-primary text-white" : "hover:bg-surface")}
                >
                  <p className={cn("flex items-center gap-1.5 font-semibold", active ? "text-white" : "text-primary")}>
                    {shipment.pickupCity}
                    <Icon name="arrow-right" className={cn("size-3.5", active ? "text-accent" : "text-accent-ink")} />
                    {shipment.deliveryCity}
                  </p>
                  <p className={cn("mt-0.5 text-xs", active ? "text-slate-300" : "text-slate-500")}>
                    {shipment.shipmentNumber}
                    {shipment.plannedPickupAt && ` · ${formatDate(shipment.plannedPickupAt)}`}
                  </p>
                  <span className="mt-2 inline-block">
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
