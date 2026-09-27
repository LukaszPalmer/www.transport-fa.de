"use client";

import type { AddressInput, PostalAddress } from "@fa/shared";
import { useLocale } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { countryOptions } from "@/lib/address";
import { SelectField, TextField } from "./fields";

const messages = defineMessages({
  de: {
    line1: "Straße und Hausnummer",
    line2: "Adresszusatz",
    line2Hint: "z. B. Hinterhaus, 3. OG, c/o",
    postalCode: "PLZ",
    city: "Ort",
    country: "Land",
  },
  en: {
    line1: "Street and house number",
    line2: "Address line 2",
    line2Hint: "e.g. rear building, 3rd floor, c/o",
    postalCode: "Postcode",
    city: "City",
    country: "Country",
  },
});

/** Adressfelder aus einem Formular lesen – Feldnamen wie in der API („billingAddress.city“). */
export function readAddress(data: FormData, prefix = "billingAddress"): AddressInput {
  const text = (field: string) => String(data.get(`${prefix}.${field}`) ?? "").trim();
  return { line1: text("line1"), line2: text("line2"), postalCode: text("postalCode"), city: text("city"), countryCode: text("countryCode") || "DE" };
}

/**
 * Anschrift (Rechnungsadresse) für Registrierung und Kundenprofil. Fehler kommen mit den
 * API-Schlüsseln („billingAddress.postalCode“) und landen so direkt am richtigen Feld.
 */
export function AddressFields({
  defaultValue,
  errors,
  prefix = "billingAddress",
}: {
  defaultValue?: PostalAddress;
  errors: Record<string, string>;
  prefix?: string;
}) {
  const locale = useLocale();
  const t = messages[locale];
  const error = (field: string) => errors[`${prefix}.${field}`];
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <TextField
        name={`${prefix}.line1`}
        label={t.line1}
        required
        autoComplete="address-line1"
        defaultValue={defaultValue?.line1}
        error={error("line1")}
        className="sm:col-span-3"
      />
      <TextField
        name={`${prefix}.line2`}
        label={t.line2}
        autoComplete="address-line2"
        hint={t.line2Hint}
        defaultValue={defaultValue?.line2}
        error={error("line2")}
        className="sm:col-span-3"
      />
      <TextField
        name={`${prefix}.postalCode`}
        label={t.postalCode}
        required
        autoComplete="postal-code"
        inputMode="numeric"
        defaultValue={defaultValue?.postalCode}
        error={error("postalCode")}
      />
      <TextField
        name={`${prefix}.city`}
        label={t.city}
        required
        autoComplete="address-level2"
        defaultValue={defaultValue?.city}
        error={error("city")}
        className="sm:col-span-2"
      />
      <SelectField
        name={`${prefix}.countryCode`}
        label={t.country}
        required
        options={countryOptions(locale)}
        defaultValue={defaultValue?.countryCode ?? "DE"}
        error={error("countryCode")}
        className="sm:col-span-3"
      />
    </div>
  );
}
