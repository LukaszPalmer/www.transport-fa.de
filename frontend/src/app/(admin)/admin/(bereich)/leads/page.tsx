import { LEAD_SOURCE_LABEL, LEAD_STATUS_INFO, type AdminLeadList } from "@fa/shared";
import { AlarmClock, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { formatRelative, leadStatusTone, leadTopicLabel } from "@/lib/admin-format";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { formatDate, formatEuro } from "@/lib/portal-format";
import { CreateLeadButton } from "@/components/admin/leads/CreateLeadDialog";
import { AdminPage, Card, EmptyRow, NoAccess, tableClasses } from "@/components/admin/ui";
import { StatusBadge } from "@/components/portal/dashboard/ui";

export const metadata: Metadata = { title: "Anfragen" };

const PAGE_SIZE = 50;

/** CRM-Pipeline: Anfragen aus dem Kontaktformular und manuell erfasste – vom Eingang bis zum Auftrag. */
export default async function AdminLeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const me = await requireStaff();
  if (!can(me, "can_manage_leads")) return <NoAccess />;

  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "OPEN";
  const q = typeof params.q === "string" ? params.q : "";
  const mine = params.meine === "1";
  const page = Math.max(1, Number(params.seite) || 1);

  const query = new URLSearchParams({ status, page: String(page), limit: String(PAGE_SIZE) });
  if (q) query.set("q", q);
  if (mine) query.set("mine", "1");
  const data = await apiServer<AdminLeadList>(`/admin/leads?${query}`);
  const { counts } = data;
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const decided = counts.WON + counts.LOST;
  const winRate = decided > 0 ? Math.round((counts.WON / decided) * 100) : undefined;

  const href = (next: Record<string, string>) => {
    const merged = new URLSearchParams({ status, ...(q ? { q } : {}), ...(mine ? { meine: "1" } : {}), ...next });
    return `${routes.adminLeads}?${merged}`;
  };

  const tabs = [
    { value: "OPEN", label: "Offen", count: counts.NEW + counts.CONTACTED + counts.OFFER_SENT },
    { value: "NEW", label: LEAD_STATUS_INFO.NEW.label, count: counts.NEW },
    { value: "CONTACTED", label: LEAD_STATUS_INFO.CONTACTED.label, count: counts.CONTACTED },
    { value: "OFFER_SENT", label: LEAD_STATUS_INFO.OFFER_SENT.label, count: counts.OFFER_SENT },
    { value: "FOLLOW_UP", label: "Wiedervorlage fällig", count: counts.followUpDue },
    { value: "WON", label: LEAD_STATUS_INFO.WON.label, count: counts.WON },
    { value: "LOST", label: LEAD_STATUS_INFO.LOST.label, count: counts.LOST },
    { value: "ALL", label: "Alle", count: undefined },
  ];

  return (
    <AdminPage
      title="Anfragen"
      description="Jede Anfrage aus dem Kontaktformular landet hier. Übernehmen, nachfassen, Angebot senden – und sehen, was daraus geworden ist."
      actions={<CreateLeadButton initiallyOpen={params.neu === "1"} />}
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Offene Anfragen" value={String(tabs[0]!.count)} detail={`${counts.NEW} davon neu`} />
        <Stat label="Pipeline-Wert" value={formatEuro(data.pipelineValueCents)} detail="Summe der geschätzten Auftragswerte offener Anfragen" />
        <Stat label="Abschlussquote" value={winRate === undefined ? "–" : `${winRate} %`} detail={`${counts.WON} gewonnen · ${counts.LOST} verloren`} />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Pipeline" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={href({ status: tab.value, seite: "1" })}
              aria-current={status === tab.value ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
                status === tab.value ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary",
                tab.value === "FOLLOW_UP" && Boolean(tab.count) && status !== tab.value && "text-amber-700 ring-amber-200",
              )}
            >
              {tab.label}
              {tab.count !== undefined && <span className="tabular-nums opacity-70">{tab.count}</span>}
            </Link>
          ))}
        </nav>
        <form action={routes.adminLeads} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="meine" value="1" defaultChecked={mine} className="size-4 accent-[#0369a1]" /> nur meine
          </label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, Firma, E-Mail, Nummer"
            aria-label="Anfragen durchsuchen"
            className="h-10 w-56 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-accent-ink focus:outline-none"
          />
          <button type="submit" className="h-10 rounded-xl px-3 text-sm font-semibold ring-1 ring-slate-200 hover:bg-white">
            Suchen
          </button>
        </form>
      </div>

      <Card>
        <div className={tableClasses.wrapper}>
          <table className={tableClasses.table}>
            <thead className={tableClasses.head}>
              <tr>
                <th className={tableClasses.th}>Anfrage</th>
                <th className={tableClasses.th}>Thema</th>
                <th className={tableClasses.th}>Status</th>
                <th className={tableClasses.th}>Zuständig</th>
                <th className={tableClasses.th}>Wiedervorlage</th>
                <th className={cn(tableClasses.th, "text-right")}>Eingang</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.length === 0 && <EmptyRow colSpan={6}>{q ? "Keine Anfragen zu dieser Suche." : "Keine Anfragen in dieser Ansicht."}</EmptyRow>}
              {data.leads.map((lead) => {
                const overdue = lead.followUpAt && new Date(lead.followUpAt) <= new Date();
                return (
                  <tr key={lead.id} className={tableClasses.row}>
                    <td className={tableClasses.td}>
                      <Link href={`${routes.adminLeads}/${lead.id}`} className="font-semibold text-primary hover:text-accent-ink">
                        {lead.name}
                        {lead.company && <span className="font-normal text-slate-500"> · {lead.company}</span>}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {lead.number} · {LEAD_SOURCE_LABEL[lead.source]}
                        {lead.callback && (
                          <span className="ml-1.5 inline-flex items-center gap-1 font-semibold text-amber-700">
                            <PhoneCall aria-hidden="true" className="size-3" /> Rückruf
                          </span>
                        )}
                      </p>
                      {lead.messagePreview && <p className="mt-0.5 max-w-md truncate text-xs text-slate-500">{lead.messagePreview}</p>}
                    </td>
                    <td className={tableClasses.td}>
                      <p className="text-primary">{leadTopicLabel(lead.topic)}</p>
                      {lead.route && <p className="max-w-56 truncate text-xs text-slate-500">{lead.route}</p>}
                      {lead.preferredDate && <p className="text-xs text-slate-500">Wunsch: {lead.preferredDate}</p>}
                    </td>
                    <td className={tableClasses.td}>
                      <StatusBadge tone={leadStatusTone[lead.status]}>{LEAD_STATUS_INFO[lead.status].label}</StatusBadge>
                      {lead.estimatedValueCents !== undefined && <p className="mt-1 text-xs text-slate-500 tabular-nums">~ {formatEuro(lead.estimatedValueCents)}</p>}
                    </td>
                    <td className={cn(tableClasses.td, "text-slate-600")}>{lead.assignedTo?.name ?? "–"}</td>
                    <td className={tableClasses.td}>
                      {lead.followUpAt ? (
                        <span className={cn("inline-flex items-center gap-1 text-sm", overdue ? "font-semibold text-amber-700" : "text-slate-600")}>
                          <AlarmClock aria-hidden="true" className="size-3.5" /> {formatDate(lead.followUpAt)}
                        </span>
                      ) : (
                        <span className="text-slate-400">–</span>
                      )}
                    </td>
                    <td className={cn(tableClasses.td, "text-right text-slate-600")}>{formatRelative(lead.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>
              Seite {page} von {pages} · {data.total} Anfragen
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
      <p className="mt-4 text-xs text-slate-500">
        Datenschutz: Anfragen ohne Auftrag werden 6 Monate nach der letzten Bearbeitung automatisch gelöscht, gewonnene nach 3 Jahren.
      </p>
    </AdminPage>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}
