"use client";

import { hasPaymentStatus, PAYMENT_REMINDER_LABEL, type AdminInvoiceRow, type InvoiceMailResult, type PaymentReminderResult } from "@fa/shared";
import { BellRing, Download, Eye, FileCode2, LoaderCircle, Mail, MailCheck, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/content/navigation";
import { formatRelative } from "@/lib/admin-format";
import { adminInvoiceUrl, apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatEuro, invoiceTypeLabel } from "@/lib/portal-format";
import { EmptyRow, tableClasses } from "../ui";
import { PaymentStatusSelect } from "./PaymentStatusSelect";

const actionClasses = "inline-flex items-center rounded-lg px-2 py-1 text-accent-ink hover:bg-surface disabled:opacity-60";

/** Belegliste mit Zahlstatus, PDF/XML, erneutem Mailversand und Zurückziehen (nur Uploads). */
export function InvoiceTable({
  invoices,
  hideCustomer,
  highlightId,
  emptyText = "Keine Belege gefunden.",
}: {
  invoices: AdminInvoiceRow[];
  hideCustomer?: boolean;
  /** Frisch erstellte Rechnung hervorheben. */
  highlightId?: string;
  emptyText?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(invoices);
  const [source, setSource] = useState(invoices);
  const [busy, setBusy] = useState<string>();
  const [messages, setMessages] = useState<Record<string, { tone: "error" | "success"; text: string }>>({});

  // Neue Daten vom Server (Filter, Neuladen) übernehmen.
  if (source !== invoices) {
    setSource(invoices);
    setRows(invoices);
  }

  useEffect(() => {
    if (highlightId) document.getElementById(`beleg-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId]);

  const setMessage = (id: string, tone: "error" | "success", text: string) => setMessages((current) => ({ ...current, [id]: { tone, text } }));
  const replace = (updated: AdminInvoiceRow) => {
    setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    router.refresh(); // Kennzahlen oben aktualisieren
  };

  const resend = async (row: AdminInvoiceRow) => {
    if (!window.confirm(`Rechnung ${row.number} erneut per E-Mail an den Kunden senden? Die PDF ist im Anhang.`)) return;
    setBusy(row.id);
    try {
      const result = await apiRequest<{ mail: InvoiceMailResult; invoice: AdminInvoiceRow }>(`/admin/invoices/${row.id}/email`, { method: "POST", body: {} });
      replace(result.invoice);
      if (result.mail.status === "SENT") setMessage(row.id, "success", `Gesendet an ${result.mail.to}.`);
      else setMessage(row.id, "error", result.mail.reason ?? "Nicht gesendet.");
    } catch (error) {
      setMessage(row.id, "error", errorMessage(error));
    } finally {
      setBusy(undefined);
    }
  };

  const remind = async (row: AdminInvoiceRow) => {
    const level = ((row.reminderLevel ?? 0) + 1) as 1 | 2 | 3;
    const label = PAYMENT_REMINDER_LABEL[level];
    if (!window.confirm(`${label} zu Rechnung ${row.number} per E-Mail senden? Die Rechnung hängt als PDF an, die neue Zahlungsfrist beträgt 7 Tage.`)) return;
    setBusy(row.id);
    try {
      const result = await apiRequest<{ reminder: PaymentReminderResult; invoice: AdminInvoiceRow }>(`/admin/invoices/${row.id}/reminder`, { method: "POST", body: {} });
      replace(result.invoice);
      setMessage(row.id, "success", `${label} gesendet an ${result.reminder.sentTo}.`);
    } catch (error) {
      setMessage(row.id, "error", errorMessage(error));
    } finally {
      setBusy(undefined);
    }
  };

  const remove = async (row: AdminInvoiceRow) => {
    const question = `${invoiceTypeLabel[row.type]} ${row.number} zurückziehen?\n\nDer Kunde sieht den Beleg danach nicht mehr im Portal. Das Original in der Buchhaltung bleibt unberührt.`;
    if (!window.confirm(question)) return;
    setBusy(row.id);
    try {
      await apiRequest(`/admin/invoices/${row.id}`, { method: "DELETE" });
      setRows((current) => current.filter((item) => item.id !== row.id));
      router.refresh();
    } catch (error) {
      setMessage(row.id, "error", errorMessage(error));
    } finally {
      setBusy(undefined);
    }
  };

  const columns = hideCustomer ? 5 : 6;

  return (
    <div className={tableClasses.wrapper}>
      <table className={tableClasses.table}>
        <thead className={tableClasses.head}>
          <tr>
            <th className={tableClasses.th}>Beleg</th>
            {!hideCustomer && <th className={tableClasses.th}>Kunde</th>}
            <th className={tableClasses.th}>Datum</th>
            <th className={cn(tableClasses.th, "text-right")}>Betrag</th>
            <th className={tableClasses.th}>Zahlung</th>
            <th className={cn(tableClasses.th, "text-right")}>Dateien</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={columns}>{emptyText}</EmptyRow>}
          {rows.map((row) => {
            const generated = row.source === "GENERATED";
            const message = messages[row.id];
            // *:whitespace-nowrap direkt an den Absätzen – das globale `p { text-wrap: pretty }` hebt ein geerbtes nowrap auf.
            return (
              <tr key={row.id} id={`beleg-${row.id}`} className={cn(tableClasses.row, row.id === highlightId && "bg-accent/5")}>
                <td className={cn(tableClasses.td, "*:whitespace-nowrap")}>
                  <p className="flex items-center gap-2 font-semibold text-primary">
                    {row.number}
                    {generated && (
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wide text-accent-ink uppercase" title="Im Portal erstellt – ZUGFeRD-PDF mit eingebetteter XML">
                        E-Rechnung
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {invoiceTypeLabel[row.type]}
                    {row.shipment && ` · ${row.shipment.shipmentNumber}`}
                  </p>
                  {row.emailedAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-700" title={row.emailedTo}>
                      <MailCheck aria-hidden="true" className="size-3.5" /> per E-Mail {formatRelative(row.emailedAt)}
                    </p>
                  )}
                  {row.reminderLevel && row.lastReminderAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-700">
                      <BellRing aria-hidden="true" className="size-3.5" /> {PAYMENT_REMINDER_LABEL[row.reminderLevel]} {formatRelative(row.lastReminderAt)}
                    </p>
                  )}
                </td>
                {!hideCustomer && (
                  <td className={cn(tableClasses.td, "*:whitespace-nowrap")}>
                    {row.customer.deleted ? (
                      <p className="font-semibold text-primary">{row.customer.name}</p>
                    ) : (
                      <Link href={`${routes.adminUsers}/${row.customer.id}`} className="block font-semibold text-primary hover:text-accent-ink">
                        {row.customer.name}
                      </Link>
                    )}
                    <p className="text-xs text-slate-500">{row.customer.customerNumber}</p>
                    {row.customer.deleted && (
                      <p
                        className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"
                        title={row.retainUntil ? `Gesetzliche Aufbewahrung bis ${formatDate(row.retainUntil)} – danach automatische Löschung` : undefined}
                      >
                        <UserX aria-hidden="true" className="size-3.5" /> Konto gelöscht · aufbewahrt
                      </p>
                    )}
                  </td>
                )}
                <td className={cn(tableClasses.td, "text-slate-600 *:whitespace-nowrap")}>
                  <p>{formatDate(row.issueDate)}</p>
                  {row.dueDate && <p className="text-xs text-slate-500">fällig {formatDate(row.dueDate)}</p>}
                  {row.validUntil && <p className="text-xs text-slate-500">gültig bis {formatDate(row.validUntil)}</p>}
                </td>
                <td className={cn(tableClasses.td, "text-right tabular-nums *:whitespace-nowrap")}>
                  <p className="font-semibold text-primary">{formatEuro(row.grossCents)}</p>
                  <p className="text-xs text-slate-500">netto {formatEuro(row.netCents)}</p>
                </td>
                <td className={tableClasses.td}>
                  {hasPaymentStatus(row.type) ? <PaymentStatusSelect invoice={row} onChange={replace} /> : <span className="text-slate-400">–</span>}
                  {row.paymentStatus === "OVERDUE" && (row.reminderLevel ?? 0) < 3 && (
                    <button
                      type="button"
                      onClick={() => void remind(row)}
                      disabled={busy === row.id}
                      className="mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-50 disabled:opacity-60"
                    >
                      <BellRing aria-hidden="true" className="size-3.5" />
                      {PAYMENT_REMINDER_LABEL[((row.reminderLevel ?? 0) + 1) as 1 | 2 | 3]} senden
                    </button>
                  )}
                  {message && <p className={cn("mt-1 max-w-56 text-xs font-medium", message.tone === "error" ? "text-red-600" : "text-emerald-700")}>{message.text}</p>}
                </td>
                <td className={cn(tableClasses.td, "text-right whitespace-nowrap")}>
                  <a href={adminInvoiceUrl(row.id, "view")} target="_blank" rel="noopener" title={`${row.fileName} ansehen & drucken`} className={cn(actionClasses, "gap-1 font-semibold")}>
                    <Eye aria-hidden="true" className="size-4" /> PDF
                  </a>
                  <a href={adminInvoiceUrl(row.id, "download")} className={actionClasses} title="PDF herunterladen">
                    <Download aria-hidden="true" className="size-4" />
                    <span className="sr-only">{row.number} herunterladen</span>
                  </a>
                  {generated && (
                    <>
                      <a href={adminInvoiceUrl(row.id, "xml")} className={actionClasses} title="E-Rechnung als XRechnung-XML herunterladen">
                        <FileCode2 aria-hidden="true" className="size-4" />
                        <span className="sr-only">{row.number} als XRechnung herunterladen</span>
                      </a>
                      <button type="button" onClick={() => void resend(row)} disabled={busy === row.id} className={actionClasses} title="Erneut per E-Mail senden">
                        {busy === row.id ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Mail aria-hidden="true" className="size-4" />}
                        <span className="sr-only">{row.number} erneut per E-Mail senden</span>
                      </button>
                    </>
                  )}
                  {!generated && (
                    <button
                      type="button"
                      onClick={() => void remove(row)}
                      disabled={busy === row.id}
                      className="inline-flex items-center rounded-lg px-2 py-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                      title="Beleg zurückziehen"
                    >
                      {busy === row.id ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Trash2 aria-hidden="true" className="size-4" />}
                      <span className="sr-only">{row.number} zurückziehen</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
