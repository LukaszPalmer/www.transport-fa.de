import type { AdminActivityList } from "@fa/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { requireStaff } from "@/lib/admin-session";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/portal-format";
import { AdminPage, Card, EmptyRow, NoAccess, tableClasses } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Protokoll" };

const PAGE_SIZE = 50;

/** Aktivitätsprotokoll: Anmeldungen, Änderungen, Exporte – wer hat wann was getan (12 Monate). */
export default async function AdminActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  const me = await requireStaff();
  if (me.user.role !== "ADMIN") return <NoAccess text="Das Protokoll sehen nur Administratoren." />;

  const params = await searchParams;
  const group = typeof params.bereich === "string" && /^[a-z_]+$/.test(params.bereich) ? params.bereich : "";
  const page = Math.max(1, Number(params.seite) || 1);
  const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (group) query.set("group", group);
  const data = await apiServer<AdminActivityList>(`/admin/activity?${query}`);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const href = (next: Record<string, string>) => `${routes.adminActivity}?${new URLSearchParams({ ...(group ? { bereich: group } : {}), ...next })}`;

  return (
    <AdminPage title="Protokoll" description="Sicherheits- und Admin-Ereignisse der letzten 12 Monate – danach löscht das System sie automatisch.">
      <nav aria-label="Bereich" className="mb-5 flex flex-wrap gap-2">
        {[{ value: "", label: "Alle" }, ...data.groups].map((entry) => (
          <Link
            key={entry.value || "all"}
            href={entry.value ? href({ bereich: entry.value, seite: "1" }) : routes.adminActivity}
            aria-current={group === entry.value ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
              group === entry.value ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary",
            )}
          >
            {entry.label}
          </Link>
        ))}
      </nav>

      <Card>
        <div className={tableClasses.wrapper}>
          <table className={tableClasses.table}>
            <thead className={tableClasses.head}>
              <tr>
                <th className={tableClasses.th}>Zeitpunkt</th>
                <th className={tableClasses.th}>Ereignis</th>
                <th className={tableClasses.th}>Wer</th>
                <th className={tableClasses.th}>Betrifft</th>
                <th className={tableClasses.th}>IP</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && <EmptyRow colSpan={5}>Keine Einträge.</EmptyRow>}
              {data.items.map((item) => (
                <tr key={item.id} className={tableClasses.row}>
                  <td className={cn(tableClasses.td, "whitespace-nowrap text-slate-600")}>{formatDateTime(item.createdAt)}</td>
                  <td className={tableClasses.td}>
                    <p className={cn("font-semibold", /failed|locked/.test(item.action) ? "text-red-700" : "text-primary")}>{item.label}</p>
                    <p className="font-mono text-[0.6875rem] text-slate-400">{item.action}</p>
                  </td>
                  <td className={cn(tableClasses.td, "text-slate-600")}>{item.actor ?? "–"}</td>
                  <td className={tableClasses.td}>
                    {item.target && <p className="text-slate-700">{item.target}</p>}
                    {item.customer && (
                      <Link href={`${routes.adminUsers}/${item.customer.id}`} className="text-sm font-semibold text-accent-ink hover:underline">
                        {item.customer.name}
                      </Link>
                    )}
                    {!item.target && !item.customer && <span className="text-slate-400">–</span>}
                  </td>
                  <td className={cn(tableClasses.td, "font-mono text-xs text-slate-500")}>{item.ip ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>
              Seite {page} von {pages} · {data.total} Einträge
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
