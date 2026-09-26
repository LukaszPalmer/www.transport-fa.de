"use client";

import { ACCOUNT_DELETE_CONFIRMATION, isDeleteConfirmation } from "@fa/shared";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { apiRequest, googleSignInUrl } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { AuthAlert, PasswordField } from "./auth-fields";

const DELETED_DATA = [
  "Ihre Anmeldung (E-Mail/Passwort bzw. Google-Verknüpfung) und alle Sitzungen",
  "Ihr Kundenprofil mit Kundennummer",
  "Alle Aufträge, Rechnungen, Nachrichten und E-Mail-Verläufe im Portal",
  "Alle hochgeladenen und bereitgestellten Dokumente – auch aus unserem Dateispeicher",
];

const ANCHOR = "konto-loeschen";

/**
 * Konto endgültig löschen (DSGVO). Bestätigung per Passwort bzw. frischer
 * Google-Anmeldung plus Eingabe „LÖSCHEN" – ein versehentlicher Klick reicht nie.
 */
export function DeleteAccountSection({ hasPassword, initiallyOpen }: { hasPassword: boolean; initiallyOpen: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(initiallyOpen);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [needsReauth, setNeedsReauth] = useState(false);

  const confirmed = isDeleteConfirmation(confirmation);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmed) return;
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      await apiRequest("/account/delete", { body: { password: hasPassword ? password : undefined, confirmation } });
      router.replace(`${routes.portalLogin}?geloescht=1`);
      router.refresh();
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.code === "REAUTH_REQUIRED") setNeedsReauth(true);
      else if (deleteError instanceof ApiError && deleteError.fields) setFieldErrors(deleteError.fields);
      else setError(errorMessage(deleteError));
      setPending(false);
    }
  };

  return (
    <section id={ANCHOR} aria-labelledby="delete-title" className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-card ring-1 ring-red-200 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 aria-hidden="true" className="size-5" />
        </span>
        <h2 id="delete-title" className="font-display text-lg font-bold text-primary">
          Konto löschen
        </h2>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Sie können Ihr Kundenkonto jederzeit endgültig löschen. Danach gibt es bei uns im Portal keine Daten mehr von Ihnen.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          Konto löschen …
        </button>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle aria-hidden="true" className="size-4" />
              Endgültig gelöscht werden:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {DELETED_DATA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3">
              Das lässt sich nicht rückgängig machen. Gesetzlich aufbewahrungspflichtige Belege (z. B. Rechnungen) liegen
              ausschließlich in unserer Buchhaltung. Sie erhalten eine Bestätigung per E-Mail.
            </p>
          </div>

          {error && <AuthAlert tone="error">{error}</AuthAlert>}

          {hasPassword ? (
            <PasswordField
              name="password"
              label="Ihr Passwort zur Bestätigung"
              autoComplete="current-password"
              value={password}
              onValueChange={setPassword}
              error={fieldErrors.password}
            />
          ) : needsReauth ? (
            <AuthAlert tone="info">
              Aus Sicherheitsgründen bestätigen Sie die Löschung bitte mit einer erneuten Google-Anmeldung. Danach kommen Sie
              automatisch hierher zurück.{" "}
              <a href={googleSignInUrl(`${routes.portalSettings}?loeschen=1#${ANCHOR}`)} className="font-semibold underline underline-offset-4">
                Mit Google bestätigen
              </a>
            </AuthAlert>
          ) : (
            <p className="text-sm text-slate-600">Ihr Konto ist mit Google verknüpft – die Bestätigung erfolgt über Ihre aktuelle Anmeldung.</p>
          )}

          <div>
            <label htmlFor="delete-confirmation" className="block text-sm font-semibold text-primary">
              Geben Sie zur Bestätigung <strong className="text-red-700">{ACCOUNT_DELETE_CONFIRMATION}</strong> ein
            </label>
            <input
              id="delete-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-primary outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
              aria-invalid={Boolean(fieldErrors.confirmation) || undefined}
            />
            {fieldErrors.confirmation && <p className="mt-1.5 text-sm font-medium text-red-600">{fieldErrors.confirmation}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!confirmed || pending || (hasPassword && password.length === 0)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Trash2 aria-hidden="true" className="size-4" />}
              {pending ? "Wird gelöscht …" : "Konto endgültig löschen"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setConfirmation("");
                setError(undefined);
                setFieldErrors({});
              }}
              disabled={pending}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
