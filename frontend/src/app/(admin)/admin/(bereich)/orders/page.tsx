import type { AdminShipmentList } from "@fa/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { CreateShipmentButton } from "@/components/admin/orders/CreateShipmentDialog";
import { ShipmentTable } from "@/components/admin/orders/ShipmentTable";
import { AdminPage, Card, NoAccess } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Aufträge" };

const FILTERS = [
  { value: "ACTIVE", label: "Aktiv" },
  { value: "UNASSIGNED", label: "Ohne Fahrer" },
  { value: "DELIVERED", label: "Abgeschlossen" },
  { value: "CANCELLED", label: "Storniert" },
  { value: "", label: "Alle" },
] as const;

/** Nur mit „Rechnungen & Belege“: abgeschlossene Aufträge, für die noch keine Rechnung existiert. */
const UNBILLED_FILTER = { value: "UNBILLED", label: "Nicht abgerechnet" } as const;

const PAGE_SIZE = 50;

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const me = await requireStaff();
  if (!can(me, "can_manage_orders") && !can(me, "can_manage_drivers") && !can(me, "can_view_customers")) return <NoAccess />;

  const params = await searchParams;
  const canManageInvoices = can(me, "can_manage_invoices");
  const filters = canManageInvoices ? [...FILTERS.slice(0, 3), UNBILLED_FILTER, ...FILTERS.slice(3)] : FILTERS;
  const requested = typeof params.status === "string" ? params.status : "ACTIVE";
  const status = requested === UNBILLED_FILTER.value && !canManageInvoices ? "ACTIVE" : requested;
  const q = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.seite) || 1);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (status) query.set("status", status);
  if (q) query.set("q", q);
  const data = await apiServer<AdminShipmentList>(`/admin/shipments?${query}`);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  const href = (next: Record<string, string>) => {
    const merged = new URLSearchParams({ status, ...(q ? { q } : {}), ...next });
    return `${routes.adminOrders}?${merged}`;
  };

  return (
    <AdminPage
      title="Aufträge"
      description={
        canManageInvoices
          ? "Status pflegen, Fahrer zuweisen und Rechnungen als offen oder bezahlt markieren – Kunden sehen Änderungen sofort im Portal."
          : "Status pflegen und Fahrer zuweisen – Kunden sehen Änderungen sofort im Tracking."
      }
      actions={can(me, "can_manage_orders") && can(me, "can_view_customers") ? <CreateShipmentButton /> : undefined}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter" className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.label}
              href={href({ status: filter.value, seite: "1" })}
              aria-current={status === filter.value ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
                status === filter.value ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <form action={routes.adminOrders} className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Auftragsnummer"
            aria-label="Nach Auftragsnummer suchen"
            className="h-10 w-48 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-accent-ink focus:outline-none"
          />
        </form>
      </div>

      <Card>
        <ShipmentTable
          shipments={data.shipments}
          canManageOrders={can(me, "can_manage_orders")}
          canManageDrivers={can(me, "can_manage_drivers")}
          canManageInvoices={canManageInvoices}
          emptyText={status === UNBILLED_FILTER.value ? "Alle abgeschlossenen Aufträge sind abgerechnet." : undefined}
        />
        {pages > 1 && (
          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>
              Seite {page} von {pages} · {data.total} Aufträge
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={href({ seite: String(page - 1) })} className="rounded-lg px-3 py-1.5 font-semibold ring-1 ring-slate-200 hover:bg-surface">
                  Zurück
                </Link>
              )}
              {page < pages && (
                <Link href={href({ seite: String(page + 1) })} className="rounded-lg px-3 py-1.5 font-semibold ring-1 ring-slate-200 hover:bg-surface">
                  Weiter
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </AdminPage>
  );
}
