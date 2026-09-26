"use client";

import type { AccountSettings } from "@fa/shared";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { apiRequest, googleSignInUrl } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField } from "../auth-fields";
import { mapFieldErrors, SaveButton } from "./form-parts";

/**
 * E-Mail-Adresse ändern: Bestätigung per Passwort (Google-Konten: frische Anmeldung),
 * danach muss die neue Adresse per Link bestätigt werden. Die alte Adresse wird informiert.
 */
export function EmailForm({ email, hasPassword }: { email: string; hasPassword: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [needsReauth, setNeedsReauth] = useState(false);
  const [changedTo, setChangedTo] = useState<string>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newEmail = String(new FormData(event.currentTarget).get("email") ?? "");
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      const settings = await apiRequest<AccountSettings>("/account/email", {
        body: { email: newEmail, currentPassword: hasPassword ? password : undefined },
      });
      setChangedTo(settings.profile.email);
      setOpen(false);
      setPassword("");
      router.refresh();
    } catch (changeError) {
      if (changeError instanceof ApiError && changeError.code === "REAUTH_REQUIRED") setNeedsReauth(true);
      else if (changeError instanceof ApiError && changeError.fields) setFieldErrors(mapFieldErrors(changeError.fields));
      else setError(errorMessage(changeError));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      {changedTo && (
        <AuthAlert tone="success">
          Ihre E-Mail-Adresse lautet jetzt <strong>{changedTo}</strong>. Bitte bestätigen Sie sie über den Link, den wir Ihnen gerade
          gesendet haben – bis dahin sind Aufträge und Dokumente gesperrt.
        </AuthAlert>
      )}

      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-primary">{email}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-slate-50"
          >
            E-Mail-Adresse ändern
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          {error && <AuthAlert tone="error">{error}</AuthAlert>}
          <TextField name="email" type="email" label="Neue E-Mail-Adresse" required autoComplete="email" inputMode="email" error={fieldErrors.email} />
          {hasPassword ? (
            <PasswordField
              name="currentPassword"
              label="Aktuelles Passwort zur Bestätigung"
              autoComplete="current-password"
              value={password}
              onValueChange={setPassword}
              error={fieldErrors.currentPassword}
            />
          ) : needsReauth ? (
            <AuthAlert tone="info">
              Bitte bestätigen Sie die Änderung mit einer erneuten Google-Anmeldung – danach kommen Sie hierher zurück.{" "}
              <a href={googleSignInUrl(routes.portalSettings)} className="font-semibold underline underline-offset-4">
                Mit Google bestätigen
              </a>
            </AuthAlert>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <SaveButton pending={pending}>E-Mail-Adresse ändern</SaveButton>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(undefined);
                setFieldErrors({});
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
