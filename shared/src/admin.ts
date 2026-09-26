import { z } from "zod";
import { EmailSchema, NewPasswordSchema, PhoneSchema } from "./auth";
import {
  PERMISSIONS,
  SERVICE_SLUGS,
  SHIPMENT_STATUSES,
  STAFF_ROLES,
  type DocumentCategory,
  type DocumentVisibility,
  type Permission,
  type PresenceState,
  type Role,
  type ServiceSlug,
  type ShipmentStatus,
  type StaffRole,
  type UserState,
} from "./domain";

/** Admin-Bereich (/admin): Verträge für API und Oberfläche. */

const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Ungültige ID.");

// --- Anmeldung & 2FA -------------------------------------------------------------------

export const MfaCodeInput = z.object({
  /** 6-stelliger Authenticator-Code oder Wiederherstellungscode (xxxx-xxxx). */
  code: z.string({ error: "Bitte geben Sie den Code ein." }).trim().min(6, "Bitte geben Sie den Code ein.").max(20),
});

export interface MfaStatus {
  /** Authenticator-App verknüpft. */
  enabled: boolean;
  /** In dieser Sitzung bereits mit Code bestätigt. */
  verified: boolean;
  recoveryCodesLeft?: number;
}

export interface MfaSetupResponse {
  qrDataUrl: string;
  /** Zum manuellen Eintippen, falls der QR-Code nicht gescannt werden kann. */
  secret: string;
}

export interface MfaEnableResponse {
  recoveryCodes: string[];
}

export interface StaffMe {
  user: { id: string; name: string; email: string; role: StaffRole };
  staff: { displayName: string; jobTitle?: string; permissions: Permission[]; presence: PresenceState; soundEnabled: boolean };
}

// --- Übersicht ---------------------------------------------------------------------------

export interface AdminOverview {
  stats: {
    customers: number;
    customersOnline: number;
    activeShipments: number;
    unassignedShipments: number;
    openChats: number;
    unreadChats: number;
  };
}

// --- Kunden ------------------------------------------------------------------------------

export interface AdminCustomerRow {
  id: string;
  userId: string;
  customerNumber: string;
  name: string;
  companyName?: string;
  email: string;
  emailVerified: boolean;
  online: boolean;
  lastSeenAt?: string;
  createdAt: string;
  activeShipments: number;
  lastConversation?: { at: string; preview: string; open: boolean };
}

export interface AdminCustomerList {
  customers: AdminCustomerRow[];
  total: number;
}

export interface AdminDocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  source: "CUSTOMER" | "OFFICE";
  visibility: DocumentVisibility;
  handToDriver: boolean;
  shipmentNumber?: string;
}

export interface AdminShipmentRow {
  id: string;
  shipmentNumber: string;
  status: ShipmentStatus;
  service: ServiceSlug;
  customer: { id: string; customerNumber: string; name: string };
  pickupCity: string;
  deliveryCity: string;
  plannedPickupAt?: string;
  plannedDeliveryAt?: string;
  driver?: { id: string; name: string; phone: string; plate?: string };
  documents: number;
  createdAt: string;
}

export interface AdminCustomerDetail {
  customer: {
    id: string;
    customerNumber: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
    type: string;
    createdAt: string;
  };
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    hasPassword: boolean;
    googleLinked: boolean;
    state: UserState;
    lastLoginAt?: string;
    lastSeenAt?: string;
    createdAt: string;
  };
  online: boolean;
  shipments: AdminShipmentRow[];
  documents: AdminDocumentItem[];
  chats: Array<{ id: string; status: string; lastMessageAt: string; preview: string; unreadByStaff: number }>;
}

// --- Benutzer & Zugangsdaten --------------------------------------------------------------

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  state: UserState;
  online: boolean;
  lastLoginAt?: string;
  lastSeenAt?: string;
  createdAt: string;
  customerNumber?: string;
  staff?: { displayName: string; jobTitle?: string; permissions: Permission[]; mfaEnabled: boolean };
}

