import type { AdminOverview, AdminShipmentList } from "@fa/shared";
import { ArrowRight, MessagesSquare, Truck, UserRoundCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { apiServer } from "@/lib/api/server";
import { greeting } from "@/lib/portal-format";
import { ShipmentTable } from "@/components/admin/orders/ShipmentTable";
import { AdminPage, Card } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Übersicht" };

export default async function AdminOverviewPage() {
  const me = await requireStaff();
  const canSeeOrders = can(me, "can_manage_orders") || can(me, "can_manage_drivers") || can(me, "can_view_customers");
  const [{ stats }, unassigned] = await Promise.all([
    apiServer<AdminOverview>("/admin/overview"),
    canSeeOrders ? apiServer<AdminShipmentList>("/admin/shipments?status=UNASSIGNED&limit=8") : null,
  ]);

  const tiles = [
    { label: "Kunden", value: stats.customers, detail: `${stats.customersOnline} gerade online`, icon: Users, href: routes.adminUsers, show: can(me, "can_view_customers") },
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
    <AdminPage title={`${greeting()}, ${me.staff.displayName.split(" ")[0]}`} description="Das Wichtigste auf einen Blick – Zahlen aktualisieren sich beim Neuladen, Chats und Online-Status live.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {unassigned && (
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
    </AdminPage>
  );
}
