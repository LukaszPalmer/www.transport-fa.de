"use client";

import type { IssueInvoiceInput, IssueInvoiceResponse, PaymentMethod } from "@fa/shared";
import { CircleAlert, CircleCheck, Eye, LoaderCircle, MailCheck, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { routes } from "@/content/navigation";
import { adminInvoiceUrl } from "@/lib/api/client";
import { formatDate, formatEuro } from "@/lib/portal-format";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { Dialog } from "../../Dialog";

const PAID_OPTIONS: Array<{ value: PaymentMethod | ""; label: string; hint: string }> = [
  { value: "", label: "Offen", hint: "Kunde zahlt per Überweisung – mit Zahlungsziel und GiroCode." },
  { value: "CASH", label: "Bereits bar bezahlt", hint: "Z. B. beim Umzug kassiert – die Rechnung weist den Betrag als erhalten aus." },
  { value: "BANK_TRANSFER", label: "Bereits überwiesen", hint: "Zahlung ist schon eingegangen." },
];

export interface IssueSummary {
  customerName: string;
  email: string;
  mailBlockedReason?: string;
  grossCents: number;
  dueDate: string;
  nextNumber: string;
}

/** Letzter Schritt: Rechnung festschreiben, im Portal bereitstellen und (optional) per E-Mail senden. */
export function IssueDialog({
  summary,
  onClose,
  onIssue,
}: {
  summary: IssueSummary;
  onClose: () => void;
  onIssue: (options: IssueInvoiceInput) => Promise<IssueInvoiceResponse>;
}) {
  const mailPossible = !summary.mailBlockedReason && Boolean(summary.email);
  const [sendEmail, setSendEmail] = useState(mailPossible);
  const [paidWith, setPaidWith] = useState<PaymentMethod | "">("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<IssueInvoiceResponse>();

  const issue = async () => {
    setPending(true);
    setError(undefined);
    try {
      setResult(await onIssue({ sendEmail: sendEmail && mailPossible, paidWith: paidWith || undefined }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Rechnung konnte nicht erstellt werden.");
    } finally {
      setPending(false);
    }
  };

  if (result) {
    const mailSent = result.mail.status === "SENT";
    return (
      <Dialog open onClose={onClose} title={`Rechnung ${result.number} erstellt`} description="Die Rechnung ist festgeschrieben und steht dem Kunden ab sofort im Kundenportal zur Verfügung.">
        <div className="space-y-5">
          <p className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <span>
              <strong className="block">Im Kundenportal bereitgestellt</strong>
              Unter „Rechnungen“ und auf der Übersicht des Kunden – als PDF zum Ansehen, Drucken und Herunterladen.
            </span>
          </p>
          <p
            className={
              mailSent
                ? "flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200"
                : "flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200"
            }
          >
            {mailSent ? (
              <MailCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            ) : (
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
            )}
            <span>
              <strong className="block">{mailSent ? `Per E-Mail gesendet an ${result.mail.to}` : "Keine E-Mail gesendet"}</strong>
              {mailSent ? "Die PDF-Rechnung ist im Anhang." : `${result.mail.reason ?? ""} Sie können die Rechnung später in der Liste erneut senden.`}
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={adminInvoiceUrl(result.invoiceId, "view")} target="_blank" rel="noopener" className={buttonClasses({ variant: "outline", size: "md" })}>
              <Eye aria-hidden="true" className="size-4" /> PDF ansehen
            </a>
            <Link href={`${routes.adminInvoices}?beleg=${result.invoiceId}`} className={buttonClasses({ variant: "dark", size: "md" })}>
              Zur Rechnungsliste
            </Link>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={() => !pending && onClose()} title="Rechnung senden" description="Danach ist die Rechnung festgeschrieben – Korrekturen sind nur noch per Storno möglich.">
      <div className="space-y-5">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl bg-surface p-4 text-sm">
          <div className="col-span-2">
            <dt className="text-slate-500">Kunde</dt>
            <dd className="font-semibold text-primary">{summary.customerName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Rechnungsbetrag</dt>
            <dd className="font-display text-lg font-bold text-primary tabular-nums">{formatEuro(summary.grossCents)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Voraussichtliche Nummer</dt>
            <dd className="font-semibold whitespace-nowrap text-primary">{summary.nextNumber}</dd>
          </div>
        </dl>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-primary">Zahlstatus</legend>
          <div className="space-y-2">
            {PAID_OPTIONS.map((option) => (
              <label key={option.value || "open"} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm has-checked:border-accent has-checked:bg-accent/5">
                <input type="radio" name="paidWith" value={option.value} checked={paidWith === option.value} onChange={() => setPaidWith(option.value)} className="mt-0.5 size-4 accent-primary" />
                <span>
                  <strong className="block text-primary">
                    {option.label}
                    {option.value === "" && ` – fällig am ${formatDate(`${summary.dueDate}T12:00:00Z`)}`}
                  </strong>
                  <span className="text-slate-500">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={mailPossible ? "flex items-start gap-3 text-sm text-slate-700" : "flex items-start gap-3 text-sm text-slate-400"}>
          <input
            type="checkbox"
            checked={sendEmail && mailPossible}
            disabled={!mailPossible}
            onChange={(event) => setSendEmail(event.target.checked)}
            className="mt-0.5 size-4 rounded border-slate-300 accent-primary"
          />
          <span>
            <strong className={mailPossible ? "text-primary" : undefined}>Per E-Mail senden{summary.email && ` an ${summary.email}`}</strong> – PDF-Rechnung (ZUGFeRD) im Anhang.
            {!mailPossible && <span className="mt-0.5 block text-amber-700">{summary.mailBlockedReason ?? "Keine E-Mail-Adresse hinterlegt."} Die Rechnung erscheint trotzdem im Portal.</span>}
          </span>
        </label>

        <button type="button" onClick={() => void issue()} disabled={pending} className={buttonClasses({ variant: "dark", size: "md", className: "w-full disabled:cursor-wait disabled:opacity-80" })}>
          {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          {pending ? "Rechnung wird erstellt …" : "Rechnung jetzt erstellen & senden"}
        </button>
      </div>
    </Dialog>
  );
}
