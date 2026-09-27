import type { CustomerSummary, Locale } from "@fa/shared";
import type { ClientSession, Types } from "mongoose";
import { CustomerProfile, nextSequence, type ICustomerProfile } from "../models";

const CUSTOMER_NUMBER_OFFSET = 10_000;

interface NewCustomer {
  userId: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  /** Sprache der Website bei der Registrierung – bestimmt die Sprache der E-Mails. */
  locale?: Locale;
}

/** Legt das Kundenprofil mit fortlaufender Kundennummer an (K-10001, K-10002, …). */
export async function createCustomerProfile(input: NewCustomer, session?: ClientSession) {
  const customerNumber = `K-${CUSTOMER_NUMBER_OFFSET + (await nextSequence("customer", session))}`;
  const [profile] = await CustomerProfile.create(
    [
      {
        userId: input.userId,
        customerNumber,
        firstName: input.firstName,
        lastName: input.lastName,
        locale: input.locale ?? "de",
        searchText: buildSearchText({ customerNumber, firstName: input.firstName, lastName: input.lastName }, input.email),
      },
    ],
    { session },
  );
  if (!profile) throw new Error("Kundenprofil konnte nicht angelegt werden");
  return profile;
}

export function buildSearchText(
  profile: Pick<ICustomerProfile, "customerNumber" | "firstName" | "lastName"> & { companyName?: string },
  email: string,
): string {
  return [profile.customerNumber, profile.firstName, profile.lastName, profile.companyName, email]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function toCustomerSummary(
  profile: Pick<ICustomerProfile, "_id" | "customerNumber" | "type" | "firstName" | "lastName" | "companyName">,
): CustomerSummary {
  return {
    id: String(profile._id),
    customerNumber: profile.customerNumber,
    type: profile.type,
    firstName: profile.firstName,
    lastName: profile.lastName,
    companyName: profile.companyName,
  };
}
