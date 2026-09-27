"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { periodPresets } from "@/lib/accounting-periods";
import { inputClasses, selectClasses } from "@/components/forms/fields";

/** Filterzeile über allen Auswertungen: Zeitraum-Vorlagen, eigener Zeitraum, Quelle. */
export function PeriodPicker({ from, to, source }: { from: string; to: string; source: string }) {
  const router = useRouter();
  const presets = periodPresets();
  const active = presets.find((preset) => preset.from === from && preset.to === to)?.key;
  const [custom, setCustom] = useState({ from, to });

  const go = (next: { from: string; to: string; source?: string }) => {
    const query = new URLSearchParams({ von: next.from, bis: next.to, quelle: next.source ?? source });
    router.push(`${routes.adminAccounting}?${query}`);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <nav aria-label="Zeitraum" className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => go(preset)}
            aria-pressed={active === preset.key}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
              active === preset.key ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary",
            )}
          >
            {preset.label}
          </button>
        ))}
      </nav>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go(custom);
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <label className="text-xs font-semibold text-slate-500">
          Von
          <input type="date" value={custom.from} onChange={(event) => setCustom({ ...custom, from: event.target.value })} className={`${inputClasses} mt-1 h-10 w-40`} />
        </label>
        <label className="text-xs font-semibold text-slate-500">
          Bis
          <input type="date" value={custom.to} onChange={(event) => setCustom({ ...custom, to: event.target.value })} className={`${inputClasses} mt-1 h-10 w-40`} />
        </label>
        <button type="submit" className="h-10 rounded-xl px-3 text-sm font-semibold ring-1 ring-slate-200 hover:bg-white">
          Anzeigen
        </button>
      </form>
      <label className="text-xs font-semibold text-slate-500">
        Belege
        <select value={source} onChange={(event) => go({ from, to, source: event.target.value })} className={`${selectClasses} mt-1 h-10`}>
          <option value="ALL">Alle (erstellt + hochgeladen)</option>
          <option value="GENERATED">Nur im Portal erstellte E-Rechnungen</option>
        </select>
      </label>
    </div>
  );
}
