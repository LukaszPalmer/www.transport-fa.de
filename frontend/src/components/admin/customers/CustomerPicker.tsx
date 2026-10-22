"use client";

import type { AdminCustomerList, AdminCustomerRow } from "@fa/shared";
import { ChevronDown, LoaderCircle, Search, UserPlus } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { inputClasses } from "@/components/forms/fields";
import { CreateCustomerDialog, type NewCustomerDefaults } from "./CreateCustomerDialog";

/** Mit Rechnungsadresse – Aufträge übernehmen sie auf Knopfdruck als Abhol- oder Lieferadresse. */
export type PickedCustomer = Pick<AdminCustomerRow, "id" | "name" | "customerNumber" | "billingAddress">;

/** So viele Kunden zeigt die Liste auf einmal – darüber hinaus grenzt die Suche ein. */
const LIST_LIMIT = 50;

/** Ergebnis zu genau einem Suchbegriff – solange er vom aktuellen abweicht, wird geladen. */
type Loaded = { term: string; list?: AdminCustomerList; error?: string };

/** Suchbegriff als Vorbelegung für „Neuen Kunden anlegen“: E-Mail-Adresse oder Vor- und Nachname. */
function defaultsFromTerm(term: string): NewCustomerDefaults {
  if (term.includes("@")) return { email: term };
  if (/\d/.test(term)) return {}; // Kundennummer, PLZ oder Telefon – kein Name
  const words = term.split(/\s+/).filter(Boolean);
  if (words.length === 1) return { lastName: words[0] };
  return { firstName: words[0], lastName: words.slice(1).join(" ") };
}

/**
 * Kunde auswählen (Rechnungen, Aufträge, Anfragen): Ein Klick ins Feld zeigt alle Kunden – egal ob per
 * E-Mail oder Google registriert –, Tippen filtert nach Name, Firma, E-Mail, Kundennummer oder Ort.
 * Auswahl mit der Maus oder mit Pfeiltasten und Enter. Mit `allowCreate` lässt sich ein fehlender
 * Kunde direkt anlegen (Telefonkunde) – er ist danach sofort ausgewählt.
 */
