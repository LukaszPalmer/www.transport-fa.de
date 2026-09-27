import { TAX_CASE_INFO, type AccountingSummary } from "@fa/shared";
import { AlertTriangle, CircleCheck, FileCode2, UserX } from "lucide-react";
import type { Metadata } from "next";
import { requireStaff, can } from "@/lib/admin-session";
import { periodPresets } from "@/lib/accounting-periods";
import { apiServer } from "@/lib/api/server";
import { cn } from "@/lib/cn";
import { formatDate, formatEuro, paymentStatus } from "@/lib/portal-format";
import { AccountingSettingsForm } from "@/components/admin/accounting/AccountingSettingsForm";
import { ExportActions } from "@/components/admin/accounting/ExportActions";
import { PeriodPicker } from "@/components/admin/accounting/PeriodPicker";
import { MonthlyColumns } from "@/components/admin/charts/MonthlyColumns";
import { AdminPage, Card, EmptyRow, NoAccess, tableClasses } from "@/components/admin/ui";
import { StatusBadge } from "@/components/portal/dashboard/ui";

export const metadata: Metadata = { title: "Buchhaltung" };

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const EXPORT_LABEL = { DATEV: "DATEV-Stapel", ZIP: "Belegpaket", JOURNAL: "Ausgangsbuch (CSV)", EMAIL: "per E-Mail gesendet" } as const;

/**
 * Buchhaltung: Rechnungsausgangsbuch und Umsatzsteuer je Zeitraum, Übergabe an die Steuerberatung
 * (DATEV-Buchungsstapel, Belegpaket mit ZUGFeRD-PDFs und XRechnung-XML) und DATEV-Einstellungen.
 */
