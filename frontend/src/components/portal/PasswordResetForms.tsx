"use client";

import { PASSWORD_MIN_LENGTH } from "@fa/shared";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "./auth-fields";

/**
 * Schritt 1: Reset-Link anfordern. Die Antwort ist immer gleich – unabhängig
 * davon, ob ein Konto existiert (kein Rückschluss auf registrierte Adressen).
 */
export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string>();
  const [error, setError] = useState<string>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setPending(true);
    setError(undefined);
    try {
      await apiRequest("/auth/forgot-password", { body: { email } });
      setSentTo(email);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  if (sentTo) {
    return (
      <AuthAlert tone="success">
        Falls ein Konto mit <strong>{sentTo}</strong> existiert, haben wir Ihnen einen Link zum Zurücksetzen gesendet.
        Bitte prüfen Sie auch Ihren Spam-Ordner. Der Link ist 60 Minuten gültig.
      </AuthAlert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <TextField name="email" type="email" label="E-Mail-Adresse" required autoComplete="email" inputMode="email" />
      <PendingButton pending={pending}>Link anfordern</PendingButton>
    </form>
  );
}

/** Schritt 2: Neues Passwort mit dem Token aus der E-Mail setzen. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (password.length < PASSWORD_MIN_LENGTH) errors.password = `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`;
    if (password !== confirm) errors.confirm = "Die Passwörter stimmen nicht überein.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    setError(undefined);
    try {
      await apiRequest("/auth/reset-password", { body: { token, password } });
      setDone(true);
    } catch (resetError) {
      if (resetError instanceof ApiError && resetError.fields?.password) setFieldErrors({ password: resetError.fields.password });
      else setError(errorMessage(resetError));
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-5">
        <AuthAlert tone="success">
          Ihr Passwort wurde geändert. Aus Sicherheitsgründen wurden alle bestehenden Sitzungen abgemeldet.
        </AuthAlert>
        <Link href={routes.portalLogin} className="block text-center font-semibold text-accent-ink underline underline-offset-4">
          Jetzt anmelden
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <AuthAlert tone="error">
          {error}{" "}
          <Link href={routes.portalForgot} className="font-semibold underline underline-offset-4">
            Neuen Link anfordern
          </Link>
        </AuthAlert>
      )}
      <PasswordField
        name="password"
        label="Neues Passwort"
        autoComplete="new-password"
        hint={`Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`}
        showStrength
        value={password}
        onValueChange={setPassword}
        error={fieldErrors.password}
      />
      <PasswordField
        name="confirm"
        label="Neues Passwort wiederholen"
        autoComplete="new-password"
        value={confirm}
        onValueChange={setConfirm}
        error={fieldErrors.confirm}
      />
      <PendingButton pending={pending}>Passwort speichern</PendingButton>
    </form>
  );
}
