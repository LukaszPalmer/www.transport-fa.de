"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { buttonClasses } from "@/components/ui/button-styles";

/** Kundenakte: Zugangslink (erneut) senden, solange der Kunde noch kein Passwort festgelegt hat. */
export function SendInvitationButton({ customerId, email }: { customerId: string; email: string }) {
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState<string>();

  const send = async () => {
    setState("pending");
    setError(undefined);
    try {
      await apiRequest(`/admin/customers/${customerId}/invitation`, { body: {} });
      setState("sent");
    } catch (caught) {
      setError(errorMessage(caught));
      setState("idle");
    }
  };

  return (
    <div className="mt-5 rounded-xl bg-surface p-4 text-sm">
      <p className="text-slate-600">
        Noch kein Zugang zum Kundenportal. Mit dem Zugangslink legt der Kunde sein Passwort selbst fest (7 Tage gültig) – Rechnungen bekommt er auch ohne.
      </p>
      {state === "sent" ? (
        <p role="status" className="mt-3 font-semibold text-emerald-700">
          Zugangslink an {email} gesendet.
        </p>
      ) : (
        <button type="button" onClick={() => void send()} disabled={state === "pending"} className={buttonClasses({ variant: "outline", size: "sm", className: "mt-3" })}>
          {state === "pending" ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          Zugangslink senden
        </button>
      )}
      {error && <p className="mt-2 font-medium text-red-600">{error}</p>}
    </div>
  );
}
