"use client";

import type { AdminCustomerDetail } from "@fa/shared";
import { LoaderCircle, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { AddressFields, readAddress } from "@/components/forms/AddressFields";
import { SelectField, TextField } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { Dialog, DialogSuccess, useCloseAfterSuccess } from "../Dialog";

const TYPE_OPTIONS = [
  { value: "PRIVATE", label: "Privatkunde" },
  { value: "BUSINESS", label: "Geschäftskunde" },
];

/** Stammdaten bearbeiten – Anschrift ist Pflicht, damit Rechnungen und Aufträge sie übernehmen. */
export function EditCustomerProfileButton({ customer }: { customer: AdminCustomerDetail["customer"] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClasses({ variant: "outline", size: "sm" })}>
        <Pencil aria-hidden="true" className="size-4" /> Bearbeiten
      </button>
      {open && <CustomerProfileDialog customer={customer} onClose={() => setOpen(false)} />}
    </>
  );
}

function CustomerProfileDialog({ customer, onClose }: { customer: AdminCustomerDetail["customer"]; onClose: () => void }) {
  const [success, setSuccess] = useCloseAfterSuccess(onClose);
  return (
    <Dialog open onClose={onClose} title="Kundendaten bearbeiten" description={`${customer.customerNumber} – der Kunde sieht die Änderung sofort in seinem Profil.`}>
      {success ? (
        <DialogSuccess message={success} detail="Rechnungen und neue Aufträge übernehmen die Anschrift ab sofort." onClose={onClose} />
      ) : (
        <CustomerProfileForm customer={customer} onSaved={() => setSuccess("Kundendaten gespeichert")} />
      )}
    </Dialog>
  );
}

function CustomerProfileForm({ customer, onSaved }: { customer: AdminCustomerDetail["customer"]; onSaved: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      await apiRequest(`/admin/customers/${customer.id}/profile`, {
        method: "PATCH",
        body: {
          type: text("type"),
          firstName: text("firstName"),
          lastName: text("lastName"),
          companyName: text("companyName"),
          vatId: text("vatId"),
          phone: text("phone"),
          billingAddress: readAddress(data),
        },
      });
      onSaved();
      router.refresh();
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.fields) setFieldErrors(saveError.fields);
      else setError(errorMessage(saveError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <SelectField name="type" label="Kundentyp" required options={TYPE_OPTIONS} defaultValue={customer.type} error={fieldErrors.type} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField name="firstName" label="Vorname" required defaultValue={customer.firstName} error={fieldErrors.firstName} />
        <TextField name="lastName" label="Nachname" required defaultValue={customer.lastName} error={fieldErrors.lastName} />
        <TextField name="companyName" label="Firma" defaultValue={customer.companyName} error={fieldErrors.companyName} />
        <TextField name="vatId" label="USt-IdNr." placeholder="DE123456789" defaultValue={customer.vatId} error={fieldErrors.vatId} />
      </div>
      <TextField name="phone" type="tel" label="Telefon" placeholder="+49 170 1234567" defaultValue={customer.phone} error={fieldErrors.phone} />
      <fieldset className="space-y-4 border-t border-slate-100 pt-5">
        <legend className="sr-only">Rechnungsadresse</legend>
        <p aria-hidden="true" className="text-sm font-semibold text-primary">
          Rechnungsadresse
        </p>
        <AddressFields defaultValue={customer.billingAddress} errors={fieldErrors} />
      </fieldset>
      <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "md" })}>
        {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
        Speichern
      </button>
    </form>
  );
}
