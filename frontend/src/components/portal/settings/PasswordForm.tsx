"use client";

import { PASSWORD_MIN_LENGTH } from "@fa/shared";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { AuthAlert, PasswordField } from "../auth-fields";
import { mapFieldErrors, SaveButton } from "./form-parts";

/**
 * Passwort ändern: altes Passwort, neues Passwort, Wiederholung. Das neue gilt sofort –
 * alle anderen Geräte werden abgemeldet, diese Sitzung bleibt bestehen.
 */
export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<number>();

  if (!hasPassword) {
    return (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>Sie melden sich mit Google an – ein eigenes Passwort ist nicht nötig. Auf Wunsch legen Sie zusätzlich eines fest.</p>
        <Link href={routes.portalForgot} className="inline-flex font-semibold text-accent-ink underline-offset-4 hover:underline">
          Zusätzlich ein Passwort festlegen
        </Link>
      </div>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (next.length < PASSWORD_MIN_LENGTH) errors.newPassword = `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`;
    if (next !== confirm) errors.confirmPassword = "Die Passwörter stimmen nicht überein.";
    setFieldErrors(errors);
    setError(undefined);
    setDone(undefined);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      const result = await apiRequest<{ ok: true; sessionsEnded: number }>("/account/password", {
        body: { currentPassword: current, newPassword: next, confirmPassword: confirm },
      });
      setDone(result.sessionsEnded);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (changeError) {
      if (changeError instanceof ApiError && changeError.fields) setFieldErrors(mapFieldErrors(changeError.fields));
      else setError(errorMessage(changeError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {done !== undefined && (
        <AuthAlert tone="success">
          Ihr Passwort wurde geändert und gilt ab sofort.
          {done > 0 && ` ${done === 1 ? "Ein anderes Gerät wurde" : `${done} andere Geräte wurden`} abgemeldet.`} Wir haben Ihnen zur Sicherheit
          eine Bestätigung per E-Mail gesendet.
        </AuthAlert>
      )}
      <PasswordField
        name="currentPassword"
        label="Aktuelles Passwort"
        autoComplete="current-password"
        value={current}
        onValueChange={setCurrent}
        error={fieldErrors.currentPassword}
      />
      <PasswordField
        name="newPassword"
        label="Neues Passwort"
        autoComplete="new-password"
        hint={`Mindestens ${PASSWORD_MIN_LENGTH} Zeichen – am besten eine Passphrase.`}
        showStrength
        value={next}
        onValueChange={setNext}
        error={fieldErrors.newPassword}
      />
      <PasswordField
        name="confirmPassword"
        label="Neues Passwort wiederholen"
        autoComplete="new-password"
        value={confirm}
        onValueChange={setConfirm}
        error={fieldErrors.confirmPassword}
      />
      <SaveButton pending={pending}>Passwort ändern</SaveButton>
    </form>
  );
}
