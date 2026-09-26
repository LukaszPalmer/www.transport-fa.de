import type { AdminInvoiceDraftRow, AdminInvoiceList } from "@fa/shared";
import { AlertTriangle, CircleCheck, Clock, FilePlus2, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { formatEuro } from "@/lib/portal-format";
import { DraftList } from "@/components/admin/invoices/DraftList";
import { InvoiceTable } from "@/components/admin/invoices/InvoiceTable";
import { SendInvoiceButton } from "@/components/admin/invoices/SendInvoiceDialog";
import { AdminPage, Card, NoAccess } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button-styles";

export const metadata: Metadata = { title: "Rechnungen" };

const FILTERS = [
  { value: "ALL", label: "Alle" },
  { value: "OPEN", label: "Offen" },
  { value: "OVERDUE", label: "Überfällig" },
  { value: "PAID", label: "Bezahlt" },
  { value: "CANCELLED", label: "Storniert" },
  { value: "OFFER", label: "Angebote" },
  { value: "ORDER_CONFIRMATION", label: "Auftragsbestätigungen" },
  { value: "CREDIT_NOTE", label: "Gutschriften" },
] as const;

const PAGE_SIZE = 50;

/** Rechnungen erstellen (E-Rechnung), Belege aus der Buchhaltung hochladen und Zahlungen verbuchen. */
export default async function AdminInvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  const me = await requireStaff();
  if (!can(me, "can_manage_invoices")) return <NoAccess />;

  const params = await searchParams;
  const filter = typeof params.filter === "string" && FILTERS.some((entry) => entry.value === params.filter) ? params.filter : "ALL";
  const q = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.seite) || 1);
  const highlightId = typeof params.beleg === "string" ? params.beleg : undefined;

  const query = new URLSearchParams({ filter, page: String(page), limit: String(PAGE_SIZE) });
  if (q) query.set("q", q);
  const [data, { drafts }] = await Promise.all([
    apiServer<AdminInvoiceList>(`/admin/invoices?${query}`),
    apiServer<{ drafts: AdminInvoiceDraftRow[] }>("/admin/invoices/drafts"),
  ]);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const { stats } = data;

  const href = (next: Record<string, string>) => {
    const merged = new URLSearchParams({ filter, ...(q ? { q } : {}), ...next });
    return `${routes.adminInvoices}?${merged}`;
  };

  const tiles = [
    { label: "Offene Rechnungen", value: formatEuro(stats.openGrossCents), detail: `${stats.openCount} ${stats.openCount === 1 ? "Rechnung" : "Rechnungen"}`, icon: Clock, filter: "OPEN" },
    {
      label: "Überfällig",
      value: formatEuro(stats.overdueGrossCents),
      detail: stats.overdueCount ? `${stats.overdueCount} – bitte nachfassen` : "nichts überfällig",
      icon: AlertTriangle,
      filter: "OVERDUE",
      warn: stats.overdueCount > 0,
    },
    { label: "Bezahlt diesen Monat", value: formatEuro(stats.paidThisMonthGrossCents), detail: "Überweisung und bar", icon: CircleCheck, filter: "PAID" },
    { label: "Belege gesamt", value: String(data.total), detail: filter === "ALL" ? "Angebote bis Gutschriften" : "in dieser Ansicht", icon: FileText, filter: "ALL" },
  ];

  return (
    <AdminPage
      title="Rechnungen & Belege"
      description="Rechnungen als E-Rechnung erstellen und per E-Mail senden oder Belege aus der Buchhaltung hochladen. Den Zahlstatus pflegen Sie direkt in der Liste – der Kunde sieht ihn sofort im Portal."
      actions={
        <>
          {can(me, "can_view_customers") && <SendInvoiceButton />}
          <Link href={routes.adminInvoiceNew} className={buttonClasses({ variant: "dark", size: "sm" })}>
            <FilePlus2 aria-hidden="true" className="size-4" /> Rechnung erstellen
          </Link>
        </>
      }
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={href({ filter: tile.filter, seite: "1" })}
            className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5 transition-shadow hover:shadow-card-hover"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <tile.icon aria-hidden="true" className="size-4 text-accent-ink" />
              {tile.label}
            </p>
            <p className="mt-3 font-display text-3xl font-bold text-primary tabular-nums">{tile.value}</p>
            <p className={tile.warn ? "mt-1 text-sm font-semibold text-amber-700" : "mt-1 text-sm text-slate-500"}>{tile.detail}</p>
          </Link>
        ))}
      </div>

      {drafts.length > 0 && (
        <Card title={`Entwürfe (${drafts.length})`} description="Noch nicht gesendet – für Kunden unsichtbar." className="mb-8">
          <DraftList drafts={drafts} />
        </Card>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter" className="flex flex-wrap gap-2">
          {FILTERS.map((entry) => (
            <Link
              key={entry.value}
              href={href({ filter: entry.value, seite: "1" })}
              aria-current={filter === entry.value ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
                filter === entry.value ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary",
              )}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
        <form action={routes.adminInvoices} className="flex gap-2">
          <input type="hidden" name="filter" value={filter} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Belegnummer oder Kunde"
            aria-label="Nach Belegnummer oder Kunde suchen"
            className="h-10 w-56 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-accent-ink focus:outline-none"
          />
        </form>
      </div>

      <Card>
        <InvoiceTable invoices={data.invoices} highlightId={highlightId} emptyText={q ? "Keine Belege zu dieser Suche." : "Noch keine Belege in dieser Ansicht."} />
        {pages > 1 && (
          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>
              Seite {page} von {pages} · {data.total} Belege
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
