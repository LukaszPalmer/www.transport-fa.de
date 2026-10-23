"use client";

import { EMAIL_TAKEN_MESSAGE, PASSWORD_MIN_LENGTH, type MeResponse } from "@fa/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { useLocale } from "@/i18n/client";
import { defineMessages, localizeHref } from "@/i18n/config";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage, localizeMessage } from "@/lib/api/errors";
import { AddressFields, readAddress } from "@/components/forms/AddressFields";
import { CheckboxField, TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "./auth-fields";
import { AuthDivider, GoogleButton } from "./GoogleButton";

/** API-Feldnamen → Formularfelder */
const FIELD_ALIASES: Record<string, string> = { acceptPrivacy: "privacy" };

const messages = defineMessages({
  de: {
    minLength: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`,
    mismatch: "Die Passwörter stimmen nicht überein.",
    privacyRequired: "Bitte stimmen Sie der Datenschutzerklärung zu.",
    google: "Mit Google registrieren",
    firstName: "Vorname",
    lastName: "Nachname",
    company: "Firma",
    companyHint: "Nur bei Geschäftskunden – erscheint auf Ihren Rechnungen.",
    address: "Anschrift",
    addressHint: "Ihre Rechnungsadresse – wir brauchen sie für Aufträge und Rechnungen.",
    email: "E-Mail-Adresse",
    haveAccount: "Sie haben bereits ein Konto?",
    signIn: "Jetzt anmelden",
    or: "oder",
    reset: "Passwort zurücksetzen",
    password: "Passwort",
    passwordHint: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen – am besten eine Passphrase.`,
    confirm: "Passwort wiederholen",
    acceptBefore: "Ich akzeptiere die",
    privacy: "Datenschutzerklärung",
    acceptAfter: ".",
    submit: "Konto erstellen",
  },
  en: {
    minLength: `At least ${PASSWORD_MIN_LENGTH} characters.`,
    mismatch: "The passwords do not match.",
    privacyRequired: "Please accept the privacy policy.",
    google: "Sign up with Google",
    firstName: "First name",
    lastName: "Last name",
    company: "Company",
    companyHint: "Business customers only – shown on your invoices.",
    address: "Address",
    addressHint: "Your billing address – we need it for jobs and invoices.",
    email: "Email address",
    haveAccount: "Already have an account?",
    signIn: "Sign in now",
    or: "or",
    reset: "reset your password",
    password: "Password",
    passwordHint: `At least ${PASSWORD_MIN_LENGTH} characters – ideally a passphrase.`,
    confirm: "Repeat password",
    acceptBefore: "I accept the",
    privacy: "privacy policy",
    acceptAfter: ".",
    submit: "Create account",
  },
});

/** Konto anlegen – per Google oder E-Mail/Passwort (mit Bestätigungs-E-Mail). */
export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const locale = useLocale();
  const t = messages[locale];
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
    if (password.length < PASSWORD_MIN_LENGTH) errors.password = t.minLength;
    if (password !== confirm) errors.confirm = t.mismatch;
    if (data.get("privacy") !== "on") errors.privacy = t.privacyRequired;
    setFieldErrors(errors);
    setError(undefined);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      await apiRequest<MeResponse>("/auth/register", {
        body: {
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          companyName: String(data.get("companyName") ?? ""),
          billingAddress: readAddress(data),
          email: String(data.get("email") ?? ""),
          password,
          acceptPrivacy: true,
          // Sprache für E-Mails an den Kunden
          locale,
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

      <GoogleButton enabled={googleEnabled} label={t.google} redirectTo={routes.portal} />
      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField name="firstName" label={t.firstName} required autoComplete="given-name" error={fieldErrors.firstName} />
          <TextField name="lastName" label={t.lastName} required autoComplete="family-name" error={fieldErrors.lastName} />
        </div>
        <TextField name="companyName" label={t.company} autoComplete="organization" hint={t.companyHint} error={fieldErrors.companyName} />
        <fieldset>
          <legend className="text-sm font-semibold text-primary">{t.address}</legend>
          <p className="mt-1 mb-4 text-xs text-slate-500">{t.addressHint}</p>
          <AddressFields errors={fieldErrors} />
        </fieldset>
        <TextField
          name="email"
          type="email"
          label={t.email}
          required
          autoComplete="email"
          inputMode="email"
          error={fieldErrors.email}
        />
        {fieldErrors.email === localizeMessage(EMAIL_TAKEN_MESSAGE) && (
          <p className="-mt-3 text-sm text-slate-600">
            {t.haveAccount}{" "}
            <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
              {t.signIn}
            </Link>{" "}
            {t.or}{" "}
            <Link href={routes.portalForgot} className="font-semibold text-accent-ink underline underline-offset-4">
              {t.reset}
            </Link>
          </p>
        )}
        <PasswordField
          name="password"
          label={t.password}
          autoComplete="new-password"
          hint={t.passwordHint}
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
        <CheckboxField name="privacy" required error={fieldErrors.privacy}>
          {t.acceptBefore}{" "}
          <Link href={localizeHref("/datenschutz", locale)} target="_blank" className="font-semibold text-accent-ink underline underline-offset-4">
            {t.privacy}
          </Link>
          {t.acceptAfter}
        </CheckboxField>
        <PendingButton pending={pending}>{t.submit}</PendingButton>
      </form>
    </div>
  );
}
