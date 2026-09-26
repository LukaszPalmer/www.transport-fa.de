"use client";

import { INVOICE_UNIT_INFO, INVOICE_UNITS, MAX_INVOICE_LINES, VAT_RATES, type InvoiceUnit, type VatRate } from "@fa/shared";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatEuro } from "@/lib/portal-format";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { emptyLine, type LineState } from "./state";

const smallInput = cn(inputClasses, "h-11 px-3 text-sm");
const smallSelect = cn(selectClasses, "h-11 pl-3 pr-9 text-sm bg-[position:right_0.6rem_center]");

/** Positionen erfassen: Beschreibung (1. Zeile fett auf der Rechnung), Menge, Einheit, Einzelpreis, USt. */
export function LinesEditor({
  lines,
  lineNetCents,
  showVat,
  errors,
  onChange,
}: {
  lines: LineState[];
  lineNetCents: number[];
  showVat: boolean;
  errors: Record<string, string>;
  onChange: (lines: LineState[]) => void;
}) {
  const update = (key: string, patch: Partial<LineState>) => onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  const move = (index: number, offset: -1 | 1) => {
    const next = [...lines];
    const [line] = next.splice(index, 1);
    next.splice(index + offset, 0, line!);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {errors.lines && <p className="text-sm font-medium text-red-600">{errors.lines}</p>}
      <ol className="space-y-3">
        {lines.map((line, index) => {
          const error = (field: string) => errors[`lines.${index}.${field}`];
          const id = `position-${line.key}`;
          return (
            <li key={line.key} className="rounded-2xl border border-slate-200 bg-white p-4 transition-shadow focus-within:border-accent/60 focus-within:shadow-card">
              <div className="flex items-start gap-3">
                <span className="mt-2.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-bold text-slate-500">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={`${id}-description`} className="sr-only">
                    Leistung von Position {index + 1}
                  </label>
                  <textarea
                    id={`${id}-description`}
                    value={line.description}
                    onChange={(event) => update(line.key, { description: event.target.value })}
                    rows={Math.min(5, Math.max(2, line.description.split("\n").length))}
                    maxLength={1000}
                    placeholder={"Leistung, z. B. Umzug Berlin → Hamburg\nWeitere Zeilen: Details (optional)"}
                    aria-invalid={Boolean(error("description")) || undefined}
                    className={cn(inputClasses, "resize-y py-2.5 text-sm leading-relaxed")}
                  />
                  {error("description") && <p className="mt-1 text-xs font-medium text-red-600">{error("description")}</p>}

                  <div className={cn("mt-3 grid grid-cols-2 gap-3", showVat ? "sm:grid-cols-[5.5rem_8.5rem_minmax(9rem,1fr)_5.5rem_7rem]" : "sm:grid-cols-[5.5rem_8.5rem_minmax(9rem,1fr)_7rem]")}>
                    <div>
                      <label htmlFor={`${id}-quantity`} className="mb-1 block text-xs font-semibold text-slate-500">
                        Menge
                      </label>
                      <input
                        id={`${id}-quantity`}
                        value={line.quantity}
                        onChange={(event) => update(line.key, { quantity: event.target.value })}
                        inputMode="decimal"
                        autoComplete="off"
                        aria-invalid={Boolean(error("quantity")) || undefined}
                        className={cn(smallInput, "text-right tabular-nums")}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${id}-unit`} className="mb-1 block text-xs font-semibold text-slate-500">
                        Einheit
                      </label>
                      <select id={`${id}-unit`} value={line.unit} onChange={(event) => update(line.key, { unit: event.target.value as InvoiceUnit })} className={smallSelect}>
                        {INVOICE_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {INVOICE_UNIT_INFO[unit].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`${id}-price`} className="mb-1 block text-xs font-semibold text-slate-500">
                        Einzelpreis netto
                      </label>
                      <input
                        id={`${id}-price`}
                        value={line.price}
                        onChange={(event) => update(line.key, { price: event.target.value })}
                        inputMode="decimal"
                        placeholder="0,00 €"
                        autoComplete="off"
                        aria-invalid={Boolean(error("unitPriceCents")) || undefined}
                        className={cn(smallInput, "text-right tabular-nums")}
                      />
                    </div>
                    {showVat && (
                      <div>
                        <label htmlFor={`${id}-vat`} className="mb-1 block text-xs font-semibold text-slate-500">
                          USt.
                        </label>
                        <select id={`${id}-vat`} value={line.vatRate} onChange={(event) => update(line.key, { vatRate: Number(event.target.value) as VatRate })} className={smallSelect}>
                          {VAT_RATES.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate} %
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="col-span-2 flex items-end justify-end sm:col-span-1">
                      <p className="pb-2.5 text-right text-sm">
                        <span className="block text-xs text-slate-500">Betrag netto</span>
                        <strong className="font-semibold text-primary tabular-nums">{formatEuro(lineNetCents[index] ?? 0)}</strong>
                      </p>
                    </div>
                  </div>
                  {(error("quantity") || error("unitPriceCents")) && (
                    <p className="mt-1 text-xs font-medium text-red-600">{error("quantity") ?? error("unitPriceCents")}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onChange(lines.filter((item) => item.key !== line.key))}
                    disabled={lines.length === 1}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:invisible"
                    title="Position entfernen"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    <span className="sr-only">Position {index + 1} entfernen</span>
                  </button>
                  {index > 0 && (
                    <button type="button" onClick={() => move(index, -1)} className="rounded-lg p-2 text-slate-400 hover:bg-surface hover:text-primary" title="Nach oben">
                      <ArrowUp aria-hidden="true" className="size-4" />
                      <span className="sr-only">Position {index + 1} nach oben</span>
                    </button>
                  )}
                  {index < lines.length - 1 && (
                    <button type="button" onClick={() => move(index, 1)} className="rounded-lg p-2 text-slate-400 hover:bg-surface hover:text-primary" title="Nach unten">
                      <ArrowDown aria-hidden="true" className="size-4" />
                      <span className="sr-only">Position {index + 1} nach unten</span>
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {lines.length < MAX_INVOICE_LINES && (
        <button
          type="button"
          onClick={() => onChange([...lines, emptyLine()])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-accent-ink hover:border-accent/60 hover:bg-accent/5"
        >
          <Plus aria-hidden="true" className="size-4" /> Position hinzufügen
        </button>
      )}
    </div>
  );
}
