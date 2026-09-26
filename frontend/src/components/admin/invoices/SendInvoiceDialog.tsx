"use client";

import { INVOICE_TYPES, MAX_UPLOAD_BYTES, type AdminShipmentList, type ApiErrorBody, type InvoiceType, type PaymentMethod } from "@fa/shared";
import { CloudUpload, FileCheck2, LoaderCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type DragEvent, type FormEvent } from "react";
import { API_URL, apiRequest } from "@/lib/api/client";
import { NETWORK_ERROR } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { berlinDay, centsToInput, parseEuro } from "@/lib/money-input";
import { formatEuro, formatFileSize, invoiceTypeLabel } from "@/lib/portal-format";
import { FieldShell, inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { CustomerPicker, type PickedCustomer } from "../customers/CustomerPicker";
import { Dialog } from "../Dialog";

const MAX_MB = MAX_UPLOAD_BYTES / 1024 / 1024;
const VAT_RATES = [
  { value: "19", label: "19 %" },
  { value: "7", label: "7 %" },
  { value: "0", label: "0 %" },
  { value: "manual", label: "Manuell" },
] as const;
type VatRate = (typeof VAT_RATES)[number]["value"];

const PAID_OPTIONS: Array<{ value: PaymentMethod | ""; label: string }> = [
  { value: "", label: "Offen – Kunde zahlt noch" },
  { value: "BANK_TRANSFER", label: "Bereits bezahlt per Überweisung" },
  { value: "CASH", label: "Bereits bar bezahlt" },
];

/** Button + Dialog: Beleg aus der Buchhaltung (PDF) hochladen und an einen Kunden senden. */
export function SendInvoiceButton({ presetCustomer }: { presetCustomer?: PickedCustomer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClasses({ variant: "outline", size: "sm" })}>
        <CloudUpload aria-hidden="true" className="size-4" /> Beleg hochladen
      </button>
      {open && <SendInvoiceDialog presetCustomer={presetCustomer} onClose={() => setOpen(false)} />}
    </>
  );
}

