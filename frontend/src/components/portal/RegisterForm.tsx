"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { CheckboxField, TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "./auth-fields";
import { AuthDivider, GoogleButton } from "./GoogleButton";

const ACCOUNT_URL = "/kundenportal/konto";

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
    if (password.length < 10) errors.password = "Mindestens 10 Zeichen.";
    if (password !== confirm) errors.confirm = "Die Passwörter stimmen nicht überein.";
    if (data.get("privacy") !== "on") errors.privacy = "Bitte stimmen Sie der Datenschutzerklärung zu.";
    setFieldErrors(errors);
    setError(undefined);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      password,
      callbackURL: `${ACCOUNT_URL}?verifiziert=1`,
    });
    if (signUpError) {
      setError(authErrorMessage(signUpError));
      setPending(false);
      return;
    }
    router.replace(`${ACCOUNT_URL}?willkommen=1`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <GoogleButton enabled={googleEnabled} label="Mit Google registrieren" callbackURL={ACCOUNT_URL} onError={setError} />
      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-5">
        <TextField name="name" label="Vor- und Nachname" required autoComplete="name" />
        <TextField name="email" type="email" label="E-Mail-Adresse" required autoComplete="email" inputMode="email" />
        <PasswordField
          name="password"
          label="Passwort"
          autoComplete="new-password"
          hint="Mindestens 10 Zeichen – am besten eine Passphrase."
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
