"use client";

import type { MeResponse } from "@fa/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { CheckboxField, TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "./auth-fields";
import { AuthDivider, GoogleButton } from "./GoogleButton";

interface LoginFormProps {
  googleEnabled: boolean;
  redirectTo: string;
  notice?: { tone: "error" | "success" | "info"; text: string };
}

const messages = defineMessages({
  de: {
    google: "Mit Google anmelden",
    email: "E-Mail-Adresse",
    password: "Passwort",
    forgot: "Passwort vergessen?",
    remember: "Angemeldet bleiben",
    submit: "Anmelden",
  },
  en: {
    google: "Sign in with Google",
    email: "Email address",
    password: "Password",
    forgot: "Forgot password?",
    remember: "Stay signed in",
    submit: "Sign in",
  },
});

/** Anmeldung per Google oder E-Mail + Passwort. */
export function LoginForm({ googleEnabled, redirectTo, notice }: LoginFormProps) {
  const t = useMessages(messages);
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(undefined);
    setEmailError(undefined);
    setPending(true);
    try {
      await apiRequest<MeResponse>("/auth/login", {
        body: {
          email: String(data.get("email") ?? ""),
          password,
          remember: data.get("remember") === "on",
        },
      });
      router.replace(redirectTo);
      router.refresh();
    } catch (loginError) {
      if (loginError instanceof ApiError && loginError.fields?.email) setEmailError(loginError.fields.email);
      else setError(errorMessage(loginError));
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {notice && !error && <AuthAlert tone={notice.tone}>{notice.text}</AuthAlert>}
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <GoogleButton enabled={googleEnabled} label={t.google} redirectTo={redirectTo} />
      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-5">
        <TextField name="email" type="email" label={t.email} required autoComplete="email" inputMode="email" error={emailError} />
        <div>
          <PasswordField
            name="password"
            label={t.password}
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
          />
          <div className="mt-2 text-right">
            <Link href={routes.portalForgot} className="text-sm font-medium text-accent-ink underline-offset-4 hover:underline">
              {t.forgot}
            </Link>
          </div>
        </div>
        <CheckboxField name="remember" defaultChecked>
          {t.remember}
        </CheckboxField>
        <PendingButton pending={pending}>{t.submit}</PendingButton>
      </form>
    </div>
  );
}
