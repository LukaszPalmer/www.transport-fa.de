"use client";

import type { AdminCustomerList, AdminCustomerRow } from "@fa/shared";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { inputClasses } from "@/components/forms/fields";

/** Mit Rechnungsadresse – Aufträge übernehmen sie auf Knopfdruck als Abhol- oder Lieferadresse. */
export type PickedCustomer = Pick<AdminCustomerRow, "id" | "name" | "customerNumber" | "billingAddress">;

/** Kunde per Name, Kundennummer oder E-Mail suchen und auswählen (Dialoge im Admin-Bereich). */
export function CustomerPicker({
  value,
  onChange,
  locked,
}: {
  value?: PickedCustomer;
  onChange: (customer: PickedCustomer | undefined) => void;
  /** Vorbelegt aus der Kundenakte – nicht änderbar. */
  locked?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminCustomerRow[]>([]);

  useEffect(() => {
    if (value || query.trim().length < 2) return;
    let active = true;
    const timer = setTimeout(() => {
      apiRequest<AdminCustomerList>(`/admin/customers?limit=8&q=${encodeURIComponent(query.trim())}`).then(
        (list) => active && setResults(list.customers),
        () => active && setResults([]),
      );
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, value]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-surface px-4 py-3 text-sm">
        <span>
          <strong className="text-primary">{value.name}</strong> <span className="text-slate-500">· {value.customerNumber}</span>
        </span>
        {!locked && (
          <button type="button" onClick={() => onChange(undefined)} className="font-semibold text-accent-ink hover:underline">
            Ändern
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Name, Kundennummer, E-Mail oder Ort"
        autoComplete="off"
        className={`${inputClasses} h-12`}
      />
      {results.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-primary/10">
          {results.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => {
                  onChange({ id: row.id, name: row.companyName || row.name, customerNumber: row.customerNumber, billingAddress: row.billingAddress });
                  setResults([]);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-surface"
              >
                <strong className="text-primary">{row.companyName || row.name}</strong>{" "}
                <span className="text-slate-500">
                  · {row.customerNumber}
                  {row.billingAddress && ` · ${row.billingAddress.postalCode} ${row.billingAddress.city}`} · {row.email}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