export default async function AdminAccountingPage({ searchParams }: PageProps<"/admin/accounting">) {
  const me = await requireStaff();
  if (!can(me, "can_manage_accounting")) return <NoAccess text="Für die Buchhaltung fehlt Ihnen das Recht „Buchhaltung & Export“. Ein Administrator kann es unter „Team“ vergeben." />;

  const params = await searchParams;
  const fallback = periodPresets()[1]!; // Standard: letzter Monat – der typische Monatsabschluss
  const from = typeof params.von === "string" && DAY.test(params.von) ? params.von : fallback.from;
  const to = typeof params.bis === "string" && DAY.test(params.bis) ? params.bis : fallback.to;
  const source = params.quelle === "GENERATED" ? "GENERATED" : "ALL";

  const summary = await apiServer<AccountingSummary>(`/admin/accounting/summary?${new URLSearchParams({ from, to, source })}`);
  const { totals } = summary;

  const kpis = [
    { label: "Umsatz netto", value: formatEuro(totals.netCents), detail: `${totals.invoiceCount} Rechnungen · ${totals.creditNoteCount} Gutschriften` },
    { label: "Umsatzsteuer", value: formatEuro(totals.vatCents), detail: "laut Rechnungen im Zeitraum" },
    { label: "Umsatz brutto", value: formatEuro(totals.grossCents), detail: totals.cancelledCount ? `${totals.cancelledCount} storniert (nicht enthalten)` : "ohne Stornos" },
    { label: "Davon bezahlt", value: formatEuro(totals.paidGrossCents), detail: `offen ${formatEuro(totals.openGrossCents)} · bar ${formatEuro(totals.cashGrossCents)}` },
  ];

  return (
    <AdminPage
      title="Buchhaltung"
      description="Ausgangsrechnungen je Zeitraum auswerten und an die Steuerberatung übergeben – als DATEV-Buchungsstapel, Belegpaket mit allen E-Rechnungen oder CSV."
    >
      <div className="mb-8">
        <PeriodPicker from={from} to={to} source={source} />
        <p className="mt-3 text-sm text-slate-500">
          Zeitraum {formatDate(from)} – {formatDate(to)} · nach Rechnungsdatum · {source === "GENERATED" ? "nur im Portal erstellte E-Rechnungen" : "alle Rechnungen und Gutschriften"}
        </p>
      </div>

      {summary.warnings.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle aria-hidden="true" className="size-4" /> Bitte prüfen
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {summary.warnings.slice(0, 12).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
            {summary.warnings.length > 12 && <li>… und {summary.warnings.length - 12} weitere (siehe Hinweise.txt im Belegpaket)</li>}
          </ul>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-3 font-display text-3xl font-bold text-primary">{kpi.value}</p>
            <p className="mt-1 text-sm text-slate-500">{kpi.detail}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card title="Übergabe an die Steuerberatung" className="xl:col-span-3">
          <ExportActions from={from} to={to} source={source} accountantEmail={summary.settings.accountantEmail} hasEntries={totals.count > 0} />
          {!summary.settingsComplete && (
            <p className="mt-4 text-sm text-amber-700">
              Für den DATEV-Stapel fehlen Berater- und Mandantennummer – bitte unten in den Einstellungen eintragen. Belegpaket und CSV
              funktionieren auch ohne.
            </p>
          )}
        </Card>
        <Card title="Umsatzsteuer je Steuerfall" description="Rechnungen abzüglich Gutschriften, ohne Stornos." className="xl:col-span-2">
          {summary.byTax.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Umsätze im Zeitraum.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="py-2 pr-2 font-semibold">Steuerfall</th>
                  <th className="py-2 pr-2 text-right font-semibold">Netto</th>
                  <th className="py-2 text-right font-semibold">USt</th>
                </tr>
              </thead>
              <tbody>
                {summary.byTax.map((row) => (
                  <tr key={row.taxCase} className="border-t border-slate-100">
                    <td className="py-2 pr-2">
                      <span className="font-semibold text-primary">{TAX_CASE_INFO[row.taxCase].label}</span>
                      <span className="block text-xs text-slate-500">Konto {row.account}</span>
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums">{formatEuro(row.netCents)}</td>
                    <td className="py-2 text-right tabular-nums">{formatEuro(row.vatCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {summary.months.length > 1 && (
        <Card title="Umsatz netto je Monat" className="mb-8">
          <MonthlyColumns title="Nettoumsatz je Monat" months={summary.months.map((entry) => entry.month)} series={[{ key: "net", label: "Umsatz netto", values: summary.months.map((entry) => entry.netCents) }]} />
        </Card>
      )}

      <Card title={`Rechnungsausgangsbuch (${totals.count})`} description="Alle Rechnungen und Gutschriften im Zeitraum – so, wie sie in den Export gehen." className="mb-8">
        <div className={tableClasses.wrapper}>
          <table className={cn(tableClasses.table, "min-w-[60rem]")}>
            <thead className={tableClasses.head}>
              <tr>
                <th className={tableClasses.th}>Beleg</th>
                <th className={tableClasses.th}>Kunde</th>
                <th className={tableClasses.th}>Steuer</th>
                <th className={cn(tableClasses.th, "text-right")}>Netto</th>
                <th className={cn(tableClasses.th, "text-right")}>USt</th>
                <th className={cn(tableClasses.th, "text-right")}>Brutto</th>
                <th className={tableClasses.th}>Zahlung</th>
              </tr>
            </thead>
            <tbody>
              {summary.journal.length === 0 && <EmptyRow colSpan={7}>Keine Rechnungen oder Gutschriften in diesem Zeitraum.</EmptyRow>}
              {summary.journal.map((row) => {
                const sign = row.type === "CREDIT_NOTE" ? -1 : 1;
                return (
                  <tr key={row.id} className={tableClasses.row}>
                    <td className={tableClasses.td}>
                      <p className="flex items-center gap-1.5 font-semibold whitespace-nowrap text-primary">
                        {row.number}
                        {row.eInvoice && <FileCode2 aria-label="E-Rechnung" className="size-3.5 text-accent-ink" />}
                      </p>
                      <p className="text-xs whitespace-nowrap text-slate-500">
                        {row.type === "CREDIT_NOTE" ? "Gutschrift" : "Rechnung"} · {formatDate(row.issueDate)} · {row.source === "GENERATED" ? "Portal" : "Upload"}
                      </p>
                      {row.note && <p className="mt-0.5 max-w-64 text-xs text-amber-700">{row.note}</p>}
                    </td>
                    <td className={tableClasses.td}>
                      <p className="text-primary">{row.customerName}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        {row.customerNumber} · Debitor {row.debtorAccount}
                        {row.customerDeleted && <UserX aria-label="Konto gelöscht, Beleg aufbewahrt" className="size-3.5" />}
                      </p>
                    </td>
                    <td className={cn(tableClasses.td, "whitespace-nowrap text-slate-600")}>{row.taxCases.map((taxCase) => TAX_CASE_INFO[taxCase].short).join(" + ")}</td>
                    <td className={cn(tableClasses.td, "text-right whitespace-nowrap tabular-nums")}>{formatEuro(sign * row.netCents)}</td>
                    <td className={cn(tableClasses.td, "text-right whitespace-nowrap tabular-nums")}>{formatEuro(sign * row.vatCents)}</td>
                    <td className={cn(tableClasses.td, "text-right font-semibold whitespace-nowrap text-primary tabular-nums")}>{formatEuro(sign * row.grossCents)}</td>
                    <td className={tableClasses.td}>
                      {row.paymentStatus ? <StatusBadge tone={paymentStatus[row.paymentStatus].tone}>{paymentStatus[row.paymentStatus].label}</StatusBadge> : <span className="text-slate-400">–</span>}
                      {row.paidAt && <p className="mt-1 text-xs text-slate-500">{formatDate(row.paidAt)}{row.paymentMethod === "CASH" ? " · bar" : ""}</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card title="Einstellungen" description="DATEV-Nummern, Kontenrahmen und Steuerberatung." className="xl:col-span-3">
          <AccountingSettingsForm settings={summary.settings} />
        </Card>
        <Card title="Übergaben" description="Wann welcher Zeitraum exportiert oder gesendet wurde." className="xl:col-span-2">
          {summary.exports.length === 0 ? (
            <p className="text-sm text-slate-500">Noch keine Exporte.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {summary.exports.map((entry) => (
                <li key={entry.id} className="py-2.5">
                  <p className="flex items-center gap-1.5 font-semibold text-primary">
                    <CircleCheck aria-hidden="true" className="size-4 text-emerald-600" />
                    {EXPORT_LABEL[entry.kind]} · {formatDate(entry.from)} – {formatDate(entry.to)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(entry.createdAt)} · {entry.count} Belege · {formatEuro(entry.grossCents)}
                    {entry.by && ` · ${entry.by}`}
                    {entry.sentTo && ` · an ${entry.sentTo}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}
