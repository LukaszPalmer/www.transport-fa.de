"use client";

import type { AdminInvoiceRow, EffectivePaymentStatus, PaymentMethod, PaymentStatus } from "@fa/shared";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, paymentMethodLabel, paymentStatus } from "@/lib/portal-format";
import { StatusBadge } from "@/components/portal/dashboard/ui";

/** Zahlstatus als ein Auswahlfeld: offen, bezahlt (Überweisung/bar), storniert. */
type PaymentChoice = "PENDING" | `PAID:${PaymentMethod}` | "CANCELLED";

const PAYMENT_CHOICES: Array<{ value: PaymentChoice; label: string }> = [
  { value: "PENDING", label: "Offen" },
  { value: "PAID:BANK_TRANSFER", label: "Bezahlt – Überweisung" },
  { value: "PAID:CASH", label: "Bezahlt – bar" },
  { value: "CANCELLED", label: "Storniert" },
];

export interface PaymentState {
  id: string;
  number: string;
  paymentStatus?: EffectivePaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}

function currentChoice(state: PaymentState): PaymentChoice {
  if (state.paymentStatus === "PAID") return `PAID:${state.paymentMethod ?? "BANK_TRANSFER"}`;
  if (state.paymentStatus === "CANCELLED") return "CANCELLED";
  return "PENDING";
}

/**
 * Zahlstatus einer Rechnung pflegen – in der Rechnungsliste und im Reiter „Aufträge“.
 * Der Kunde sieht die Änderung sofort im Portal.
 */
export function PaymentStatusSelect({
  invoice,
  onChange,
  compact,
}: {
  invoice: PaymentState;
  onChange: (row: AdminInvoiceRow) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const status = invoice.paymentStatus ? paymentStatus[invoice.paymentStatus] : undefined;

  const change = async (choice: PaymentChoice) => {
    const [next, method] = choice.split(":") as [PaymentStatus, PaymentMethod | undefined];
    if (next === "CANCELLED" && !window.confirm(`Rechnung ${invoice.number} als storniert markieren?\n\nDer Kunde sieht sie danach als „Storniert“ im Portal.`)) return;
    setBusy(true);
    setError(undefined);
    try {
      onChange(await apiRequest<AdminInvoiceRow>(`/admin/invoices/${invoice.id}/payment`, { method: "PATCH", body: { status: next, method } }));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <select
        aria-label={`Zahlstatus von ${invoice.number}`}
        value={currentChoice(invoice)}
        disabled={busy}
        onChange={(event) => void change(event.target.value as PaymentChoice)}
        className={cn(
          "rounded-lg border bg-white px-2 py-1.5 text-sm font-semibold focus:border-accent-ink focus:outline-none disabled:opacity-60",
          invoice.paymentStatus === "PAID" ? "border-emerald-200 text-emerald-800" : invoice.paymentStatus === "OVERDUE" ? "border-red-200 text-red-700" : "border-slate-200 text-primary",
        )}
      >
        {PAYMENT_CHOICES.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
      {invoice.paymentStatus === "OVERDUE" && status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
      {!compact && invoice.paymentStatus === "PAID" && invoice.paidAt && (
        <span className="text-xs text-slate-500">
          am {formatDate(invoice.paidAt)}
          {invoice.paymentMethod && ` · ${paymentMethodLabel[invoice.paymentMethod]}`}
        </span>
      )}
      {error && <p className="max-w-48 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
