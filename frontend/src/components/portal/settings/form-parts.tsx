"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { buttonClasses } from "@/components/ui/button-styles";

const messages = defineMessages({
  de: { save: "Speichern", saving: "Wird gespeichert …", saved: "Gespeichert" },
  en: { save: "Save", saving: "Saving …", saved: "Saved" },
});

/** Bausteine der Einstellungs-Formulare: kompakter Speichern-Button und Erfolgsmeldung. */

export function SaveButton({ pending, children }: { pending: boolean; children?: ReactNode }) {
  const t = useMessages(messages);
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClasses({ variant: "dark", size: "sm", className: "disabled:cursor-wait disabled:opacity-80" })}
    >
      {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {pending ? t.saving : (children ?? t.save)}
    </button>
  );
}

export function SavedNote({ children }: { children?: ReactNode }) {
  const t = useMessages(messages);
  return (
    <p role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
      <CheckCircle2 aria-hidden="true" className="size-4" />
      {children ?? t.saved}
    </p>
  );
}

/** API-Feldfehler auf Formularfelder abbilden (z. B. newPassword → Feld „newPassword"). */
export function mapFieldErrors(fields: Record<string, string> | undefined, aliases: Record<string, string> = {}): Record<string, string> {
  if (!fields) return {};
  return Object.fromEntries(Object.entries(fields).map(([field, message]) => [aliases[field] ?? field, message]));
}
