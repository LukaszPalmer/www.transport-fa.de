"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/** Abmelden – beendet die Sitzung serverseitig und führt zur Anmeldung. */
export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    await authClient.signOut();
    router.replace("/kundenportal?abgemeldet=1");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10 disabled:opacity-70"
    >
      {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <LogOut aria-hidden="true" className="size-4" />}
      Abmelden
    </button>
  );
}

/** Bestätigungs-E-Mail erneut senden (Banner bei unbestätigter Adresse). */
export function ResendVerificationButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "pending" | "sent" | "error">("idle");

  const resend = async () => {
    setState("pending");
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/kundenportal/konto?verifiziert=1" });
    setState(error ? "error" : "sent");
  };

  if (state === "sent") return <span className="font-semibold">E-Mail gesendet – bitte Posteingang prüfen.</span>;

  return (
    <button
      type="button"
      onClick={resend}
      disabled={state === "pending"}
      className="font-semibold underline underline-offset-4 disabled:opacity-70"
    >
      {state === "error" ? "Erneut versuchen" : state === "pending" ? "Wird gesendet …" : "Bestätigungs-E-Mail erneut senden"}
    </button>
  );
}
