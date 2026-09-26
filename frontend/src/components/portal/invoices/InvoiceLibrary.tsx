"use client";

import type { InvoiceItem, InvoiceType } from "@fa/shared";
import { CircleCheck, Download, FileCode2, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { invoiceUrl } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatDate, formatEuro, invoiceTypeLabel, paymentMethodLabel, paymentStatus } from "@/lib/portal-format";
import { EmptyState, StatusBadge } from "@/components/portal/dashboard/ui";
import { Icon, type IconName } from "@/components/ui/Icon";

type Filter = "all" | "open" | InvoiceType;

const TYPE_ICON: Record<InvoiceType, IconName> = {
  INVOICE: "coins",
  OFFER: "file-text",
  ORDER_CONFIRMATION: "check",
  CREDIT_NOTE: "arrow-up-right",
};

const TYPE_PLURAL: Record<InvoiceType, string> = {
  INVOICE: "Rechnungen",
  OFFER: "Angebote",
  ORDER_CONFIRMATION: "Auftragsbestätigungen",
  CREDIT_NOTE: "Gutschriften",
};

const isOpen = (invoice: InvoiceItem) => invoice.paymentStatus === "PENDING" || invoice.paymentStatus === "OVERDUE";

/** Alle Belege mit Filter – je Beleg Beträge, Fälligkeit, Zahlstatus, Ansehen & Drucken und PDF-Download. */
export function InvoiceLibrary({ invoices, highlightId }: { invoices: InvoiceItem[]; highlightId?: string }) {
  const [filter, setFilter] = useState<Filter>("all");

  // Aus der E-Mail verlinkter Beleg: in den sichtbaren Bereich holen.
  useEffect(() => {
    if (highlightId) document.getElementById(`beleg-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId]);

  const types = (["INVOICE", "OFFER", "ORDER_CONFIRMATION", "CREDIT_NOTE"] as const).filter((type) => invoices.some((invoice) => invoice.type === type));
  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: "all", label: "Alle", count: invoices.length },
    { id: "open", label: "Offen", count: invoices.filter(isOpen).length },
    ...types.map((type) => ({ id: type, label: TYPE_PLURAL[type], count: invoices.filter((invoice) => invoice.type === type).length })),
  ];
  const visible = invoices.filter((invoice) => (filter === "all" ? true : filter === "open" ? isOpen(invoice) : invoice.type === filter));

  return (
    <section aria-labelledby="belege-title" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-primary/5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="belege-title" className="font-display text-lg font-bold text-primary">
          Ihre Belege
        </h2>
        {invoices.length > 0 && (
          <div role="group" aria-label="Belege filtern" className="flex flex-wrap gap-2">
            {filters.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setFilter(entry.id)}
                aria-pressed={filter === entry.id}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                  filter === entry.id ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300",
                )}
              >
                {entry.label} <span className="opacity-70">{entry.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        {visible.length === 0 ? (
          <EmptyState
            title={invoices.length === 0 ? "Noch keine Belege" : "Keine Belege in dieser Ansicht"}
            text={
              invoices.length === 0
                ? "Angebote, Auftragsbestätigungen und Rechnungen erscheinen hier, sobald wir sie Ihnen senden – Sie erhalten dazu auch eine E-Mail."
                : "Wählen Sie oben eine andere Ansicht."
            }
          />
        ) : (
          <ul className="space-y-4">
            {visible.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} highlighted={invoice.id === highlightId} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function InvoiceCard({ invoice, highlighted }: { invoice: InvoiceItem; highlighted: boolean }) {
  const typeLabel = invoiceTypeLabel[invoice.type];
  const status = invoice.paymentStatus ? paymentStatus[invoice.paymentStatus] : undefined;

  const facts: Array<{ label: string; value: string; warn?: boolean }> = [{ label: "Belegdatum", value: formatDate(invoice.issueDate) }];
  if (invoice.dueDate && invoice.paymentStatus !== "PAID" && invoice.paymentStatus !== "CANCELLED") {
    facts.push({ label: "Fällig am", value: formatDate(invoice.dueDate), warn: invoice.paymentStatus === "OVERDUE" });
  }
  if (invoice.validUntil) facts.push({ label: "Gültig bis", value: formatDate(invoice.validUntil) });
  if (invoice.shipment) facts.push({ label: "Auftrag", value: `${invoice.shipment.shipmentNumber} · ${invoice.shipment.route}` });

  return (
    <li
      id={`beleg-${invoice.id}`}
      className={cn(
        "scroll-mt-28 overflow-hidden rounded-2xl border bg-white transition-shadow",
        highlighted ? "border-accent shadow-card-hover ring-4 ring-accent/20" : "border-slate-200 hover:shadow-card",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
            <Icon name={TYPE_ICON[invoice.type]} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
              {typeLabel}
              {invoice.eInvoice && <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.625rem] tracking-wide text-accent-ink">E-Rechnung</span>}
            </p>
            <p className="mt-0.5 font-display text-lg font-bold break-all text-primary">{invoice.number}</p>
          </div>
        </div>
        {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-slate-100 bg-surface/50 p-5 sm:grid-cols-5 sm:p-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:col-span-3">
          {facts.map((fact) => (
            <div key={fact.label} className={fact.label === "Auftrag" ? "col-span-2" : undefined}>
              <dt className="text-slate-500">{fact.label}</dt>
              <dd className={cn("font-semibold", fact.warn ? "text-red-700" : "text-primary")}>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <dl className="space-y-1.5 text-sm tabular-nums sm:col-span-2">
          <div className="flex justify-between gap-4 text-slate-600">
            <dt>Netto</dt>
            <dd>{formatEuro(invoice.netCents)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-slate-600">
            <dt>Umsatzsteuer</dt>
            <dd>{formatEuro(invoice.vatCents)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-2 text-base font-bold text-primary">
            <dt>{invoice.type === "CREDIT_NOTE" ? "Gutschrift" : "Gesamt"}</dt>
            <dd>{formatEuro(invoice.grossCents)}</dd>
          </div>
        </dl>
      </div>

      {invoice.paymentStatus === "PAID" && (
        <p className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800 sm:px-6">
          <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
          Beglichen{invoice.paidAt && ` am ${formatDate(invoice.paidAt)}`}
          {invoice.paymentMethod && ` · ${paymentMethodLabel[invoice.paymentMethod]}`} – vielen Dank!
        </p>
      )}
      {invoice.paymentStatus === "OVERDUE" && (
        <p className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-800 sm:px-6">
          Diese Rechnung ist überfällig. Die Zahlungsinformationen finden Sie auf dem Beleg – haben Sie bereits bezahlt, betrachten Sie diesen Hinweis als
          gegenstandslos.
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4 sm:px-6">
        <a
          href={invoiceUrl(invoice.id, "view")}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
        >
          <Printer aria-hidden="true" className="size-4" />
          Ansehen & Drucken
        </a>
        <a
          href={invoiceUrl(invoice.id, "download")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
        >
          <Download aria-hidden="true" className="size-4" />
          PDF herunterladen
        </a>
        {invoice.eInvoice && (
          <a
            href={invoiceUrl(invoice.id, "xml")}
            title="Für Buchhaltungsprogramme: die Rechnungsdaten als XRechnung (XML). Die PDF enthält dieselben Daten bereits im ZUGFeRD-Format."
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FileCode2 aria-hidden="true" className="size-4" />
            XRechnung (XML)
          </a>
        )}
      </div>
    </li>
  );
}
