"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient, authErrorMessage } from "@/lib/auth-client";
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
    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/kundenportal/passwort-zuruecksetzen",
    });
    setPending(false);
    // Nur technische Fehler (z. B. Rate-Limit) anzeigen – nie „Konto unbekannt“.
    if (requestError?.status === 429) {
      setError(authErrorMessage(requestError));
      return;
    }
    setSentTo(email);
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
    if (password.length < 10) errors.password = "Mindestens 10 Zeichen.";
    if (password !== confirm) errors.confirm = "Die Passwörter stimmen nicht überein.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    setError(undefined);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (resetError) {
      setError(authErrorMessage(resetError));
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="space-y-5">
        <AuthAlert tone="success">
          Ihr Passwort wurde geändert. Aus Sicherheitsgründen wurden alle bestehenden Sitzungen abgemeldet.
        </AuthAlert>
        <Link href="/kundenportal" className="block text-center font-semibold text-accent-ink underline underline-offset-4">
          Jetzt anmelden
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <PasswordField
        name="password"
        label="Neues Passwort"
        autoComplete="new-password"
        hint="Mindestens 10 Zeichen."
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
