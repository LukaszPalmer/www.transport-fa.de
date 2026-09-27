import type { ShipmentDetail, ShipmentListResponse, ShipmentSummary } from "@fa/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { defineMessages, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { formatDate, portalLabels } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { TrackingAppCard } from "@/components/portal/dashboard/sections";
import { EmptyState, Panel, PortalHero, StatusBadge } from "@/components/portal/dashboard/ui";
import { LiveTrackingMap } from "@/components/portal/tracking/LiveTrackingMap";
import { ShipmentDocuments, ShipmentFacts, ShipmentRouteInfo, ShipmentTimeline } from "@/components/portal/tracking/ShipmentDetails";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Tracking",
    title: "Sendungsverfolgung",
    verifyFirst: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse",
    verifyText: "Danach sehen Sie hier Ihre Aufträge live.",
    toOverview: "Zur Übersicht",
    heroText: "Verfolgen Sie Ihre Aufträge live – mit Fahrer, Ankunftszeit und Route.",
    noJobs: "Keine Aufträge",
    nothing: "Aktuell gibt es nichts zu verfolgen",
    nothingText: "Sobald wir einen Auftrag für Sie planen, sehen Sie hier Status, Fahrer und – während der Fahrt – die Live-Position des LKW.",
    newEnquiry: "Neue Anfrage stellen",
    active: "Laufende Aufträge",
    past: "Abgeschlossen",
    none: "Keine",
  },
  en: {
    metaTitle: "Customer portal – Tracking",
    title: "Shipment tracking",
    verifyFirst: "Please confirm your email address first",
    verifyText: "After that you can follow your jobs live here.",
    toOverview: "Go to overview",
    heroText: "Follow your jobs live – with driver, arrival time and route.",
    noJobs: "No jobs",
    nothing: "Nothing to track right now",
    nothingText: "As soon as we plan a job for you, you'll see its status, driver and – during the journey – the truck's live position here.",
    newEnquiry: "Send a new enquiry",
    active: "Current jobs",
    past: "Completed",
    none: "None",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

/** Sendungsverfolgung: Aufträge links, gewählter Auftrag mit Live-Karte rechts. */
export default async function TrackingPage({ searchParams }: PageProps<"/[lang]/kundenportal/tracking">) {
  const me = await requireCustomer(routes.portalTracking);
  const locale = await getLocale();
  const t = messages[locale];
  const { sendung } = await searchParams;

  if (!me.user.emailVerified) {
    return (
      <>
        <PortalHero eyebrow="Tracking" title={t.title} />
        <Container className="relative z-10 -mt-24 pb-24">
          <EmptyState title={t.verifyFirst} text={t.verifyText} action={{ label: t.toOverview, href: routes.portal }} />
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
        title={selected ? `${selected.pickupCity} → ${selected.deliveryCity}` : t.title}
        text={selected ? `${selected.shipmentNumber} · ${portalLabels(locale).shipmentStatus[selected.status].label}` : t.heroText}
      />

      <Container className="relative z-10 -mt-24 pb-24">
        {!selected ? (
          <Panel title={t.noJobs} icon="truck">
            <EmptyState title={t.nothing} text={t.nothingText} action={{ label: t.newEnquiry, href: routes.contactForm }} />
          </Panel>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <aside className="space-y-4 lg:order-first">
              <ShipmentList title={t.active} shipments={active} selectedId={selected.id} locale={locale} />
              {past.length > 0 && <ShipmentList title={t.past} shipments={past} selectedId={selected.id} locale={locale} />}
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
              <ShipmentFacts shipment={selected} locale={locale} />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ShipmentTimeline shipment={selected} locale={locale} />
                <ShipmentRouteInfo shipment={selected} locale={locale} />
              </div>
              <ShipmentDocuments documents={selected.documents} locale={locale} />
            </div>
          </div>
        )}
        <div className="mt-6">
          <TrackingAppCard locale={locale} />
        </div>
      </Container>
    </>
  );
}

function ShipmentList({ title, shipments, selectedId, locale }: { title: string; shipments: ShipmentSummary[]; selectedId: string; locale: Locale }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-primary/5">
      <h2 className="px-2 pt-1 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h2>
      {shipments.length === 0 ? (
        <p className="px-2 pb-2 text-sm text-slate-500">{messages[locale].none}</p>
      ) : (
        <ul className="space-y-1">
          {shipments.map((shipment) => {
            const status = portalLabels(locale).shipmentStatus[shipment.status];
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
                    {shipment.plannedPickupAt && ` · ${formatDate(shipment.plannedPickupAt, locale)}`}
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
