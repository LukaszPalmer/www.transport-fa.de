"use client";

import { PASSWORD_MIN_LENGTH } from "@fa/shared";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { AuthAlert, PasswordField } from "../auth-fields";
import { mapFieldErrors, SaveButton } from "./form-parts";

const messages = defineMessages({
  de: {
    googleOnly: "Sie melden sich mit Google an – ein eigenes Passwort ist nicht nötig. Auf Wunsch legen Sie zusätzlich eines fest.",
    setPassword: "Zusätzlich ein Passwort festlegen",
    minLength: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`,
    mismatch: "Die Passwörter stimmen nicht überein.",
    changed: (others: number) =>
      `Ihr Passwort wurde geändert und gilt ab sofort.${others > 0 ? ` ${others === 1 ? "Ein anderes Gerät wurde" : `${others} andere Geräte wurden`} abgemeldet.` : ""} Wir haben Ihnen zur Sicherheit eine Bestätigung per E-Mail gesendet.`,
    current: "Aktuelles Passwort",
    next: "Neues Passwort",
    nextHint: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen – am besten eine Passphrase.`,
    confirm: "Neues Passwort wiederholen",
    submit: "Passwort ändern",
  },
  en: {
    googleOnly: "You sign in with Google – you don't need your own password. You can set one in addition if you like.",
    setPassword: "Set a password as well",
    minLength: `At least ${PASSWORD_MIN_LENGTH} characters.`,
    mismatch: "The passwords do not match.",
    changed: (others: number) =>
      `Your password has been changed and applies immediately.${others > 0 ? ` ${others === 1 ? "One other device has" : `${others} other devices have`} been signed out.` : ""} For your security, we have sent you a confirmation by email.`,
    current: "Current password",
    next: "New password",
    nextHint: `At least ${PASSWORD_MIN_LENGTH} characters – ideally a passphrase.`,
    confirm: "Repeat new password",
    submit: "Change password",
  },
});

/**
 * Passwort ändern: altes Passwort, neues Passwort, Wiederholung. Das neue gilt sofort –
 * alle anderen Geräte werden abgemeldet, diese Sitzung bleibt bestehen.
 */
export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const t = useMessages(messages);
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
        <p>{t.googleOnly}</p>
        <Link href={routes.portalForgot} className="inline-flex font-semibold text-accent-ink underline-offset-4 hover:underline">
          {t.setPassword}
        </Link>
      </div>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (next.length < PASSWORD_MIN_LENGTH) errors.newPassword = t.minLength;
    if (next !== confirm) errors.confirmPassword = t.mismatch;
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
        <AuthAlert tone="success">{t.changed(done)}</AuthAlert>
      )}
      <PasswordField
        name="currentPassword"
        label={t.current}
        autoComplete="current-password"
        value={current}
        onValueChange={setCurrent}
        error={fieldErrors.currentPassword}
      />
      <PasswordField
        name="newPassword"
        label={t.next}
        autoComplete="new-password"
        hint={t.nextHint}
        showStrength
        value={next}
        onValueChange={setNext}
        error={fieldErrors.newPassword}
      />
      <PasswordField
        name="confirmPassword"
        label={t.confirm}
        autoComplete="new-password"
        value={confirm}
        onValueChange={setConfirm}
        error={fieldErrors.confirmPassword}
      />
      <SaveButton pending={pending}>{t.submit}</SaveButton>
    </form>
  );
}
