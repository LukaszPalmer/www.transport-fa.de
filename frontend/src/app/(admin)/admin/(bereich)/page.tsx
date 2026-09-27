import { LEAD_STATUS_INFO, type AdminDashboard, type AdminShipmentList } from "@fa/shared";
import { AlertTriangle, ArrowRight, CalendarClock, FilePlus2, Inbox, MessagesSquare, Truck, UserRoundCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { formatRelative, leadStatusTone, leadTopicLabel, serviceLabel } from "@/lib/admin-format";
import { apiServer } from "@/lib/api/server";
import { formatDateTime, formatEuro, greeting, shipmentStatus } from "@/lib/portal-format";
import { MonthlyColumns } from "@/components/admin/charts/MonthlyColumns";
import { ShipmentTable } from "@/components/admin/orders/ShipmentTable";
import { AdminPage, Card } from "@/components/admin/ui";
import { StatusBadge } from "@/components/portal/dashboard/ui";
import { buttonClasses } from "@/components/ui/button-styles";

export const metadata: Metadata = { title: "Übersicht" };



export default async function AdminOverviewPage() {
  const me = await requireStaff();
  const canSeeOrders = can(me, "can_manage_orders") || can(me, "can_manage_drivers") || can(me, "can_view_customers");
  const [dashboard, unassigned] = await Promise.all([
    apiServer<AdminDashboard>("/admin/overview"),
    canSeeOrders ? apiServer<AdminShipmentList>("/admin/shipments?status=UNASSIGNED&limit=8") : null,
  ]);
  const { stats, finance } = dashboard;

  const tiles = [
    {
      label: "Kunden",
      value: stats.customers,
      detail: `${stats.newCustomersThisMonth} neu diesen Monat · ${stats.customersOnline} online`,
      icon: Users,
      href: routes.adminUsers,
      show: can(me, "can_view_customers"),
    },
    {
      label: "Neue Anfragen",
      value: stats.newLeads,
      detail: stats.followUpsDue ? `${stats.followUpsDue} Wiedervorlagen fällig` : "keine Wiedervorlage fällig",
      icon: Inbox,
      href: routes.adminLeads,
      show: can(me, "can_manage_leads"),
      warn: stats.followUpsDue > 0,
    },
    { label: "Aktive Aufträge", value: stats.activeShipments, detail: "geplant bis unterwegs", icon: Truck, href: routes.adminOrders, show: canSeeOrders },
    {
      label: "Ohne Fahrer",
      value: stats.unassignedShipments,
      detail: stats.unassignedShipments ? "Fahrer zuweisen" : "alles eingeplant",
      icon: UserRoundCheck,
      href: `${routes.adminOrders}?status=UNASSIGNED`,
      show: canSeeOrders,
      warn: stats.unassignedShipments > 0,
    },
    {
      label: "Offene Chats",
      value: stats.openChats,
      detail: stats.unreadChats ? `${stats.unreadChats} mit neuen Nachrichten` : "keine ungelesenen",
      icon: MessagesSquare,
      href: routes.adminChat,
      show: can(me, "can_chat"),
      warn: stats.unreadChats > 0,
    },
  ].filter((tile) => tile.show);

  return (
    <AdminPage
      title={`${greeting()}, ${me.staff.displayName.split(" ")[0]}`}
      description="Das Wichtigste auf einen Blick – Zahlen aktualisieren sich beim Neuladen, Chats und Online-Status live."
      actions={
        <>
          {can(me, "can_manage_leads") && (
            <Link href={`${routes.adminLeads}?neu=1`} className={buttonClasses({ variant: "outline", size: "sm" })}>
              <Inbox aria-hidden="true" className="size-4" /> Anfrage erfassen
            </Link>
          )}
          {can(me, "can_manage_invoices") && (
            <Link href={routes.adminInvoiceNew} className={buttonClasses({ variant: "dark", size: "sm" })}>
              <FilePlus2 aria-hidden="true" className="size-4" /> Rechnung erstellen
            </Link>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} className="group rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5 transition-shadow hover:shadow-card-hover">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <tile.icon aria-hidden="true" className="size-4 text-accent-ink" />
                {tile.label}
              </span>
              <ArrowRight aria-hidden="true" className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-primary">{tile.value}</p>
            <p className={tile.warn ? "mt-1 text-sm font-semibold text-amber-700" : "mt-1 text-sm text-slate-500"}>{tile.detail}</p>
          </Link>
        ))}
      </div>

      {finance && (
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card title="Einnahmen" description="Bezahlte Rechnungen nach Zahlungsdatum, brutto – inkl. Kunden, die ihr Konto gelöscht haben.">
            <p className="text-sm text-slate-500">Diesen Monat</p>
            <p className="font-display text-5xl font-bold text-primary">{formatEuro(finance.paidThisMonthGrossCents)}</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Dieses Jahr</dt>
                <dd className="font-semibold text-primary tabular-nums">{formatEuro(finance.paidThisYearGrossCents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Insgesamt</dt>
                <dd className="font-semibold text-primary tabular-nums">{formatEuro(finance.paidTotalGrossCents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Offen</dt>
                <dd className="font-semibold text-primary tabular-nums">{formatEuro(finance.openGrossCents)}</dd>
              </div>
              {finance.overdueCount > 0 && (
                <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
                  <dt className="flex items-center gap-1.5 font-semibold text-amber-700">
                    <AlertTriangle aria-hidden="true" className="size-4" /> Überfällig ({finance.overdueCount})
                  </dt>
                  <dd className="font-semibold text-amber-700 tabular-nums">{formatEuro(finance.overdueGrossCents)}</dd>
                </div>
              )}
            </dl>
            {can(me, "can_manage_invoices") && (
              <Link href={`${routes.adminInvoices}?filter=OVERDUE`} className="mt-5 inline-flex text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
                Überfällige Rechnungen ansehen
              </Link>
            )}
          </Card>
          <Card title="Umsatz der letzten 12 Monate" description="Rechnungsbetrag nach Rechnungsdatum und Zahlungseingang nach Zahlungsdatum, brutto." className="xl:col-span-2">
            <MonthlyColumns
              title="Rechnungsbetrag und Zahlungseingang je Monat"
              months={finance.months.map((entry) => entry.month)}
              series={[
                { key: "invoiced", label: "Rechnungsbetrag", values: finance.months.map((entry) => entry.invoicedGrossCents) },
                { key: "paid", label: "Zahlungseingang", values: finance.months.map((entry) => entry.paidGrossCents) },
              ]}
            />
          </Card>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {canSeeOrders && (
          <Card
            title="Anstehende Aufträge"
            description="Abholungen heute und in den nächsten 7 Tagen."
            action={
              <Link href={routes.adminOrders} className="text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
                Alle Aufträge
              </Link>
            }
          >
            {dashboard.upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">Keine Abholungen in den nächsten 7 Tagen geplant.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {dashboard.upcoming.map((shipment) => (
                  <li key={shipment.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <CalendarClock aria-hidden="true" className="size-4 text-accent-ink" />
                        {formatDateTime(shipment.plannedPickupAt)}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-slate-600">
                        {shipment.route} · {shipment.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {shipment.shipmentNumber} · {serviceLabel(shipment.service)} · {shipment.driverName ?? "noch kein Fahrer"}
                      </p>
                    </div>
                    <StatusBadge tone={shipmentStatus[shipment.status].tone}>{shipmentStatus[shipment.status].label}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {can(me, "can_manage_leads") && (
          <Card
            title="Neueste Anfragen"
            description="Aus dem Kontaktformular und manuell erfasst."
            action={
              <Link href={routes.adminLeads} className="text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
                Alle Anfragen
              </Link>
            }
          >
            {dashboard.recentLeads.length === 0 ? (
              <p className="text-sm text-slate-500">Noch keine Anfragen eingegangen.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {dashboard.recentLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link href={`${routes.adminLeads}/${lead.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-accent-ink">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-primary">{lead.name}</span>
                        <span className="block text-xs text-slate-500">
                          {lead.number} · {leadTopicLabel(lead.topic)} · {formatRelative(lead.createdAt)}
                        </span>
                      </span>
                      <StatusBadge tone={leadStatusTone[lead.status]}>{LEAD_STATUS_INFO[lead.status].label}</StatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>

      {unassigned && unassigned.shipments.length > 0 && (
        <Card
          className="mt-8"
          title="Aufträge ohne Fahrer"
          description="Zuweisen mit Name, Telefonnummer und Kennzeichen – der Kunde sieht die Daten im Tracking."
          action={
            <Link href={`${routes.adminOrders}?status=UNASSIGNED`} className="text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
              Alle anzeigen
            </Link>
          }
        >
          <ShipmentTable
            shipments={unassigned.shipments}
            canManageOrders={can(me, "can_manage_orders")}
            canManageDrivers={can(me, "can_manage_drivers")}
            emptyText="Alle aktiven Aufträge haben einen Fahrer."
          />
        </Card>
      )}

      {dashboard.activity && (
        <Card
          className="mt-8"
          title="Letzte Aktivitäten im Team"
          action={
            <Link href={routes.adminActivity} className="text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
              Vollständiges Protokoll
            </Link>
          }
        >
          {dashboard.activity.length === 0 ? (
            <p className="text-sm text-slate-500">Noch keine Aktivitäten.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {dashboard.activity.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span className="min-w-0">
                    <span className="font-semibold text-primary">{item.label}</span>
                    {item.target && <span className="text-slate-600"> · {item.target}</span>}
                    {item.customer && <span className="text-slate-600"> · {item.customer.name}</span>}
                    <span className="block text-xs text-slate-500">{item.actor ?? "System / Gast"}</span>
                  </span>
                  <span className="text-xs text-slate-500">{formatRelative(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </AdminPage>
  );
}
