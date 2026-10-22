import type { CustomerSummary, CustomerType, Locale, PostalAddress } from "@fa/shared";
import type { ClientSession, Types } from "mongoose";
import type { Address } from "../db/schema-kit";
import { CustomerProfile, nextSequence, type ICustomerProfile } from "../models";

const CUSTOMER_NUMBER_OFFSET = 10_000;

interface NewCustomer {
  userId: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  /** Pflicht bei der Registrierung per Formular – Google-Konten ergänzen sie im Portal. */
  billingAddress?: PostalAddress;
  /** Sprache der Website bei der Registrierung – bestimmt die Sprache der E-Mails. */
  locale?: Locale;
  /** Vom Büro gewählt („Kunde anlegen“) – sonst aus der Firma abgeleitet. */
  type?: CustomerType;
  vatId?: string;
  phone?: string;
}

/** Legt das Kundenprofil mit fortlaufender Kundennummer an (K-10001, K-10002, …). */
export async function createCustomerProfile(input: NewCustomer, session?: ClientSession) {
  const customerNumber = `K-${CUSTOMER_NUMBER_OFFSET + (await nextSequence("customer", session))}`;
  const fields = {
    customerNumber,
    firstName: input.firstName,
    lastName: input.lastName,
    companyName: input.companyName,
    billingAddress: input.billingAddress,
  };
  const [profile] = await CustomerProfile.create(
    [
      {
        userId: input.userId,
        ...fields,
        type: input.type ?? (input.companyName ? "BUSINESS" : "PRIVATE"),
        vatId: input.vatId,
        phone: input.phone,
        locale: input.locale ?? "de",
        searchText: buildSearchText(fields, input.email),
      },
    ],
    { session },
  );
  if (!profile) throw new Error("Kundenprofil konnte nicht angelegt werden");
  return profile;
}

/** Suchtext für die Admin-Suche – auch nach PLZ und Ort („alle Kunden in Neuss“). */
export function buildSearchText(
  profile: Pick<ICustomerProfile, "customerNumber" | "firstName" | "lastName"> & {
    companyName?: string;
    billingAddress?: Pick<Address, "postalCode" | "city">;
  },
  email: string,
): string {
  return [profile.customerNumber, profile.firstName, profile.lastName, profile.companyName, email, profile.billingAddress?.postalCode, profile.billingAddress?.city]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Nur die Adressfelder – Mongoose-Subdokumente tragen sonst interne Felder mit. */
export function toPostalAddress(address: Address): PostalAddress {
  return { line1: address.line1, line2: address.line2 || undefined, postalCode: address.postalCode, city: address.city, countryCode: address.countryCode };
}

export function toCustomerSummary(
  profile: Pick<ICustomerProfile, "_id" | "customerNumber" | "type" | "firstName" | "lastName" | "companyName" | "billingAddress">,
): CustomerSummary {
  return {
    id: String(profile._id),
    customerNumber: profile.customerNumber,
    type: profile.type,
    firstName: profile.firstName,
    lastName: profile.lastName,
    companyName: profile.companyName,
    hasBillingAddress: Boolean(profile.billingAddress?.line1),
  };
}