function SendInvoiceDialog({ presetCustomer, onClose }: { presetCustomer?: PickedCustomer; onClose: () => void }) {
  const router = useRouter();
  const id = useId();
  const [customer, setCustomer] = useState(presetCustomer);
  const [shipments, setShipments] = useState<Array<{ id: string; label: string }>>([]);
  const [type, setType] = useState<InvoiceType>("INVOICE");
  const [net, setNet] = useState("");
  const [rate, setRate] = useState<VatRate>("19");
  const [manualVat, setManualVat] = useState("");
  const [file, setFile] = useState<File>();
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Aufträge des gewählten Kunden zur optionalen Zuordnung.
  useEffect(() => {
    if (!customer) return;
    let active = true;
    apiRequest<AdminShipmentList>(`/admin/shipments?customerId=${customer.id}&limit=50`).then(
      (list) =>
        active &&
        setShipments(list.shipments.map((shipment) => ({ id: shipment.id, label: `${shipment.shipmentNumber} · ${shipment.pickupCity} → ${shipment.deliveryCity}` }))),
      () => active && setShipments([]),
    );
    return () => {
      active = false;
    };
  }, [customer]);

  const netCents = parseEuro(net);
  const vatCents = rate === "manual" ? parseEuro(manualVat) : netCents === undefined ? undefined : Math.round((netCents * Number(rate)) / 100);
  const grossCents = netCents !== undefined && vatCents !== undefined ? netCents + vatCents : undefined;

  const chooseFile = (candidate: File | undefined) => {
    setFieldErrors((current) => ({ ...current, file: "" }));
    if (!candidate) return;
    if (candidate.type !== "application/pdf" && !/\.pdf$/i.test(candidate.name)) return setFieldErrors((current) => ({ ...current, file: "Bitte eine PDF-Datei wählen." }));
    if (candidate.size > MAX_UPLOAD_BYTES) return setFieldErrors((current) => ({ ...current, file: `Die Datei ist größer als ${MAX_MB} MB.` }));
    setFile(candidate);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const local: Record<string, string> = {};
    if (!customer) local.customerId = "Bitte einen Kunden auswählen.";
    if (netCents === undefined) local.netCents = "Bitte den Nettobetrag eingeben, z. B. 1.250,00.";
    if (vatCents === undefined) local.vatCents = "Bitte die Umsatzsteuer eingeben.";
    if (!file) local.file = "Bitte die PDF aus der Buchhaltung auswählen.";
    if (Object.keys(local).length > 0 || !customer || !file || netCents === undefined || vatCents === undefined) return setFieldErrors(local);

    const data = new FormData(event.currentTarget);
    const body = new FormData();
    // Felder vor der Datei – die API prüft sie, bevor sie die PDF annimmt.
    body.append("type", type);
    body.append("number", String(data.get("number") ?? ""));
    body.append("customerId", customer.id);
    body.append("shipmentId", String(data.get("shipmentId") ?? ""));
    body.append("issueDate", String(data.get("issueDate") ?? ""));
    body.append("dueDate", type === "INVOICE" ? String(data.get("dueDate") ?? "") : "");
    body.append("validUntil", type === "OFFER" ? String(data.get("validUntil") ?? "") : "");
    body.append("netCents", String(netCents));
    body.append("vatCents", String(vatCents));
    body.append("paidWith", type === "INVOICE" ? String(data.get("paidWith") ?? "") : "");
    body.append("notify", data.get("notify") === "on" ? "true" : "false");
    body.append("file", file, file.name);

    setError(undefined);
    setFieldErrors({});
    setProgress(0);

    const request = new XMLHttpRequest();
    request.open("POST", `${API_URL}/api/v1/admin/invoices`);
    request.withCredentials = true;
    request.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
    };
    request.onerror = () => {
      setProgress(undefined);
      setError(NETWORK_ERROR);
    };
    request.onload = () => {
      setProgress(undefined);
      if (request.status === 201) {
        onClose();
        router.refresh();
        return;
      }
      const response = (() => {
        try {
          return JSON.parse(request.responseText) as ApiErrorBody;
        } catch {
          return undefined;
        }
      })();
      if (response?.error.fields) setFieldErrors(response.error.fields);
      else setError(response?.error.message ?? "Der Beleg konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
    };
    request.send(body);
  };

  const uploading = progress !== undefined;
  const field = (name: string) => `${id}-${name}`;

  return (
    <Dialog
      open
      onClose={onClose}
      title="Beleg hochladen"
      description="PDF aus der Buchhaltung (z. B. Lexware) hochladen und die Eckdaten übernehmen. Der Kunde sieht den Beleg sofort im Kundenportal."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        {Object.keys(fieldErrors).some((key) => fieldErrors[key]) && !error && (
          <AuthAlert tone="error">Bitte prüfen Sie die markierten Angaben.</AuthAlert>
        )}

        <div>
          <span className="mb-2 block text-sm font-semibold text-primary">
            Kunde<span className="ml-0.5 text-red-600" aria-hidden="true">*</span>
          </span>
          <CustomerPicker
            value={customer}
            onChange={(next) => {
              setCustomer(next);
              setShipments([]);
            }}
            locked={Boolean(presetCustomer)}
          />
          {fieldErrors.customerId && <p className="mt-1.5 text-sm font-medium text-red-600">{fieldErrors.customerId}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldShell id={field("type")} label="Belegart" required error={fieldErrors.type}>
            <select id={field("type")} value={type} onChange={(event) => setType(event.target.value as InvoiceType)} className={selectClasses}>
              {INVOICE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {invoiceTypeLabel[value]}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldShell id={field("number")} label="Belegnummer" required error={fieldErrors.number} hint="Wie auf dem PDF">
            <input id={field("number")} name="number" required maxLength={40} placeholder="z. B. RE-2026-0042" autoComplete="off" className={cn(inputClasses, "h-12")} />
          </FieldShell>
        </div>

        {shipments.length > 0 && (
          <FieldShell id={field("shipment")} label="Zu welchem Auftrag?" error={fieldErrors.shipmentId}>
            <select id={field("shipment")} name="shipmentId" defaultValue="" className={selectClasses}>
              <option value="">Kein bestimmter Auftrag</option>
              {shipments.map((shipment) => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.label}
                </option>
              ))}
            </select>
          </FieldShell>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldShell id={field("issueDate")} label="Belegdatum" required error={fieldErrors.issueDate}>
            <input id={field("issueDate")} name="issueDate" type="date" required defaultValue={berlinDay()} className={cn(inputClasses, "h-12")} />
          </FieldShell>
          {type === "INVOICE" && (
            <FieldShell id={field("dueDate")} label="Fällig am" required error={fieldErrors.dueDate}>
              <input id={field("dueDate")} name="dueDate" type="date" required defaultValue={berlinDay(14)} className={cn(inputClasses, "h-12")} />
            </FieldShell>
          )}
          {type === "OFFER" && (
            <FieldShell id={field("validUntil")} label="Gültig bis" error={fieldErrors.validUntil}>
              <input id={field("validUntil")} name="validUntil" type="date" defaultValue={berlinDay(30)} className={cn(inputClasses, "h-12")} />
            </FieldShell>
          )}
        </div>

        <fieldset className="rounded-2xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-primary">Beträge</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldShell id={field("net")} label="Netto (€)" required error={fieldErrors.netCents}>
              <input
                id={field("net")}
                value={net}
                onChange={(event) => setNet(event.target.value)}
                inputMode="decimal"
                placeholder="1.250,00"
                autoComplete="off"
                className={cn(inputClasses, "h-12 text-right tabular-nums")}
              />
            </FieldShell>
            <FieldShell id={field("rate")} label="Umsatzsteuer" required error={fieldErrors.vatCents}>
              <div className="flex gap-2">
                <select
                  id={field("rate")}
                  value={rate}
                  onChange={(event) => {
                    const next = event.target.value as VatRate;
                    if (next === "manual" && vatCents !== undefined) setManualVat(centsToInput(vatCents));
                    setRate(next);
                  }}
                  className={cn(selectClasses, rate === "manual" ? "w-32" : "")}
                >
                  {VAT_RATES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {rate === "manual" && (
                  <input
                    aria-label="Umsatzsteuer in Euro"
                    value={manualVat}
                    onChange={(event) => setManualVat(event.target.value)}
                    inputMode="decimal"
                    placeholder="237,50"
                    className={cn(inputClasses, "h-12 min-w-0 flex-1 text-right tabular-nums")}
                  />
                )}
              </div>
            </FieldShell>
          </div>
          <p className="mt-4 flex items-baseline justify-between gap-4 rounded-xl bg-surface px-4 py-3 text-sm">
            <span className="text-slate-600">
              Gesamt brutto{vatCents !== undefined && rate !== "manual" && <> · inkl. {formatEuro(vatCents)} USt</>}
            </span>
            <strong className="font-display text-lg text-primary tabular-nums">{grossCents === undefined ? "–" : formatEuro(grossCents)}</strong>
          </p>
          <p className="mt-2 text-xs text-slate-500">Bitte mit dem Gesamtbetrag auf dem PDF vergleichen – bei gemischten Steuersätzen „Manuell“ wählen.</p>
        </fieldset>

        {type === "INVOICE" && (
          <FieldShell id={field("paidWith")} label="Zahlstatus" required error={fieldErrors.paidWith}>
            <select id={field("paidWith")} name="paidWith" defaultValue="" className={selectClasses}>
              {PAID_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldShell>
        )}

        <div>
          <label
            htmlFor={field("file")}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
              dragging ? "border-accent bg-accent/5" : "border-slate-300 bg-surface hover:border-accent/60",
              fieldErrors.file && "border-red-300",
            )}
          >
            {file ? (
              <>
                <FileCheck2 aria-hidden="true" className="size-7 text-emerald-600" />
                <span className="max-w-full truncate font-semibold text-primary">{file.name}</span>
                <span className="text-xs text-slate-500">{formatFileSize(file.size)} · zum Ändern klicken</span>
              </>
            ) : (
              <>
                <CloudUpload aria-hidden="true" className="size-7 text-accent-ink" />
                <span className="font-semibold text-primary">PDF hierher ziehen oder auswählen</span>
                <span className="text-xs text-slate-500">z. B. die E-Rechnung aus Lexware · max. {MAX_MB} MB</span>
              </>
            )}
          </label>
          <input id={field("file")} type="file" accept=".pdf,application/pdf" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
          {fieldErrors.file && <p className="mt-1.5 text-sm font-medium text-red-600">{fieldErrors.file}</p>}
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" name="notify" defaultChecked className="mt-0.5 size-4 rounded border-slate-300 accent-primary" />
          <span>
            <strong className="text-primary">Kunden per E-Mail benachrichtigen</strong> – mit Link zum Beleg im Kundenportal (sofern der Kunde Beleg-Mails nicht
            abbestellt hat).
          </span>
        </label>

        {uploading && (
          <div className="space-y-1.5" aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500">Wird hochgeladen … {progress} %</p>
          </div>
        )}

        <button type="submit" disabled={uploading} className={buttonClasses({ variant: "dark", size: "md", className: "disabled:cursor-wait disabled:opacity-80" })}>
          {uploading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          {uploading ? "Wird gesendet …" : "Beleg senden"}
        </button>
      </form>
    </Dialog>
  );
}
