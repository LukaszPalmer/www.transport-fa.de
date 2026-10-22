"use client";

import type { CreatedCustomer } from "@fa/shared";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { routes } from "@/content/navigation";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { AddressFields, readAddress } from "@/components/forms/AddressFields";
import { CheckboxField, SelectField, TextField } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { Dialog } from "../Dialog";

/** Vorbelegung – aus einer Anfrage oder dem Suchbegriff der Kundenauswahl. */
export interface NewCustomerDefaults {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
}

const TYPE_OPTIONS = [
  { value: "PRIVATE", label: "Privatkunde" },
  { value: "BUSINESS", label: "Geschäftskunde" },
];

const LOCALE_OPTIONS = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "Englisch" },
];

/** Kundenliste: „Kunde anlegen“ – danach geht es direkt in die neue Kundenakte. */
export function CreateCustomerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClasses({ variant: "dark", size: "sm" })}>
        <UserPlus aria-hidden="true" className="size-4" /> Kunde anlegen
      </button>
      {open && (
        <CreateCustomerDialog
          onClose={() => setOpen(false)}
          onCreated={(created) => {
            setOpen(false);
            router.push(`${routes.adminUsers}/${created.customer.id}`);
          }}
        />
      )}
    </>
  );
}

/**
 * Kunde durch das Büro anlegen (Telefon, E-Mail, Anfrage): Kundennummer und Konto entstehen sofort,
 * auf Wunsch mit Zugangslink zum Kundenportal. Liegt per Portal direkt in <body>, damit er sich auch
 * aus einem anderen Dialog heraus öffnen lässt (z. B. „Neuer Auftrag“), ohne Formulare zu verschachteln.
 */
export function CreateCustomerDialog({
  defaults,
  onClose,
  onCreated,
}: {
  defaults?: NewCustomerDefaults;
  onClose: () => void;
  onCreated: (created: CreatedCustomer) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Im React-Baum liegt der Dialog evtl. in einem anderen Formular – das darf nicht mit absenden.
    event.stopPropagation();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      const created = await apiRequest<CreatedCustomer>("/admin/customers", {
        body: {
          type: text("type"),
          firstName: text("firstName"),
          lastName: text("lastName"),
          companyName: text("companyName"),
          vatId: text("vatId"),
          email: text("email"),
          phone: text("phone"),
          locale: text("locale"),
          billingAddress: readAddress(data),
          sendInvitation: data.get("sendInvitation") === "on",
        },
      });
      onCreated(created);
    } catch (createError) {
      if (createError instanceof ApiError && createError.fields) setFieldErrors(createError.fields);
      else setError(errorMessage(createError));
      setPending(false);
    }
  };

  return createPortal(
    <Dialog open onClose={onClose} title="Kunde anlegen" description="Für Kunden, die per Telefon oder E-Mail bestellen. Kundennummer und Kundenkonto entstehen sofort.">
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        <SelectField name="type" label="Kundentyp" required options={TYPE_OPTIONS} defaultValue={defaults?.companyName ? "BUSINESS" : "PRIVATE"} error={fieldErrors.type} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField name="firstName" label="Vorname" required defaultValue={defaults?.firstName} error={fieldErrors.firstName} />
          <TextField name="lastName" label="Nachname" required defaultValue={defaults?.lastName} error={fieldErrors.lastName} />
          <TextField name="companyName" label="Firma" defaultValue={defaults?.companyName} error={fieldErrors.companyName} />
          <TextField name="vatId" label="USt-IdNr." placeholder="DE123456789" error={fieldErrors.vatId} />
        </div>
        <TextField
          name="email"
          type="email"
          label="E-Mail-Adresse"
          required
          defaultValue={defaults?.email}
          hint="Am Telefon buchstabieren lassen – hierhin gehen Zugangslink, Rechnungen und Benachrichtigungen."
          error={fieldErrors.email}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField name="phone" type="tel" label="Telefon" placeholder="+49 170 1234567" defaultValue={defaults?.phone} error={fieldErrors.phone} />
          <SelectField name="locale" label="Sprache der E-Mails" options={LOCALE_OPTIONS} defaultValue="de" error={fieldErrors.locale} />
        </div>
        <fieldset className="space-y-4 border-t border-slate-100 pt-5">
          <legend className="sr-only">Rechnungsadresse</legend>
          <p aria-hidden="true" className="text-sm font-semibold text-primary">
            Rechnungsadresse
          </p>
          <AddressFields errors={fieldErrors} />
        </fieldset>
        <CheckboxField name="sendInvitation" defaultChecked className="border-t border-slate-100 pt-5">
          <span className="font-semibold text-primary">Zugangslink zum Kundenportal per E-Mail senden</span>
          <span className="mt-0.5 block">
            Der Kunde legt damit selbst sein Passwort fest (7 Tage gültig). Ohne Link kann er sich später über „Passwort vergessen“ oder mit Google anmelden.
          </span>
        </CheckboxField>
        <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "md" })}>
          {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Kunde anlegen
        </button>
      </form>
    </Dialog>,
    document.body,
  );
}
