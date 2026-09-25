"use client";

import { PASSWORD_MIN_LENGTH, type MeResponse } from "@fa/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { CheckboxField, TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "./auth-fields";
import { AuthDivider, GoogleButton } from "./GoogleButton";

/** API-Feldnamen → Formularfelder */
const FIELD_ALIASES: Record<string, string> = { acceptPrivacy: "privacy" };

/** Konto anlegen – per Google oder E-Mail/Passwort (mit Bestätigungs-E-Mail). */
export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const errors: Record<string, string> = {};
    if (password.length < PASSWORD_MIN_LENGTH) errors.password = `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`;
    if (password !== confirm) errors.confirm = "Die Passwörter stimmen nicht überein.";
    if (data.get("privacy") !== "on") errors.privacy = "Bitte stimmen Sie der Datenschutzerklärung zu.";
    setFieldErrors(errors);
    setError(undefined);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      await apiRequest<MeResponse>("/auth/register", {
        body: {
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          email: String(data.get("email") ?? ""),
          password,
          acceptPrivacy: true,
        },
      });
      router.replace(`${routes.portal}?willkommen=1`);
      router.refresh();
    } catch (registerError) {
      if (registerError instanceof ApiError && registerError.fields) {
        setFieldErrors(
          Object.fromEntries(Object.entries(registerError.fields).map(([field, message]) => [FIELD_ALIASES[field] ?? field, message])),
        );
      } else {
        setError(errorMessage(registerError));
      }
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <GoogleButton enabled={googleEnabled} label="Mit Google registrieren" redirectTo={routes.portal} />
      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField name="firstName" label="Vorname" required autoComplete="given-name" error={fieldErrors.firstName} />
          <TextField name="lastName" label="Nachname" required autoComplete="family-name" error={fieldErrors.lastName} />
        </div>
        <TextField
          name="email"
          type="email"
          label="E-Mail-Adresse"
          required
          autoComplete="email"
          inputMode="email"
          error={fieldErrors.email}
        />
        <PasswordField
          name="password"
          label="Passwort"
          autoComplete="new-password"
          hint={`Mindestens ${PASSWORD_MIN_LENGTH} Zeichen – am besten eine Passphrase.`}
          showStrength
          value={password}
          onValueChange={setPassword}
          error={fieldErrors.password}
        />
        <PasswordField
          name="confirm"
          label="Passwort wiederholen"
          autoComplete="new-password"
          value={confirm}
          onValueChange={setConfirm}
          error={fieldErrors.confirm}
        />
        <CheckboxField name="privacy" required error={fieldErrors.privacy}>
          Ich akzeptiere die{" "}
          <Link href="/datenschutz" target="_blank" className="font-semibold text-accent-ink underline underline-offset-4">
            Datenschutzerklärung
          </Link>
          .
        </CheckboxField>
        <PendingButton pending={pending}>Konto erstellen</PendingButton>
      </form>
    </div>
  );
}
