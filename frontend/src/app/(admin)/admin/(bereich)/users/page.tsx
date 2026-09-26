import type { AdminCustomerList } from "@fa/shared";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { AdminPage, Card, NoAccess } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Kunden" };

const PAGE_SIZE = 50;

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireStaff();
  if (!can(me, "can_view_customers")) return <NoAccess />;

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const onlineOnly = params.online === "1";
  const page = Math.max(1, Number(params.seite) || 1);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (q) query.set("q", q);
  if (onlineOnly) query.set("online", "1");
  const data = await apiServer<AdminCustomerList>(`/admin/customers?${query}`);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  const href = (next: Record<string, string | undefined>) => {
    const merged = new URLSearchParams();
    const values = { q, online: onlineOnly ? "1" : undefined, ...next };
    for (const [key, value] of Object.entries(values)) if (value) merged.set(key, value);
    return `${routes.adminUsers}?${merged}`;
  };

  return (
    <AdminPage title="Kunden" description={`${data.total} ${onlineOnly ? "Kunden gerade online" : "Kundenkonten"} – Online-Status aktualisiert sich live.`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter" className="flex gap-2">
          {[
            { label: "Alle", online: undefined },
            { label: "Gerade online", online: "1" },
          ].map((filter) => {
            const active = onlineOnly === (filter.online === "1");
            return (
              <Link
                key={filter.label}
                href={href({ online: filter.online, seite: undefined })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
                  active ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
        <form action={routes.adminUsers} className="relative">
          {onlineOnly && <input type="hidden" name="online" value="1" />}
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, Kundennummer, E-Mail"
            aria-label="Kunden suchen"
            className="h-10 w-72 rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm focus:border-accent-ink focus:outline-none"
          />
        </form>
      </div>

      <Card>
        <CustomerTable customers={data.customers} />
        {pages > 1 && (
          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>
              Seite {page} von {pages}
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
