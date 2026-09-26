"use client";

import { SERVICE_SLUGS, type AdminShipmentRow } from "@fa/shared";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { serviceLabel } from "@/lib/admin-format";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { CustomerPicker, type PickedCustomer } from "../customers/CustomerPicker";
import { Dialog } from "../Dialog";

/** Neuen Auftrag anlegen – Kunde suchen, Leistung, Abhol- und Lieferadresse, Termine. */
export function CreateShipmentButton({ presetCustomer }: { presetCustomer?: PickedCustomer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClasses({ variant: "dark", size: "sm" })}>
        <Plus aria-hidden="true" className="size-4" /> Neuer Auftrag
      </button>
      {open && <CreateShipmentDialog presetCustomer={presetCustomer} onClose={() => setOpen(false)} />}
    </>
  );
}

function CreateShipmentDialog({ presetCustomer, onClose }: { presetCustomer?: PickedCustomer; onClose: () => void }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(presetCustomer);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer) {
      setFieldErrors({ customerId: "Bitte einen Kunden auswählen." });
      return;
    }
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const isoOrEmpty = (name: string) => (text(name) ? new Date(text(name)).toISOString() : "");
    const stop = (prefix: string) => ({ line1: text(`${prefix}.line1`), postalCode: text(`${prefix}.postalCode`), city: text(`${prefix}.city`), countryCode: text(`${prefix}.countryCode`) || "DE" });

    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      await apiRequest<AdminShipmentRow>("/admin/shipments", {
        body: {
          customerId: customer.id,
          service: text("service"),
          customerReference: text("customerReference"),
          cargoDescription: text("cargoDescription"),
          pickup: stop("pickup"),
          delivery: stop("delivery"),
          plannedPickupAt: isoOrEmpty("plannedPickupAt"),
          plannedDeliveryAt: isoOrEmpty("plannedDeliveryAt"),
        },
      });
      onClose();
      router.refresh();
    } catch (createError) {
      if (createError instanceof ApiError && createError.fields) setFieldErrors(createError.fields);
      else setError(errorMessage(createError));
      setPending(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Neuer Auftrag" description="Der Kunde sieht den Auftrag sofort im Kundenportal. Den Fahrer weisen Sie danach zu.">
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <Field label="Kunde" error={fieldErrors.customerId}>
          <CustomerPicker value={customer} onChange={setCustomer} locked={Boolean(presetCustomer)} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Leistung" error={fieldErrors.service}>
            <select name="service" required defaultValue="" className={selectClasses}>
              <option value="" disabled>
                Bitte wählen
              </option>
              {SERVICE_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {serviceLabel(slug)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Referenz des Kunden" optional error={fieldErrors.customerReference}>
            <input name="customerReference" className={`${inputClasses} h-12`} />
          </Field>
        </div>

        <StopFields prefix="pickup" title="Abholung" errors={fieldErrors} />
        <StopFields prefix="delivery" title="Lieferung" errors={fieldErrors} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Abholung geplant" optional error={fieldErrors.plannedPickupAt}>
            <input type="datetime-local" name="plannedPickupAt" className={`${inputClasses} h-12`} />
          </Field>
          <Field label="Lieferung geplant" optional error={fieldErrors.plannedDeliveryAt}>
            <input type="datetime-local" name="plannedDeliveryAt" className={`${inputClasses} h-12`} />
          </Field>
        </div>
        <Field label="Ladung / Hinweise" optional error={fieldErrors.cargoDescription}>
          <textarea name="cargoDescription" rows={3} className={`${inputClasses} py-3`} />
        </Field>

        <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "md" })}>
          {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Auftrag anlegen
        </button>
      </form>
    </Dialog>
  );
}

function StopFields({ prefix, title, errors }: { prefix: "pickup" | "delivery"; title: string; errors: Record<string, string> }) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-primary">{title}</legend>
      <div className="grid grid-cols-6 gap-3">
        <Field label="Straße und Hausnummer" className="col-span-6" error={errors[`${prefix}.line1`]}>
          <input name={`${prefix}.line1`} required autoComplete="off" className={`${inputClasses} h-11`} />
        </Field>
        <Field label="PLZ" className="col-span-2" error={errors[`${prefix}.postalCode`]}>
          <input name={`${prefix}.postalCode`} required inputMode="numeric" className={`${inputClasses} h-11`} />
        </Field>
        <Field label="Ort" className="col-span-3" error={errors[`${prefix}.city`]}>
          <input name={`${prefix}.city`} required className={`${inputClasses} h-11`} />
        </Field>
        <Field label="Land" className="col-span-1" error={errors[`${prefix}.countryCode`]}>
          <input name={`${prefix}.countryCode`} defaultValue="DE" maxLength={2} className={`${inputClasses} h-11 uppercase`} />
        </Field>
      </div>
    </fieldset>
  );
}

function Field({ label, error, optional, className, children }: { label: string; error?: string; optional?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-sm font-semibold text-primary">
        {label}
        {optional && <span className="ml-1.5 font-normal text-slate-500">(optional)</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm font-medium text-red-600">{error}</span>}
    </div>
  );
}
