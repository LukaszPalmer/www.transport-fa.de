"use client";

import type { AdminDriver, AdminShipmentRow } from "@fa/shared";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { Dialog, DialogSuccess, useCloseAfterSuccess } from "../Dialog";

interface DriverForm {
  driverId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  plate: string;
  vehicleLabel: string;
}

const EMPTY: DriverForm = { firstName: "", lastName: "", phone: "", plate: "", vehicleLabel: "" };

/**
 * Fahrer zuweisen: bekannten Fahrer wählen oder neu erfassen. Name, Telefon (international)
 * und Kennzeichen sind Pflicht – der Kunde sieht sie im Tracking.
 */
export function DriverDialog({ shipment, open, onClose, onSaved }: { shipment: AdminShipmentRow; open: boolean; onClose: () => void; onSaved: (row: AdminShipmentRow) => void }) {
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [form, setForm] = useState<DriverForm>(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess, close] = useCloseAfterSuccess(onClose);

  useEffect(() => {
    if (!open) return;
    let active = true;
    apiRequest<{ drivers: AdminDriver[] }>("/admin/drivers").then(
      ({ drivers: list }) => {
        if (!active) return;
        setDrivers(list);
        const current = shipment.driver ? list.find((driver) => driver.id === shipment.driver?.id) : undefined;
        setForm(current ? fromDriver(current) : EMPTY);
      },
      () => active && setDrivers([]),
    );
    return () => {
      active = false;
    };
  }, [open, shipment.driver]);

  const update = (field: keyof DriverForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const choose = (driverId: string) => {
    const driver = drivers.find((item) => item.id === driverId);
    setForm(driver ? fromDriver(driver) : EMPTY);
    setFieldErrors({});
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      const row = await apiRequest<AdminShipmentRow>(`/admin/shipments/${shipment.id}/driver`, { method: "PUT", body: form });
      onSaved(row);
      setSuccess(`${form.firstName} ${form.lastName} ist zugewiesen`);
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.fields) setFieldErrors(saveError.fields);
      else setError(errorMessage(saveError));
    } finally {
      setPending(false);
    }
  };

  const unassign = async () => {
    setPending(true);
    setError(undefined);
    try {
      onSaved(await apiRequest<AdminShipmentRow>(`/admin/shipments/${shipment.id}/driver`, { method: "DELETE" }));
      setSuccess("Fahrer entfernt");
    } catch (removeError) {
      setError(errorMessage(removeError));
    } finally {
      setPending(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onClose={close} title={`Fahrer für ${shipment.shipmentNumber}`}>
        <DialogSuccess message={success} detail="Der Kunde sieht den Fahrer jetzt im Tracking." onClose={close} />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Fahrer für ${shipment.shipmentNumber}`} description={`${shipment.pickupCity} → ${shipment.deliveryCity} · ${shipment.customer.name}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        {drivers.length > 0 && (
          <Field label="Bekannter Fahrer" optional>
            <select value={form.driverId ?? ""} onChange={(event) => choose(event.target.value)} className={selectClasses}>
              <option value="">Neuen Fahrer erfassen</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.firstName} {driver.lastName} · {driver.plate ?? "ohne Kennzeichen"}
                  {driver.activeShipments ? ` · ${driver.activeShipments} aktiv` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Vorname" error={fieldErrors.firstName}>
            <input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} required autoComplete="off" className={`${inputClasses} h-12`} />
          </Field>
          <Field label="Nachname" error={fieldErrors.lastName}>
            <input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} required autoComplete="off" className={`${inputClasses} h-12`} />
          </Field>
        </div>
        <Field label="Telefon" hint="International, z. B. +49 170 1234567" error={fieldErrors.phone}>
          <input
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            required
            placeholder="+49 170 1234567"
            className={`${inputClasses} h-12`}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Kennzeichen" hint="z. B. B-XY 1234" error={fieldErrors.plate}>
            <input
              value={form.plate}
              onChange={(event) => update("plate", event.target.value.toUpperCase())}
              required
              placeholder="B-XY 1234"
              className={`${inputClasses} h-12 font-mono tracking-wider`}
            />
          </Field>
          <Field label="Fahrzeug" optional error={fieldErrors.vehicleLabel}>
            <input value={form.vehicleLabel} onChange={(event) => update("vehicleLabel", event.target.value)} placeholder="z. B. 7,5 t Koffer" className={`${inputClasses} h-12`} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "md" })}>
            {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {shipment.driver ? "Fahrer speichern" : "Fahrer zuweisen"}
          </button>
          {shipment.driver && (
            <button type="button" onClick={() => void unassign()} disabled={pending} className="text-sm font-semibold text-red-700 underline-offset-4 hover:underline">
              Zuweisung aufheben
            </button>
          )}
        </div>
      </form>
    </Dialog>
  );
}

function fromDriver(driver: AdminDriver): DriverForm {
  return { driverId: driver.id, firstName: driver.firstName, lastName: driver.lastName, phone: driver.phone, plate: driver.plate ?? "", vehicleLabel: driver.vehicleLabel ?? "" };
}

function Field({ label, hint, error, optional, children }: { label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-primary">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-slate-500">(optional)</span> : <span className="ml-0.5 text-red-600">*</span>}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-sm font-medium text-red-600">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
