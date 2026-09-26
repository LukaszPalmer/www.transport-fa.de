"use client";

import {
  computeInvoiceTotals,
  DEFAULT_EXEMPTION_REASON,
  invoiceIssueProblems,
  PAYMENT_TERMS,
  TAX_TREATMENT_INFO,
  TAX_TREATMENTS,
  type AdminInvoiceDraft,
  type InvoiceAddress,
  type InvoiceEditorContext,
  type IssueInvoiceInput,
  type IssueInvoiceResponse,
  type TaxTreatment,
} from "@fa/shared";
import { AlertTriangle, CircleAlert, Eye, LoaderCircle, Mail, Save, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { routes } from "@/content/navigation";
import { formatTime, serviceLabel } from "@/lib/admin-format";
import { apiRequest, invoiceDraftPreviewUrl } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { addDays, berlinDay } from "@/lib/money-input";
import { formatDate, formatEuro, shipmentStatus } from "@/lib/portal-format";
import { FieldShell, inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { CustomerPicker, type PickedCustomer } from "../../customers/CustomerPicker";
import { Card } from "../../ui";
import { IssueDialog } from "./IssueDialog";
import { LinesEditor } from "./LinesEditor";
import { addressToBuyer, applyShipment, emptyState, stateForCustomer, stateFromDraft, toContent, toDraftInput, type BuyerState, type EditorState } from "./state";

const COUNTRIES = ["DE", "AT", "CH", "NL", "BE", "LU", "FR", "DK", "PL", "CZ", "IT", "ES", "SE", "GB"];
const countryNames = new Intl.DisplayNames(["de"], { type: "region" });
const TERM_LABEL = (days: number) => (days === 0 ? "Sofort fällig" : `${days} Tage`);

/**
 * Rechnung erstellen bzw. Entwurf bearbeiten. Speichern legt einen Entwurf an (nur im Admin
 * sichtbar), „Vorschau“ zeigt die PDF, „Senden“ schreibt die E-Rechnung fest.
 */
export function InvoiceEditor({ draft, initialContext, presetShipmentId }: { draft?: AdminInvoiceDraft; initialContext?: InvoiceEditorContext; presetShipmentId?: string }) {
  const router = useRouter();
  const [context, setContext] = useState(initialContext);
  const [customer, setCustomer] = useState<PickedCustomer | undefined>(
    draft
      ? draft.customer
      : initialContext && { id: initialContext.customer.id, name: initialContext.customer.companyName || `${initialContext.customer.firstName} ${initialContext.customer.lastName}`, customerNumber: initialContext.customer.customerNumber },
  );
  const [state, setState] = useState<EditorState>(() => {
    if (draft) return stateFromDraft(draft.content);
    if (!initialContext) return emptyState();
    const base = stateForCustomer(initialContext);
    return presetShipmentId ? applyShipment(base, initialContext, presetShipmentId) : base;
  });
  const [draftId, setDraftId] = useState(draft?.id);
  const [savedAt, setSavedAt] = useState<string | undefined>(draft?.updatedAt);
  const [dirty, setDirty] = useState(!draft && Boolean(initialContext));
  const [pending, setPending] = useState<"save" | "preview" | "delete">();
  const [error, setError] = useState<string>();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [showProblems, setShowProblems] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issuedId, setIssuedId] = useState<string>();
  const loadingCustomer = useRef<string | undefined>(undefined);

  const update = (patch: Partial<EditorState> | ((current: EditorState) => EditorState)) => {
    setState((current) => (typeof patch === "function" ? patch(current) : { ...current, ...patch }));
    setDirty(true);
  };
  const updateBuyer = (patch: Partial<BuyerState>) => update((current) => ({ ...current, buyer: { ...current.buyer, ...patch } }));

  // Ungespeicherte Änderungen nicht versehentlich verlieren.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const chooseCustomer = async (next: PickedCustomer | undefined) => {
    setCustomer(next);
    setServerErrors({});
    if (!next) {
      setContext(undefined);
      update((current) => ({ ...current, customerId: undefined, shipmentId: "" }));
      return;
    }
    loadingCustomer.current = next.id;
    try {
      const loaded = await apiRequest<InvoiceEditorContext>(`/admin/invoices/drafts/context?customerId=${next.id}`);
      if (loadingCustomer.current !== next.id) return;
      setContext(loaded);
      update((current) => stateForCustomer(loaded, current));
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  // Draft ohne Kontext (z. B. direkt aufgerufen): Kontext nachladen.
  useEffect(() => {
    if (context || !state.customerId) return;
    let active = true;
    apiRequest<InvoiceEditorContext>(`/admin/invoices/drafts/context?customerId=${state.customerId}`).then(
      (loaded) => active && setContext(loaded),
      (caught: unknown) => active && setError(errorMessage(caught)),
    );
    return () => {
      active = false;
    };
  }, [context, state.customerId]);

  const { input, lines } = useMemo(() => toDraftInput(state), [state]);
  const totals = useMemo(() => computeInvoiceTotals(lines, state.taxTreatment), [lines, state.taxTreatment]);
  const { content, errors: inputErrors } = useMemo(() => toContent(state), [state]);
  const problems = useMemo(() => (content ? invoiceIssueProblems(content) : {}), [content]);
  const errors: Record<string, string> = { ...serverErrors, ...(showProblems ? { ...problems, ...inputErrors } : inputErrors) };
  const issueDate = berlinDay();
  const dueDate = addDays(issueDate, state.paymentTermDays);
  const selectedShipment = context?.shipments.find((shipment) => shipment.id === state.shipmentId);

  /** Speichert den Entwurf (legt ihn beim ersten Mal an). Liefert die ID oder undefined bei Fehler. */
  const save = async (): Promise<string | undefined> => {
    if (!state.customerId) {
      setServerErrors({ customerId: "Bitte zuerst einen Kunden auswählen." });
      return undefined;
    }
    setError(undefined);
    setServerErrors({});
    try {
      const saved = draftId
        ? await apiRequest<AdminInvoiceDraft>(`/admin/invoices/drafts/${draftId}`, { method: "PUT", body: input })
        : await apiRequest<AdminInvoiceDraft>("/admin/invoices/drafts", { method: "POST", body: input });
      if (!draftId) window.history.replaceState(null, "", `${routes.adminInvoiceDrafts}/${saved.id}`);
      setDraftId(saved.id);
      setSavedAt(saved.updatedAt);
      setDirty(false);
      return saved.id;
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) setServerErrors(caught.fields);
      setError(caught instanceof ApiError && caught.fields ? "Bitte prüfen Sie die markierten Angaben." : errorMessage(caught));
      return undefined;
    }
  };

  const saveDraft = async () => {
    setPending("save");
    await save();
    setPending(undefined);
  };

  const preview = async () => {
    // Fenster sofort öffnen (Klick-Geste), damit der Popup-Blocker nicht greift.
    const win = window.open("about:blank", "_blank");
    setPending("preview");
    const id = await save();
    setPending(undefined);
    if (id && win) win.location.href = invoiceDraftPreviewUrl(id);
    else win?.close();
  };

  // Hinweis verschwindet von selbst, sobald alles ausgefüllt ist.
  const incomplete = !content || Object.keys({ ...problems, ...inputErrors }).length > 0;

  const startIssue = () => {
    setShowProblems(true);
    setError(undefined);
    if (incomplete) {
      requestAnimationFrame(() => document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setIssuing(true);
  };

  const issue = async (options: IssueInvoiceInput): Promise<IssueInvoiceResponse> => {
    const id = await save();
    if (!id) throw new Error("Der Entwurf konnte nicht gespeichert werden.");
    try {
      const result = await apiRequest<IssueInvoiceResponse>(`/admin/invoices/drafts/${id}/issue`, { method: "POST", body: options });
      setDirty(false);
      setIssuedId(result.invoiceId);
      return result;
    } catch (caught) {
      if (caught instanceof ApiError && caught.fields) {
        setServerErrors(caught.fields);
        setShowProblems(true);
      }
      throw new Error(errorMessage(caught));
    }
  };

  const discard = async () => {
    if (!draftId) {
      router.push(routes.adminInvoices);
      return;
    }
    if (!window.confirm("Diesen Entwurf endgültig verwerfen?")) return;
    setPending("delete");
    try {
      await apiRequest(`/admin/invoices/drafts/${draftId}`, { method: "DELETE" });
      setDirty(false);
      router.push(routes.adminInvoices);
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught));
      setPending(undefined);
    }
  };

  const quickAddresses: Array<{ label: string; address: InvoiceAddress }> = [];
  if (context?.customer.billingAddress) quickAddresses.push({ label: "Rechnungsadresse aus Profil", address: context.customer.billingAddress });
  if (selectedShipment) {
    quickAddresses.push({ label: "Abholadresse", address: selectedShipment.pickup }, { label: "Lieferadresse", address: selectedShipment.delivery });
  }

  const field = (name: string) => `invoice-${name}`;
  const buyerField = (name: keyof BuyerState, label: string, options: { required?: boolean; className?: string; placeholder?: string; autoComplete?: string } = {}) => (
    <FieldShell id={field(name)} label={label} required={options.required} error={errors[`buyer.${name}`]} className={options.className}>
      <input
        id={field(name)}
        value={state.buyer[name]}
        onChange={(event) => updateBuyer({ [name]: event.target.value })}
        placeholder={options.placeholder}
        autoComplete={options.autoComplete ?? "off"}
        aria-invalid={Boolean(errors[`buyer.${name}`]) || undefined}
        className={cn(inputClasses, "h-12")}
      />
    </FieldShell>
  );

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        {showProblems && incomplete && <AuthAlert tone="error">Bitte ergänzen Sie die markierten Angaben – dann kann die Rechnung erstellt werden.</AuthAlert>}
        {context && context.sellerWarnings.length > 0 && (
          <p className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <span>
              <strong className="block">Firmendaten noch nicht vollständig</strong>
              Auf der Rechnung stehen noch Platzhalter für: {context.sellerWarnings.join(", ")}. Im Livebetrieb lassen sich Rechnungen erst versenden, wenn die echten Daten hinterlegt sind.
            </span>
          </p>
        )}

        <Card title="Kunde & Auftrag">
          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-sm font-semibold text-primary">
                Kunde<span className="ml-0.5 text-red-600" aria-hidden="true">*</span>
              </span>
              <CustomerPicker value={customer} onChange={(next) => void chooseCustomer(next)} />
              {errors.customerId && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.customerId}</p>}
            </div>
            {context && (
              <FieldShell id={field("shipment")} label="Zu welchem Auftrag?" error={errors.shipmentId} hint="Übernimmt Leistungsdatum, Ihre Referenz und – bei leerer Rechnung – die erste Position.">
                <select
                  id={field("shipment")}
                  value={state.shipmentId}
                  onChange={(event) => update((current) => applyShipment(current, context, event.target.value))}
                  className={selectClasses}
                >
                  <option value="">Kein bestimmter Auftrag</option>
                  {context.shipments.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.shipmentNumber} · {serviceLabel(shipment.service)} · {shipment.pickup.city} → {shipment.delivery.city} ({shipmentStatus[shipment.status].label})
                      {shipment.invoicedAs ? ` · abgerechnet: ${shipment.invoicedAs}` : ""}
                    </option>
                  ))}
                </select>
              </FieldShell>
            )}
            {selectedShipment?.invoicedAs && (
              <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />
                Für diesen Auftrag gibt es bereits die Rechnung {selectedShipment.invoicedAs}. Eine zweite Rechnung nur für zusätzliche Leistungen erstellen.
              </p>
            )}
          </div>
        </Card>

        {state.customerId && (
          <>
            <Card title="Rechnungsempfänger" description="So steht die Anschrift auf der Rechnung – passend fürs Fensterkuvert.">
              {quickAddresses.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {quickAddresses.map((entry) => (
                    <button
                      key={entry.label}
                      type="button"
                      onClick={() => update((current) => ({ ...current, buyer: addressToBuyer(current.buyer, entry.address) }))}
                      className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:text-primary hover:ring-slate-300"
                      title={`${entry.address.line1}, ${entry.address.postalCode} ${entry.address.city}`}
                    >
                      {entry.label} übernehmen
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {buyerField("companyName", "Firma")}
                {buyerField("name", state.buyer.companyName ? "Ansprechpartner" : "Name", { required: !state.buyer.companyName })}
                {buyerField("line1", "Straße und Hausnummer", { required: true, className: "sm:col-span-2" })}
                {buyerField("line2", "Adresszusatz", { className: "sm:col-span-2", placeholder: "z. B. Hinterhaus, 3. OG" })}
                <div className="grid grid-cols-[7rem_1fr] gap-4 sm:col-span-2">
                  {buyerField("postalCode", "PLZ", { required: true })}
                  {buyerField("city", "Ort", { required: true })}
                </div>
                <FieldShell id={field("countryCode")} label="Land" required error={errors["buyer.countryCode"]}>
                  <select id={field("countryCode")} value={state.buyer.countryCode} onChange={(event) => updateBuyer({ countryCode: event.target.value })} className={selectClasses}>
                    {(COUNTRIES.includes(state.buyer.countryCode) ? COUNTRIES : [state.buyer.countryCode, ...COUNTRIES]).map((code) => (
                      <option key={code} value={code}>
                        {countryNames.of(code) ?? code}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                {buyerField("vatId", "USt-IdNr. des Kunden", { required: state.taxTreatment === "REVERSE_CHARGE", placeholder: "z. B. DE123456789" })}
              </div>
            </Card>

            <Card title="Leistung & Zahlung">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldShell id={field("serviceFrom")} label="Leistungsdatum" required error={errors.serviceFrom} hint="Tag der Leistung – bei mehreren Tagen der erste.">
                  <input
                    id={field("serviceFrom")}
                    type="date"
                    value={state.serviceFrom}
                    onChange={(event) => update({ serviceFrom: event.target.value })}
                    aria-invalid={Boolean(errors.serviceFrom) || undefined}
                    className={cn(inputClasses, "h-12")}
                  />
                </FieldShell>
                <FieldShell id={field("serviceTo")} label="Leistung bis" error={errors.serviceTo} hint="Nur bei mehrtägigen Leistungen.">
                  <input
                    id={field("serviceTo")}
                    type="date"
                    value={state.serviceTo}
                    min={state.serviceFrom || undefined}
                    onChange={(event) => update({ serviceTo: event.target.value })}
                    aria-invalid={Boolean(errors.serviceTo) || undefined}
                    className={cn(inputClasses, "h-12")}
                  />
                </FieldShell>
                <FieldShell id={field("terms")} label="Zahlungsziel" required>
                  <select id={field("terms")} value={state.paymentTermDays} onChange={(event) => update({ paymentTermDays: Number(event.target.value) })} className={selectClasses}>
                    {PAYMENT_TERMS.map((days) => (
                      <option key={days} value={days}>
                        {TERM_LABEL(days)}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell id={field("reference")} label="Ihre Referenz / Leitweg-ID" error={errors.buyerReference} hint="Bestellnummer des Kunden – bei Behörden die Leitweg-ID.">
                  <input
                    id={field("reference")}
                    value={state.buyerReference}
                    onChange={(event) => update({ buyerReference: event.target.value })}
                    maxLength={100}
                    autoComplete="off"
                    className={cn(inputClasses, "h-12")}
                  />
                </FieldShell>
                <FieldShell id={field("tax")} label="Umsatzsteuer" required className="sm:col-span-2" hint={TAX_TREATMENT_INFO[state.taxTreatment].description}>
                  <select
                    id={field("tax")}
                    value={state.taxTreatment}
                    onChange={(event) => {
                      const taxTreatment = event.target.value as TaxTreatment;
                      update((current) => ({
                        ...current,
                        taxTreatment,
                        exemptionReason: taxTreatment === "EXEMPT" && !current.exemptionReason ? DEFAULT_EXEMPTION_REASON : current.exemptionReason,
                      }));
                    }}
                    className={selectClasses}
                  >
                    {TAX_TREATMENTS.map((treatment) => (
                      <option key={treatment} value={treatment}>
                        {TAX_TREATMENT_INFO[treatment].label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                {state.taxTreatment === "EXEMPT" && (
                  <FieldShell id={field("exemption")} label="Begründung der Steuerbefreiung" required error={errors.exemptionReason} className="sm:col-span-2">
                    <textarea
                      id={field("exemption")}
                      value={state.exemptionReason}
                      onChange={(event) => update({ exemptionReason: event.target.value })}
                      rows={2}
                      maxLength={300}
                      aria-invalid={Boolean(errors.exemptionReason) || undefined}
                      className={cn(inputClasses, "py-3")}
                    />
                  </FieldShell>
                )}
              </div>
            </Card>

            <Card title="Positionen" description="Erste Zeile der Beschreibung = Bezeichnung auf der Rechnung, weitere Zeilen = Details.">
              <LinesEditor
                lines={state.lines}
                lineNetCents={totals.lineNetCents}
                showVat={state.taxTreatment === "STANDARD"}
                errors={errors}
                onChange={(lines) => update({ lines })}
              />
            </Card>

            <Card title="Texte" description="Anrede und Einleitung über den Positionen, Grußformel am Ende.">
              <div className="space-y-4">
                <TextBlock id={field("intro")} label="Einleitung" value={state.introText} onChange={(introText) => update({ introText })} rows={4} />
                <TextBlock id={field("closing")} label="Schlusstext" value={state.closingText} onChange={(closingText) => update({ closingText })} rows={3} />
              </div>
            </Card>
          </>
        )}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
          <h2 className="font-display text-base font-bold text-primary">Zusammenfassung</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <SummaryRow label="Nächste Nummer" value={context?.nextNumber ?? "beim Versand"} />
            <SummaryRow label="Rechnungsdatum" value={`heute, ${formatDate(`${issueDate}T12:00:00Z`)}`} />
            <SummaryRow label="Fällig am" value={formatDate(`${dueDate}T12:00:00Z`)} />
          </dl>
          <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm tabular-nums">
            <SummaryRow label="Summe netto" value={formatEuro(totals.netCents)} />
            {totals.breakdown.map((entry) => (
              <SummaryRow
                key={`${entry.category}-${entry.rate}`}
                label={entry.category === "S" ? `USt. ${entry.rate} %` : entry.category === "AE" ? "USt. (Reverse Charge)" : "USt. (steuerfrei)"}
                value={formatEuro(entry.taxCents)}
              />
            ))}
            <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-2">
              <dt className="font-semibold text-primary">Rechnungsbetrag</dt>
              <dd className="font-display text-xl font-bold text-primary">{formatEuro(totals.grossCents)}</dd>
            </div>
          </dl>

          {context && (
            <p className={cn("mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs", context.customer.mailBlockedReason ? "bg-amber-50 text-amber-900" : "bg-surface text-slate-600")}>
              <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {context.customer.mailBlockedReason
                  ? `${context.customer.mailBlockedReason} Die Rechnung erscheint trotzdem im Kundenportal.`
                  : `Versand an ${context.customer.email} (PDF im Anhang) und ins Kundenportal.`}
              </span>
            </p>
          )}

          <div className="mt-5 space-y-2">
            <button type="button" onClick={startIssue} disabled={!state.customerId || Boolean(pending)} className={buttonClasses({ variant: "dark", size: "md", className: "w-full disabled:opacity-60" })}>
              <Send aria-hidden="true" className="size-4" /> Rechnung senden
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void preview()} disabled={!state.customerId || Boolean(pending)} className={buttonClasses({ variant: "outline", size: "sm", className: "disabled:opacity-60" })}>
                {pending === "preview" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Eye aria-hidden="true" className="size-4" />} Vorschau
              </button>
              <button type="button" onClick={() => void saveDraft()} disabled={!state.customerId || Boolean(pending)} className={buttonClasses({ variant: "outline", size: "sm", className: "disabled:opacity-60" })}>
                {pending === "save" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Save aria-hidden="true" className="size-4" />} Speichern
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500" aria-live="polite">
            {dirty ? "Ungespeicherte Änderungen" : savedAt ? `Entwurf gespeichert um ${formatTime(savedAt)} Uhr` : "Noch nicht gespeichert"}
          </p>
        </section>

        <p className="px-1 text-xs leading-relaxed text-slate-500">
          E-Rechnung nach EN 16931: Die PDF (ZUGFeRD) enthält die Rechnungsdaten maschinenlesbar – druckbar für Privatkunden, direkt verbuchbar für Firmen. Nach dem Versand ist die
          Rechnung unveränderlich.
        </p>
        <button
          type="button"
          onClick={() => void discard()}
          disabled={Boolean(pending)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 aria-hidden="true" className="size-3.5" /> {draftId ? "Entwurf verwerfen" : "Abbrechen"}
        </button>
      </aside>

      {issuing && context && (
        <IssueDialog
          summary={{
            customerName: state.buyer.companyName || state.buyer.name || customer?.name || "",
            email: context.customer.email,
            mailBlockedReason: context.customer.mailBlockedReason,
            grossCents: totals.grossCents,
            dueDate,
            nextNumber: context.nextNumber,
          }}
          onClose={() => (issuedId ? router.push(`${routes.adminInvoices}?beleg=${issuedId}`) : setIssuing(false))}
          onIssue={issue}
        />
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-primary">{value}</dd>
    </div>
  );
}

function TextBlock({ id, label, value, onChange, rows }: { id: string; label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <FieldShell id={id} label={label}>
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={rows} maxLength={2000} className={cn(inputClasses, "py-3 leading-relaxed")} />
    </FieldShell>
  );
}
