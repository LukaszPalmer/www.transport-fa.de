"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { CheckboxField, TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "./auth-fields";
import { AuthDivider, GoogleButton } from "./GoogleButton";

interface LoginFormProps {
  googleEnabled: boolean;
  redirectTo: string;
  notice?: { tone: "error" | "success" | "info"; text: string };
}

/** Anmeldung per Google oder E-Mail + Passwort. */
export function LoginForm({ googleEnabled, redirectTo, notice }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(undefined);
    setPending(true);
    const { error: signInError } = await authClient.signIn.email({
      email: String(data.get("email") ?? "").trim(),
      password,
      rememberMe: data.get("remember") === "on",
    });
    if (signInError) {
      setError(authErrorMessage(signInError));
      setPending(false);
      return;
    }
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {notice && !error && <AuthAlert tone={notice.tone}>{notice.text}</AuthAlert>}
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <GoogleButton enabled={googleEnabled} label="Mit Google anmelden" callbackURL={redirectTo} onError={setError} />
      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-5">
        <TextField name="email" type="email" label="E-Mail-Adresse" required autoComplete="email" inputMode="email" />
        <div>
          <PasswordField
            name="password"
            label="Passwort"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
          />
          <div className="mt-2 text-right">
            <Link
              href="/kundenportal/passwort-vergessen"
              className="text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
        </div>
        <CheckboxField name="remember" defaultChecked>
          Angemeldet bleiben
        </CheckboxField>
        <PendingButton pending={pending}>Anmelden</PendingButton>
      </form>
    </div>
  );
}
