"use client";

import { LEAD_STATUS_INFO, LEAD_STATUSES, type AdminLeadDetail, type LeadStatus, type StaffOption } from "@fa/shared";
import { LoaderCircle, MessageSquarePlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { formatRelative } from "@/lib/admin-format";
import { apiRequest } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import type { NewCustomerDefaults } from "../customers/CreateCustomerDialog";
import { CustomerPicker, type PickedCustomer } from "../customers/CustomerPicker";

const toDay = (iso?: string) => (iso ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(iso)) : "");
const toEuroInput = (cents?: number) => (cents === undefined ? "" : String(cents / 100).replace(".", ","));

/** Name, Firma und Kontakt aus der Anfrage – „Neuen Kunden anlegen“ ist damit fast fertig ausgefüllt. */
function customerDefaultsFrom(lead: AdminLeadDetail): NewCustomerDefaults {
  const [first = "", ...rest] = lead.name.trim().split(/\s+/);
  return {
    firstName: rest.length > 0 ? first : undefined,
    lastName: rest.length > 0 ? rest.join(" ") : first,
    companyName: lead.company,
    email: lead.email,
    phone: lead.phone,
  };
}

/** Pipeline-Status, Zuständigkeit, Wiedervorlage, Auftragswert und Kunde einer Anfrage pflegen. */
export function LeadEditor({
  lead,
  staff,
  canDelete,
  canCreateCustomer,
}: {
  lead: AdminLeadDetail;
  staff: StaffOption[];
  canDelete: boolean;
  /** „Neuen Kunden anlegen“ in der Kundenauswahl (Recht „Kunden bearbeiten“). */
  canCreateCustomer?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [assignedToId, setAssignedToId] = useState(lead.assignedTo?.id ?? "");
  const [followUpAt, setFollowUpAt] = useState(toDay(lead.followUpAt));
  const [value, setValue] = useState(toEuroInput(lead.estimatedValueCents));
  const [lostReason, setLostReason] = useState(lead.lostReason ?? "");
  const [customer, setCustomer] = useState<PickedCustomer | undefined>(lead.customer);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const euros = value.trim() ? Number(value.replace(/\./g, "").replace(",", ".")) : null;
    if (euros !== null && (!Number.isFinite(euros) || euros < 0)) {
      setMessage({ tone: "error", text: "Bitte einen gültigen Auftragswert eingeben, z. B. 1.250,00." });
      return;
    }
    setPending(true);
    setMessage(undefined);
    try {
      await apiRequest(`/admin/leads/${lead.id}`, {
        method: "PATCH",
        body: {
          status,
          assignedToId: assignedToId || null,
          followUpAt: followUpAt || null,
          estimatedValueCents: euros === null ? null : Math.round(euros * 100),
          lostReason: status === "LOST" ? lostReason || null : null,
          customerId: customer?.id ?? null,
        },
      });
      setMessage({ tone: "success", text: "Gespeichert." });
      router.refresh();
    } catch (error) {
      setMessage({ tone: "error", text: errorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Anfrage ${lead.number} endgültig löschen? Das lässt sich nicht rückgängig machen (z. B. auf Wunsch der anfragenden Person).`)) return;
    setPending(true);
    try {
      await apiRequest(`/admin/leads/${lead.id}`, { method: "DELETE" });
      router.replace(routes.adminLeads);
      router.refresh();
    } catch (error) {
      setMessage({ tone: "error", text: errorMessage(error) });
      setPending(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      {message && <AuthAlert tone={message.tone}>{message.text}</AuthAlert>}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-primary">Status</legend>
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setStatus(entry)}
              aria-pressed={status === entry}
              title={LEAD_STATUS_INFO[entry].description}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
                status === entry ? "bg-primary text-white ring-primary" : "bg-white text-slate-600 ring-slate-200 hover:text-primary",
              )}
            >
              {LEAD_STATUS_INFO[entry].label}
            </button>
          ))}
        </div>
      </fieldset>
      {status === "LOST" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Grund</span>
          <input value={lostReason} onChange={(event) => setLostReason(event.target.value)} maxLength={300} placeholder="z. B. zu teuer, anderer Anbieter, Termin passt nicht" className={`${inputClasses} h-11`} />
        </label>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Zuständig</span>
          <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)} className={selectClasses}>
            <option value="">– niemand –</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Wiedervorlage</span>
          <input type="date" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} className={`${inputClasses} h-11`} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Auftragswert (€, geschätzt)</span>
          <input inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="z. B. 1.250" className={`${inputClasses} h-11`} />
        </label>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-primary">Kunde im Portal</span>
        <CustomerPicker value={customer} onChange={setCustomer} allowCreate={canCreateCustomer} createDefaults={customerDefaultsFrom(lead)} />
        <p className="mt-1 text-xs text-slate-500">
          {canCreateCustomer
            ? "Noch kein Kundenkonto? In der Suche „Neuen Kunden anlegen“ wählen – Name und Kontaktdaten kommen aus der Anfrage. Danach „Speichern“."
            : "Verknüpfen, sobald die Person ein Kundenkonto hat – die Anfrage erscheint dann in der Kundenakte."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "sm" })}>
          {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Speichern
        </button>
        {canDelete && (
          <button type="button" onClick={() => void remove()} disabled={pending} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50">
            <Trash2 aria-hidden="true" className="size-4" /> Anfrage löschen
          </button>
        )}
      </div>
    </form>
  );
}

/** Interne Notizen (neueste zuerst) – Gesprächsnotizen, Absprachen, Preise. */
export function LeadNotes({ leadId, notes }: { leadId: string; notes: AdminLeadDetail["notes"] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    setError(undefined);
    try {
      await apiRequest(`/admin/leads/${leadId}/notes`, { body: { body } });
      setBody("");
      router.refresh();
    } catch (noteError) {
      setError(errorMessage(noteError));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="space-y-2">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="z. B. Besichtigung am 12.10. um 10 Uhr vereinbart"
          className={`${inputClasses} py-3`}
        />
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button type="submit" disabled={pending || !body.trim()} className={buttonClasses({ variant: "outline", size: "sm" })}>
          {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <MessageSquarePlus aria-hidden="true" className="size-4" />}
          Notiz hinzufügen
        </button>
      </form>
      {notes.length === 0 ? (
        <p className="text-sm text-slate-500">Noch keine Notizen.</p>
      ) : (
        <ol className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-xl bg-surface p-3 text-sm">
              <p className="whitespace-pre-line text-slate-700">{note.body}</p>
              <p className="mt-1 text-xs text-slate-500">
                {note.author ?? "Team"} · {formatRelative(note.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
