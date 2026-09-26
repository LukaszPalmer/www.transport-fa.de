"use client";

import { PASSWORD_MIN_LENGTH } from "@fa/shared";
import { Copy, KeyRound, LoaderCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { generatePassword } from "@/lib/admin-format";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { inputClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";

interface Result {
  emailChanged: boolean;
  passwordChanged: boolean;
  sessionsEnded: number;
}

/**
 * Zugangsdaten neu setzen (E-Mail und/oder Passwort). Passwörter sind gehasht gespeichert –
 * sie lassen sich nicht anzeigen, nur neu vergeben. Gilt sofort, alle Sitzungen enden.
 */
export function CredentialsForm({ userId, currentEmail, self = false }: { userId: string; currentEmail: string; self?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result & { password?: string }>();

  const emailChanged = email.trim().toLowerCase() !== currentEmail;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!emailChanged && !password) {
      setError("Bitte eine neue E-Mail-Adresse oder ein neues Passwort eingeben.");
      return;
    }
    if (password && password.length < PASSWORD_MIN_LENGTH) {
      setFieldErrors({ password: `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.` });
      return;
    }
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    setResult(undefined);
    try {
      const response = await apiRequest<Result>(`/admin/users/${userId}/credentials`, {
        method: "PATCH",
        body: { ...(emailChanged ? { email } : {}), ...(password ? { password } : {}) },
      });
      setResult({ ...response, password: password || undefined });
      setPassword("");
      router.refresh();
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.fields) setFieldErrors(saveError.fields);
      else setError(errorMessage(saveError));
    } finally {
      setPending(false);
    }
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {result && (
        <AuthAlert tone="success">
          Gespeichert – gilt ab sofort.{" "}
          {self ? "Ihre anderen Sitzungen wurden beendet." : `${result.sessionsEnded} Sitzung(en) beendet, das Konto wurde per E-Mail informiert.`}
          {result.emailChanged && !self && " Die neue Adresse muss per Link bestätigt werden."}
          {result.password && (
            <span className="mt-2 flex items-center gap-2">
              Neues Passwort: <code className="rounded bg-white px-2 py-0.5 font-mono text-primary select-all">{result.password}</code>
              <button type="button" onClick={() => void copy(result.password!)} className="font-semibold underline underline-offset-4">
                {copied ? "Kopiert" : "Kopieren"}
              </button>
            </span>
          )}
        </AuthAlert>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-primary">E-Mail-Adresse</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className={`${inputClasses} h-11`} />
        {fieldErrors.email && <span className="mt-1 block text-sm font-medium text-red-600">{fieldErrors.email}</span>}
      </label>

      <div>
        <label htmlFor={`password-${userId}`} className="mb-1.5 block text-sm font-semibold text-primary">
          Neues Passwort <span className="font-normal text-slate-500">(leer lassen = unverändert)</span>
        </label>
        <div className="flex gap-2">
          <input
            id={`password-${userId}`}
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            spellCheck={false}
            className={`${inputClasses} h-11 font-mono`}
          />
          <button
            type="button"
            onClick={() => setPassword(generatePassword())}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-primary hover:bg-slate-50"
          >
            <RefreshCw aria-hidden="true" className="size-4" /> Erzeugen
          </button>
          {password && (
            <button type="button" onClick={() => void copy(password)} className="shrink-0 rounded-xl border border-slate-200 px-3 text-primary hover:bg-slate-50">
              <Copy aria-hidden="true" className="size-4" />
              <span className="sr-only">Passwort kopieren</span>
            </button>
          )}
        </div>
        {fieldErrors.password ? (
          <span className="mt-1 block text-sm font-medium text-red-600">{fieldErrors.password}</span>
        ) : (
          <span className="mt-1 block text-xs text-slate-500">
            Gespeicherte Passwörter sind verschlüsselt (Argon2) und nicht einsehbar. Neues Passwort bitte auf sicherem Weg weitergeben.
          </span>
        )}
      </div>

      <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "sm" })}>
        {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <KeyRound aria-hidden="true" className="size-4" />}
        Zugangsdaten speichern
      </button>
    </form>
  );
}
