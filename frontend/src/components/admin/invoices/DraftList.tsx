"use client";

import type { AdminInvoiceDraftRow } from "@fa/shared";
import { FilePenLine, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/content/navigation";
import { formatRelative } from "@/lib/admin-format";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatEuro } from "@/lib/portal-format";

/** Offene Rechnungsentwürfe – für Kunden unsichtbar, bis sie gesendet werden. */
export function DraftList({ drafts }: { drafts: AdminInvoiceDraftRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  const remove = async (draft: AdminInvoiceDraftRow) => {
    if (!window.confirm(`Entwurf für ${draft.customer.name} endgültig verwerfen?`)) return;
    setBusy(draft.id);
    setError(undefined);
    try {
      await apiRequest(`/admin/invoices/drafts/${draft.id}`, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <div>
      {error && <p className="mb-3 text-sm font-medium text-red-600">{error}</p>}
      <ul className="divide-y divide-slate-100">
        {drafts.map((draft) => (
          <li key={draft.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <Link href={`${routes.adminInvoiceDrafts}/${draft.id}`} className="group flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                <FilePenLine aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-primary group-hover:text-accent-ink">
                  {draft.customer.name}
                  {draft.shipment && <span className="font-normal text-slate-500"> · {draft.shipment.shipmentNumber}</span>}
                </span>
                <span className="block text-xs text-slate-500">
                  {draft.lineCount} {draft.lineCount === 1 ? "Position" : "Positionen"} · bearbeitet {formatRelative(draft.updatedAt)}
                  {draft.updatedBy && ` von ${draft.updatedBy}`}
                </span>
              </span>
            </Link>
            <span className="flex items-center gap-3">
              <strong className="font-semibold text-primary tabular-nums">{formatEuro(draft.grossCents)}</strong>
              <Link href={`${routes.adminInvoiceDrafts}/${draft.id}`} className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-accent-ink hover:bg-surface">
                Weiter bearbeiten
              </Link>
              <button
                type="button"
                onClick={() => void remove(draft)}
                disabled={busy === draft.id}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                title="Entwurf verwerfen"
              >
                {busy === draft.id ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Trash2 aria-hidden="true" className="size-4" />}
                <span className="sr-only">Entwurf für {draft.customer.name} verwerfen</span>
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