/** Zugangsdaten neu setzen – Passwörter sind gehasht und lassen sich nicht anzeigen, nur neu vergeben. */
export const UpdateCredentialsInput = z
  .object({
    email: EmailSchema.optional(),
    password: NewPasswordSchema.optional(),
  })
  .refine((value) => value.email !== undefined || value.password !== undefined, { message: "Bitte E-Mail oder Passwort angeben." });
export type UpdateCredentialsInput = z.input<typeof UpdateCredentialsInput>;

export const CreateStaffInput = z.object({
  displayName: z.string({ error: "Bitte geben Sie einen Namen ein." }).trim().min(2, "Bitte geben Sie einen Namen ein.").max(60),
  jobTitle: z.string().trim().max(60).optional().transform((value) => value || undefined),
  email: EmailSchema,
  password: NewPasswordSchema,
  role: z.enum(STAFF_ROLES),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
});
export type CreateStaffInput = z.input<typeof CreateStaffInput>;

export const UpdateStaffInput = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  jobTitle: z.string().trim().max(60).optional(),
  role: z.enum(STAFF_ROLES).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
  state: z.enum(["ACTIVE", "DISABLED"]).optional(),
  resetMfa: z.boolean().optional(),
});
export type UpdateStaffInput = z.input<typeof UpdateStaffInput>;

// --- Aufträge & Fahrer ---------------------------------------------------------------------

export const StopInput = z.object({
  line1: z.string({ error: "Straße und Hausnummer fehlen." }).trim().min(3, "Straße und Hausnummer fehlen.").max(200),
  postalCode: z.string({ error: "PLZ fehlt." }).trim().min(3, "PLZ fehlt.").max(12),
  city: z.string({ error: "Ort fehlt." }).trim().min(2, "Ort fehlt.").max(100),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Ländercode, z. B. DE").default("DE"),
  contactName: z.string().trim().max(120).optional().transform((value) => value || undefined),
});

export const CreateShipmentInput = z.object({
  customerId: objectId,
  service: z.enum(SERVICE_SLUGS),
  cargoDescription: z.string().trim().max(2000).optional().transform((value) => value || undefined),
  customerReference: z.string().trim().max(100).optional().transform((value) => value || undefined),
  pickup: StopInput,
  delivery: StopInput,
  plannedPickupAt: z.iso.datetime({ offset: true }).optional().or(z.literal("").transform(() => undefined)),
  plannedDeliveryAt: z.iso.datetime({ offset: true }).optional().or(z.literal("").transform(() => undefined)),
});
export type CreateShipmentInput = z.input<typeof CreateShipmentInput>;

export const UpdateShipmentStatusInput = z.object({ status: z.enum(SHIPMENT_STATUSES) });

/** Fahrer-Zuweisung: Name, Telefon (international) und Kennzeichen sind Pflicht. */
export const AssignDriverInput = z.object({
  driverId: objectId.optional(),
  firstName: z.string({ error: "Vorname des Fahrers fehlt." }).trim().min(1, "Vorname des Fahrers fehlt.").max(100),
  lastName: z.string({ error: "Nachname des Fahrers fehlt." }).trim().min(1, "Nachname des Fahrers fehlt.").max(100),
  phone: PhoneSchema,
  plate: z
    .string({ error: "Kennzeichen fehlt." })
    .trim()
    .toUpperCase()
    .min(4, "Kennzeichen fehlt.")
    .max(15)
    .regex(/^[A-ZÄÖÜ0-9][A-ZÄÖÜ0-9\s-]*[A-ZÄÖÜ0-9]$/, "Kennzeichen, z. B. B-XY 1234"),
  vehicleLabel: z.string().trim().max(80).optional().transform((value) => value || undefined),
});
export type AssignDriverInput = z.input<typeof AssignDriverInput>;

export interface AdminDriver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  plate?: string;
  vehicleLabel?: string;
  active: boolean;
  activeShipments: number;
}

export interface AdminShipmentList {
  shipments: AdminShipmentRow[];
  total: number;
}