export function CustomerPicker({
  value,
  onChange,
  locked,
  allowCreate,
  createDefaults,
}: {
  value?: PickedCustomer;
  onChange: (customer: PickedCustomer | undefined) => void;
  /** Vorbelegt aus der Kundenakte – nicht änderbar. */
  locked?: boolean;
  /** „Neuen Kunden anlegen“ anbieten (Recht „Kunden bearbeiten“). */
  allowCreate?: boolean;
  /** Vorbelegung für neue Kunden, z. B. aus einer Anfrage – geht dem Suchbegriff vor. */
  createDefaults?: NewCustomerDefaults;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<Loaded>();
  const [active, setActive] = useState(0);
  const [creating, setCreating] = useState<NewCustomerDefaults>();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const term = query.trim();

  useEffect(() => {
    if (value || !open) return;
    let current = true;
    const timer = setTimeout(
      () => {
        apiRequest<AdminCustomerList>(`/admin/customers?limit=${LIST_LIMIT}${term ? `&q=${encodeURIComponent(term)}` : ""}`).then(
          (list) => current && setLoaded({ term, list }),
          (caught: unknown) => current && setLoaded({ term, error: errorMessage(caught) }),
        );
      },
      term ? 200 : 0,
    );
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [open, term, value]);

  const customers = loaded?.list?.customers ?? [];
  const total = loaded?.list?.total ?? 0;
  const loading = loaded?.term !== term;
  const activeIndex = Math.min(active, customers.length - 1);

  // Den per Pfeiltaste gewählten Eintrag im sichtbaren Bereich der Liste halten.
  useEffect(() => {
    if (open && activeIndex >= 0) document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, listId]);

  const choose = (row: AdminCustomerRow) => {
    onChange({ id: row.id, name: row.companyName || row.name, customerNumber: row.customerNumber, billingAddress: row.billingAddress });
    setOpen(false);
    setQuery("");
  };

  const startCreate = () => {
    setCreating(createDefaults ?? defaultsFromTerm(term));
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive(event.key === "ArrowDown" ? Math.min(activeIndex + 1, customers.length - 1) : Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter" && open) {
      event.preventDefault(); // Formular nicht absenden, solange die Liste offen ist
      if (!loading && customers[activeIndex]) choose(customers[activeIndex]);
    } else if (event.key === "Escape" && open) {
      event.preventDefault(); // schließt nur die Liste, nicht den umgebenden Dialog
      setOpen(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-surface px-4 py-3 text-sm">
        <span>
          <strong className="text-primary">{value.name}</strong>{" "}
          <span className="text-slate-500">
            · {value.customerNumber}
            {value.billingAddress && ` · ${value.billingAddress.city}`}
          </span>
        </span>
        {!locked && (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              onChange(undefined);
            }}
            className="font-semibold text-accent-ink hover:underline"
          >
            Ändern
          </button>
        )}
      </div>
    );
  }

  const status =
    loading && !loaded ? "Kunden werden geladen …" : term ? `${total} Treffer` : total === 0 ? "Alle Kunden" : `${total} ${total === 1 ? "Kunde" : "Kunden"} · neueste zuerst`;

  return (
    <>
      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          role="combobox"
          aria-label="Kunde suchen"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          // Nach „Ändern" direkt weitersuchen können.
          autoFocus={open}
          value={query}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Name, Firma, E-Mail oder Kundennummer"
          autoComplete="off"
          className={`${inputClasses} h-12 pr-11 pl-11`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Kundenliste schließen" : "Alle Kunden anzeigen"}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setOpen((isOpen) => !isOpen);
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary"
        >
          <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
  
        {open && (
          <div
            // Fokus bleibt im Suchfeld – ein Klick in die Liste schließt sie nicht vor der Auswahl.
            onMouseDown={(event) => event.preventDefault()}
            className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-primary/10"
          >
            <p className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
              <span>{loaded?.error ? "Kundenliste nicht verfügbar" : status}</span>
              {loading && <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />}
            </p>
  
            {loaded?.error ? (
              <p className="px-4 py-3 text-sm font-medium text-red-600">{loaded.error}</p>
            ) : customers.length > 0 ? (
              <ul id={listId} role="listbox" aria-label="Kunden" className="max-h-72 overflow-y-auto py-1">
                {customers.map((row, index) => (
                  <li
                    key={row.id}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(row)}
                    className={`cursor-pointer px-4 py-2.5 ${index === activeIndex ? "bg-surface" : ""}`}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <strong className="truncate text-sm text-primary">{row.companyName || row.name}</strong>
                      <span className="shrink-0 font-mono text-xs text-slate-500">{row.customerNumber}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {[row.companyName && row.name, row.email, row.billingAddress && `${row.billingAddress.postalCode} ${row.billingAddress.city}`].filter(Boolean).join(" · ")}
                      {!row.billingAddress && <span className="font-medium text-amber-700"> · Adresse fehlt</span>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              !loading && (
                <p className="px-4 py-3 text-sm text-slate-600">
                  {term ? (
                    <>
                      Kein Kunde gefunden für „{term}“.{" "}
                      <span className="text-slate-500">
                        {allowCreate ? "Neu? Dann unten direkt anlegen." : "Teil von Name, Firma, E-Mail oder Kundennummer eingeben."}
                      </span>
                    </>
                  ) : allowCreate ? (
                    "Noch keine Kunden – legen Sie den ersten unten direkt an. Kunden können sich auch selbst im Kundenportal registrieren."
                  ) : (
                    "Noch keine Kunden. Kunden legen ihr Konto selbst im Kundenportal an – per E-Mail oder Google."
                  )}
                </p>
              )
            )}
  
            {total > customers.length && customers.length > 0 && (
              <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                {total - customers.length} weitere – zum Eingrenzen weitertippen.
              </p>
            )}
  
            {allowCreate && (
              <button
                type="button"
                onClick={startCreate}
                className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-accent-ink hover:bg-surface"
              >
                <UserPlus aria-hidden="true" className="size-4" /> Neuen Kunden anlegen
              </button>
            )}
          </div>
        )}
      </div>
      {creating && (
        <CreateCustomerDialog
          defaults={creating}
          onClose={() => setCreating(undefined)}
          onCreated={(created) => {
            setCreating(undefined);
            setQuery("");
            onChange({ id: created.customer.id, name: created.customer.name, customerNumber: created.customer.customerNumber, billingAddress: created.customer.billingAddress });
          }}
        />
      )}
    </>
  );
}
