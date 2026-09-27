"use client";

import type { MeResponse } from "@fa/shared";
import { LoaderCircle, LogOut, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/content/navigation";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { buttonClasses } from "@/components/ui/button-styles";
import { AuthAlert } from "./auth-fields";

const messages = defineMessages({
  de: {
    signOut: "Abmelden",
    sent: "E-Mail gesendet – bitte prüfen Sie Ihr Postfach (auch den Spam-Ordner).",
    resend: "Bestätigungs-E-Mail erneut senden",
    wait: "Bitte warten …",
    confirm: "E-Mail-Adresse jetzt bestätigen",
  },
  en: {
    signOut: "Sign out",
    sent: "Email sent – please check your inbox (including the spam folder).",
    resend: "Resend confirmation email",
    wait: "Please wait …",
    confirm: "Confirm email address now",
  },
});

/** Abmelden – beendet die Sitzung serverseitig und führt zur Anmeldung. */
export function SignOutButton({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = useMessages(messages);
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    await apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace(`${routes.portalLogin}?abgemeldet=1`);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className={
        tone === "light"
          ? "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10 disabled:opacity-70"
          : "inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-slate-50 disabled:opacity-70"
      }
    >
      {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <LogOut aria-hidden="true" className="size-4" />}
      {t.signOut}
    </button>
  );
}

/** Bestätigungs-E-Mail erneut senden (bei unbestätigter Adresse). */
export function ResendVerificationButton() {
  const t = useMessages(messages);
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState<string>();

  const resend = async () => {
    setState("pending");
    setError(undefined);
    try {
      await apiRequest("/auth/resend-verification", { method: "POST" });
      setState("sent");
    } catch (resendError) {
      setError(errorMessage(resendError));
      setState("idle");
    }
  };

  if (state === "sent") {
    return <AuthAlert tone="success">{t.sent}</AuthAlert>;
  }

  return (
    <div className="space-y-3">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <button type="button" onClick={resend} disabled={state === "pending"} className={buttonClasses({ variant: "dark" })}>
        {state === "pending" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <MailCheck aria-hidden="true" className="size-4" />}
        {t.resend}
      </button>
    </div>
  );
}

/** Ziel des Links aus der Bestätigungs-E-Mail – bestätigt erst auf Klick (E-Mail-Scanner öffnen Links automatisch). */
export function ConfirmEmailButton({ token }: { token: string }) {
  const t = useMessages(messages);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const confirm = async () => {
    setPending(true);
    setError(undefined);
    try {
      await apiRequest<MeResponse>("/auth/verify-email", { body: { token } });
      router.replace(`${routes.portal}?verifiziert=1`);
      router.refresh();
    } catch (verifyError) {
      setError(errorMessage(verifyError));
      setPending(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <button
        type="button"
        onClick={confirm}
        disabled={pending}
        className={buttonClasses({ size: "lg", className: "w-full disabled:cursor-wait disabled:opacity-80" })}
      >
        {pending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <MailCheck aria-hidden="true" className="size-5" />}
        <span>{pending ? t.wait : t.confirm}</span>
      </button>
    </div>
  );
}
