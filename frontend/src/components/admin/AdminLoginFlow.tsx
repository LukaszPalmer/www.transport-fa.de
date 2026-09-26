"use client";

import type { MeResponse, MfaEnableResponse, MfaSetupResponse, MfaStatus } from "@fa/shared";
import { Copy, Download, KeyRound, LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { TextField } from "@/components/forms/fields";
import { AuthAlert, PasswordField, PendingButton } from "@/components/portal/auth-fields";

export type LoginStep = "credentials" | "setup" | "recovery" | "code";

/**
 * Admin-Anmeldung in Schritten: Passwort → (einmalig) Authenticator-App verknüpfen und
 * Wiederherstellungscodes sichern → bei jeder Anmeldung 6-stelliger Code.
 */
export function AdminLoginFlow({ initialStep, noAccess }: { initialStep: LoginStep; noAccess: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>(initialStep);
  const [error, setError] = useState<string | undefined>(noAccess ? "Dieses Konto hat keinen Zugang zum Admin-Bereich." : undefined);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const finish = () => {
    router.replace(routes.admin);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <StepHeader step={step} />
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {step === "credentials" && (
        <CredentialsStep
          onDone={(status) => {
            setError(undefined);
            if (status.enabled && status.verified) finish();
            else setStep(status.enabled ? "code" : "setup");
          }}
          onError={setError}
        />
      )}
      {step === "setup" && (
        <SetupStep
          onDone={(codes) => {
            setError(undefined);
            setRecoveryCodes(codes);
            setStep("recovery");
          }}
          onError={setError}
        />
      )}
      {step === "recovery" && <RecoveryStep codes={recoveryCodes} onDone={finish} />}
      {step === "code" && <CodeStep onDone={finish} onError={setError} />}
    </div>
  );
}

const STEP_TEXT: Record<LoginStep, { title: string; text: string; icon: typeof KeyRound }> = {
  credentials: { title: "Anmelden", text: "Mit Ihrer Mitarbeiter-E-Mail und Ihrem Passwort.", icon: KeyRound },
  setup: { title: "Zwei-Faktor einrichten", text: "Einmalig: Verknüpfen Sie eine Authenticator-App mit Ihrem Zugang.", icon: Smartphone },
  recovery: { title: "Wiederherstellungscodes", text: "Für den Notfall, falls Ihr Handy verloren geht.", icon: ShieldCheck },
  code: { title: "Bestätigungscode", text: "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.", icon: ShieldCheck },
};

function StepHeader({ step }: { step: LoginStep }) {
  const { title, text, icon: StepIcon } = STEP_TEXT[step];
  return (
    <div className="flex items-start gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-accent">
        <StepIcon aria-hidden="true" className="size-6" />
      </span>
      <div>
        <h1 className="font-display text-xl font-bold text-primary">{title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
      </div>
    </div>
  );
}

type StepProps<T> = { onDone: (value: T) => void; onError: (message: string | undefined) => void };

function CredentialsStep({ onDone, onError }: StepProps<MfaStatus>) {
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setPending(true);
    setFieldErrors({});
    onError(undefined);
    try {
      await apiRequest<MeResponse>("/auth/staff/login", { body: { email, password, remember: false } });
      onDone(await apiRequest<MfaStatus>("/auth/mfa/status"));
    } catch (loginError) {
      if (loginError instanceof ApiError && loginError.fields) setFieldErrors(loginError.fields);
      else onError(errorMessage(loginError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <TextField name="email" type="email" label="E-Mail-Adresse" required autoComplete="username" inputMode="email" error={fieldErrors.email} />
      <PasswordField name="password" label="Passwort" autoComplete="current-password" value={password} onValueChange={setPassword} error={fieldErrors.password} />
      <PendingButton pending={pending}>Weiter</PendingButton>
    </form>
  );
}

function CodeInput({ recovery, error }: { recovery?: boolean; error?: string }) {
  return (
    <TextField
      name="code"
      label={recovery ? "Wiederherstellungscode" : "6-stelliger Code"}
      required
      autoComplete="one-time-code"
      inputMode={recovery ? "text" : "numeric"}
      placeholder={recovery ? "xxxx-xxxx" : "123456"}
      error={error}
    />
  );
}

function SetupStep({ onDone, onError }: StepProps<string[]>) {
  const [setup, setSetup] = useState<MfaSetupResponse>();
  const [pending, setPending] = useState(false);
  const [codeError, setCodeError] = useState<string>();

  useEffect(() => {
    let active = true;
    apiRequest<MfaSetupResponse>("/auth/mfa/setup", { method: "POST" }).then(
      (result) => active && setSetup(result),
      (setupError: unknown) => active && onError(errorMessage(setupError)),
    );
    return () => {
      active = false;
    };
  }, [onError]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    setPending(true);
    setCodeError(undefined);
    try {
      const result = await apiRequest<MfaEnableResponse>("/auth/mfa/enable", { body: { code } });
      onDone(result.recoveryCodes);
    } catch (enableError) {
      if (enableError instanceof ApiError && enableError.fields?.code) setCodeError(enableError.fields.code);
      else onError(errorMessage(enableError));
      setPending(false);
    }
  };

  if (!setup) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> QR-Code wird erstellt …
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
        <li>Öffnen Sie eine Authenticator-App (z. B. Google Authenticator, Microsoft Authenticator oder 1Password).</li>
        <li>Scannen Sie den QR-Code.</li>
        <li>Geben Sie den angezeigten 6-stelligen Code ein.</li>
      </ol>
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- Data-URL vom Server, keine Bildoptimierung nötig */}
        <img src={setup.qrDataUrl} alt="QR-Code für die Authenticator-App" width={200} height={200} className="rounded-xl bg-white p-2" />
        <details className="w-full text-center text-xs text-slate-500">
          <summary className="cursor-pointer font-semibold text-accent-ink">QR-Code lässt sich nicht scannen?</summary>
          <p className="mt-2">Schlüssel manuell eingeben:</p>
          <code className="mt-1 block font-mono text-sm tracking-wider break-all text-primary select-all">{setup.secret.match(/.{1,4}/g)?.join(" ")}</code>
        </details>
      </div>
      <CodeInput error={codeError} />
      <PendingButton pending={pending}>Verknüpfen</PendingButton>
    </form>
  );
}

function RecoveryStep({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = `FA Transport Admin – Wiederherstellungscodes\nJeder Code funktioniert genau einmal.\n\n${codes.join("\n")}\n`;

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "fa-transport-wiederherstellungscodes.txt" });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <AuthAlert tone="info">
        Bewahren Sie diese Codes sicher auf (z. B. im Passwort-Manager). Jeder Code ersetzt einmalig den Authenticator-Code. Sie werden nur jetzt
        angezeigt.
      </AuthAlert>
      <ul className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-4 font-mono text-sm text-primary">
        {codes.map((code) => (
          <li key={code} className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-primary/5 select-all">
            {code}
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <button type="button" onClick={() => void copy()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50">
          <Copy aria-hidden="true" className="size-4" /> {copied ? "Kopiert" : "Kopieren"}
        </button>
        <button type="button" onClick={download} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50">
          <Download aria-hidden="true" className="size-4" /> Herunterladen
        </button>
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 size-5 accent-[#0369a1]" />
        Ich habe die Codes sicher aufbewahrt.
      </label>
      <button
        type="button"
        disabled={!confirmed}
        onClick={onDone}
        className="h-14 w-full rounded-xl bg-accent font-semibold text-primary transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
      >
        Zum Admin-Bereich
      </button>
    </div>
  );
}

function CodeStep({ onDone, onError }: { onDone: () => void; onError: (message: string | undefined) => void }) {
  const [recovery, setRecovery] = useState(false);
  const [pending, setPending] = useState(false);
  const [codeError, setCodeError] = useState<string>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    setPending(true);
    setCodeError(undefined);
    onError(undefined);
    try {
      const status = await apiRequest<MfaStatus>("/auth/mfa/verify", { body: { code } });
      if (status.recoveryCodesLeft !== undefined && status.recoveryCodesLeft <= 3) {
        window.alert(`Hinweis: Nur noch ${status.recoveryCodesLeft} Wiederherstellungscodes übrig. Bitte wenden Sie sich an einen Administrator.`);
      }
      onDone();
    } catch (verifyError) {
      if (verifyError instanceof ApiError && verifyError.fields?.code) setCodeError(verifyError.fields.code);
      else if (verifyError instanceof ApiError && verifyError.status === 401) onError("Die Anmeldung ist abgelaufen – bitte laden Sie die Seite neu.");
      else onError(errorMessage(verifyError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <CodeInput key={String(recovery)} recovery={recovery} error={codeError} />
      <PendingButton pending={pending}>Bestätigen</PendingButton>
      <button type="button" onClick={() => setRecovery((state) => !state)} className="w-full text-center text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
        {recovery ? "Authenticator-Code verwenden" : "Handy nicht zur Hand? Wiederherstellungscode verwenden"}
      </button>
    </form>
  );
}
