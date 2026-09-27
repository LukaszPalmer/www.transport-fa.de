"use client";

import type { AdminCustomerDetail, StaffOption } from "@fa/shared";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";

/** Interne Notizen und zuständiger Betreuer – nur für Mitarbeiter sichtbar, nie für den Kunden. */
export function CustomerCrmForm({ customerId, crm, staff }: { customerId: string; crm: AdminCustomerDetail["crm"]; staff: StaffOption[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(crm.internalNotes);
  const [manager, setManager] = useState(crm.accountManagerId ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();
  const dirty = notes !== crm.internalNotes || manager !== (crm.accountManagerId ?? "");

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(undefined);
    try {
      await apiRequest(`/admin/customers/${customerId}/crm`, { method: "PATCH", body: { internalNotes: notes, accountManagerId: manager || null } });
      setMessage({ tone: "success", text: "Gespeichert." });
      router.refresh();
    } catch (error) {
      setMessage({ tone: "error", text: errorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      {message && <AuthAlert tone={message.tone}>{message.text}</AuthAlert>}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-primary">Betreuer</span>
        <select value={manager} onChange={(event) => setManager(event.target.value)} className={selectClasses}>
          <option value="">– kein fester Betreuer –</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-primary">Interne Notizen</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={6}
          maxLength={5000}
          placeholder="z. B. Zugang über Hinterhof, 3. OG ohne Aufzug, bevorzugt vormittags erreichbar"
          className={`${inputClasses} py-3`}
        />
        <span className="mt-1 block text-xs text-slate-500">Nur für das Team sichtbar – bitte keine Gesundheits- oder Bankdaten.</span>
      </label>
      <button type="submit" disabled={pending || !dirty} className={buttonClasses({ variant: "dark", size: "sm" })}>
        {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
        Speichern
      </button>
    </form>
  );
}
