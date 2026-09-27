"use client";

import { PASSWORD_MIN_LENGTH } from "@fa/shared";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "./auth-fields";

const messages = defineMessages({
  de: {
    sentBefore: "Falls ein Konto mit ",
    sentAfter: " existiert, haben wir Ihnen einen Link zum Zurücksetzen gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner. Der Link ist 60 Minuten gültig.",
    email: "E-Mail-Adresse",
    request: "Link anfordern",
    minLength: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`,
    mismatch: "Die Passwörter stimmen nicht überein.",
    done: "Ihr Passwort wurde geändert. Aus Sicherheitsgründen wurden alle bestehenden Sitzungen abgemeldet.",
    signIn: "Jetzt anmelden",
    newLink: "Neuen Link anfordern",
    password: "Neues Passwort",
    confirm: "Neues Passwort wiederholen",
    save: "Passwort speichern",
  },
  en: {
    sentBefore: "If an account with ",
    sentAfter: " exists, we have sent you a reset link. Please also check your spam folder. The link is valid for 60 minutes.",
    email: "Email address",
    request: "Request link",
    minLength: `At least ${PASSWORD_MIN_LENGTH} characters.`,
    mismatch: "The passwords do not match.",
    done: "Your password has been changed. For security reasons, all existing sessions have been signed out.",
    signIn: "Sign in now",
    newLink: "Request a new link",
    password: "New password",
    confirm: "Repeat new password",
    save: "Save password",
  },
});

/**
 * Schritt 1: Reset-Link anfordern. Die Antwort ist immer gleich – unabhängig
 * davon, ob ein Konto existiert (kein Rückschluss auf registrierte Adressen).
 */
export function ForgotPasswordForm() {
  const t = useMessages(messages);
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
        {t.sentBefore}
        <strong>{sentTo}</strong>
        {t.sentAfter}
      </AuthAlert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <TextField name="email" type="email" label={t.email} required autoComplete="email" inputMode="email" />
      <PendingButton pending={pending}>{t.request}</PendingButton>
    </form>
  );
}

/** Schritt 2: Neues Passwort mit dem Token aus der E-Mail setzen. */
export function ResetPasswordForm({ token }: { token: string }) {
  const t = useMessages(messages);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (password.length < PASSWORD_MIN_LENGTH) errors.password = t.minLength;
    if (password !== confirm) errors.confirm = t.mismatch;
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
        <AuthAlert tone="success">{t.done}</AuthAlert>
        <Link href={routes.portalLogin} className="block text-center font-semibold text-accent-ink underline underline-offset-4">
          {t.signIn}
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
            {t.newLink}
          </Link>
        </AuthAlert>
      )}
      <PasswordField
        name="password"
        label={t.password}
        autoComplete="new-password"
        hint={t.minLength}
        showStrength
        value={password}
        onValueChange={setPassword}
        error={fieldErrors.password}
      />
      <PasswordField
        name="confirm"
        label={t.confirm}
        autoComplete="new-password"
        value={confirm}
        onValueChange={setConfirm}
        error={fieldErrors.confirm}
      />
      <PendingButton pending={pending}>{t.save}</PendingButton>
    </form>
  );
}
