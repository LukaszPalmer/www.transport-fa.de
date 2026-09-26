"use client";

import type { DocumentItem } from "@fa/shared";
import { Download, FileImage, FileText, LoaderCircle, Printer, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest, documentUrl } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { documentCategoryLabel, formatDate, formatFileSize } from "@/lib/portal-format";
import { AuthAlert } from "@/components/portal/auth-fields";
import { EmptyState, StatusBadge } from "@/components/portal/dashboard/ui";

type Filter = "all" | "driver" | "office" | "own";

const FILTERS: Array<{ id: Filter; label: string; match: (document: DocumentItem) => boolean }> = [
  { id: "all", label: "Alle", match: () => true },
  { id: "driver", label: "Für den Fahrer", match: (document) => document.handToDriver },
  { id: "office", label: "Von FA Transport", match: (document) => document.source === "OFFICE" },
  { id: "own", label: "Meine Uploads", match: (document) => document.source === "CUSTOMER" },
];

/** Alle Dokumente mit Filter, Ansehen & Drucken, Download und Löschen eigener Uploads. */
export function DocumentLibrary({ documents }: { documents: DocumentItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<string>();
  const [error, setError] = useState<string>();

  const visible = documents.filter(FILTERS.find((entry) => entry.id === filter)!.match);

  const remove = async (document: DocumentItem) => {
    if (!window.confirm(`„${document.title}“ wirklich löschen? Das lässt sich nicht rückgängig machen.`)) return;
    setDeleting(document.id);
    setError(undefined);
    try {
      await apiRequest(`/portal/documents/${document.id}`, { method: "DELETE" });
      router.refresh();
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    } finally {
      setDeleting(undefined);
    }
  };

  return (
    <section aria-labelledby="library-title" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-primary/5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="library-title" className="font-display text-lg font-bold text-primary">
          Meine Dokumente
        </h2>
        <div role="group" aria-label="Dokumente filtern" className="flex flex-wrap gap-2">
          {FILTERS.map((entry) => {
            const count = documents.filter(entry.match).length;
            return (
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
                {entry.label} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-5">
          <AuthAlert tone="error">{error}</AuthAlert>
        </div>
      )}

      <div className="mt-6">
        {visible.length === 0 ? (
          <EmptyState
            title={documents.length === 0 ? "Noch keine Dokumente" : "Keine Dokumente in dieser Ansicht"}
            text={
              documents.length === 0
                ? "Laden Sie Zoll- und Frachtpapiere hoch. Unterlagen, die wir für Sie bereitstellen, erscheinen ebenfalls hier."
                : "Wählen Sie oben eine andere Ansicht."
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((document) => {
              const isImage = document.mimeType.startsWith("image/");
              const TypeIcon = isImage ? FileImage : FileText;
              return (
                <li key={document.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-accent-ink ring-1 ring-slate-200">
                      <TypeIcon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-primary">{document.title}</p>
                      <p className="text-sm text-slate-500">
                        {documentCategoryLabel[document.category]} · {formatDate(document.createdAt)} · {formatFileSize(document.sizeBytes)}
                        {document.shipmentNumber && ` · Auftrag ${document.shipmentNumber}`}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {document.handToDriver && <StatusBadge tone="info">Dem Fahrer mitgeben</StatusBadge>}
                        {document.source === "OFFICE" && <StatusBadge tone="neutral">Von FA Transport</StatusBadge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 pl-13 sm:pl-0">
                    <a
                      href={documentUrl(document.id, "view")}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
                    >
                      <Printer aria-hidden="true" className="size-4" />
                      Ansehen & Drucken
                    </a>
                    <a
                      href={documentUrl(document.id, "download")}
                      className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-primary hover:bg-slate-50"
                      aria-label={`${document.title} herunterladen`}
                      title="Herunterladen"
                    >
                      <Download aria-hidden="true" className="size-4" />
                    </a>
                    {document.canDelete && (
                      <button
                        type="button"
                        onClick={() => remove(document)}
                        disabled={deleting === document.id}
                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
                        aria-label={`${document.title} löschen`}
                        title="Löschen"
                      >
                        {deleting === document.id ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Trash2 aria-hidden="true" className="size-4" />}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
