import { z } from "zod";
import { AddressInput, EmailSchema, NewPasswordSchema, PhoneSchema, personName, type PostalAddress } from "./auth";
import type { LeadStatus, LeadTopic } from "./crm";
import {
  CUSTOMER_TYPES,
  INVOICE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PERMISSIONS,
  SERVICE_SLUGS,
  SHIPMENT_STATUSES,
  STAFF_ROLES,
  type CustomerType,
  type DocumentCategory,
  type DocumentVisibility,
  type EffectivePaymentStatus,
  type InvoiceSource,
  type InvoiceType,
  type Locale,
  type PaymentMethod,
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

// --- Kunden ------------------------------------------------------------------------------

export interface AdminCustomerRow {
  id: string;
  userId: string;
  customerNumber: string;
  name: string;
  companyName?: string;
  /** Rechnungsadresse – Vorschlag für Aufträge und Rechnungen; fehlt bei Google-Konten ohne Angabe. */
  billingAddress?: PostalAddress;
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
  /** Nur mit dem Recht „Rechnungen & Belege“: die maßgebliche Rechnung zum Auftrag. */
  invoice?: AdminShipmentInvoice;
  /** Nur mit dem Recht „Rechnungen & Belege“: offener Rechnungsentwurf zum Auftrag. */
  invoiceDraftId?: string;
  createdAt: string;
}

/** Rechnung eines Auftrags – die neueste nicht stornierte, sonst die neueste stornierte. */
export interface AdminShipmentInvoice {
  id: string;
  number: string;
  grossCents: number;
  paymentStatus: EffectivePaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}

export interface AdminCustomerDetail {
  customer: {
    id: string;
    customerNumber: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
    type: CustomerType;
    vatId?: string;
    billingAddress?: PostalAddress;
    /** Sprache für E-Mails und Portal (vom Kunden gewählt). */
    locale: Locale;
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
  /** Leer, wenn das Recht „Rechnungen & Belege“ fehlt. */
  invoices: AdminInvoiceRow[];
  chats: Array<{ id: string; status: string; lastMessageAt: string; preview: string; unreadByStaff: number }>;
  /** CRM: interne Notizen, zuständiger Betreuer, verknüpfte Anfragen. */
  crm: {
    internalNotes: string;
    accountManagerId?: string;
    leads: Array<{ id: string; number: string; status: LeadStatus; topic: LeadTopic; createdAt: string }>;
  };
}

/** Stammdaten eines Kunden durch das Büro ändern – dieselben Pflichtfelder wie im Kundenportal. */
export const UpdateCustomerProfileInput = z.object({
  type: z.enum(CUSTOMER_TYPES),
  firstName: personName("Vornamen"),
  lastName: personName("Nachnamen"),
  companyName: z.string().trim().max(200, "Höchstens 200 Zeichen.").optional().transform((value) => value || undefined),
  vatId: z
    .string()
    .trim()
    .toUpperCase()
    .transform((value) => value.replace(/[\s.-]/g, ""))
    .pipe(z.string().max(20, "Die USt-IdNr. ist zu lang.").regex(/^([A-Z]{2}[A-Z0-9]{2,13})?$/, "USt-IdNr. mit Ländercode, z. B. DE123456789"))
    .optional()
    .transform((value) => value || undefined),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .pipe(PhoneSchema.optional()),
  billingAddress: AddressInput,
});
export type UpdateCustomerProfileInput = z.input<typeof UpdateCustomerProfileInput>;

/** Aktive Mitarbeiter für Auswahlfelder (Betreuer, Zuständigkeit). */
export interface StaffOption {
  id: string;
  name: string;
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

// --- Rechnungen & Belege ---------------------------------------------------------------------

/**
 * Zwei Wege: Rechnungen im Portal erstellen (E-Rechnung, siehe invoicing.ts) oder Belege aus
 * der Buchhaltung (Lexware) hochladen – dann werden PDF und Eckdaten an den Kunden gesendet.
 * Formularfelder des Uploads kommen als Multipart-Strings, Beträge in Cent.
 */
const dateOnly = z.string({ error: "Bitte ein Datum wählen." }).regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte ein Datum wählen.");
const optionalDate = dateOnly.optional().or(z.literal("").transform(() => undefined));
const amountCents = (label: string) =>
  z.coerce
    .number({ error: `${label} fehlt.` })
    .int(`${label} ist ungültig.`)
    .min(0, `${label} darf nicht negativ sein.`)
    .max(1_000_000_000, `${label} ist zu hoch.`);

export const UploadInvoiceFields = z
  .object({
    type: z.enum(INVOICE_TYPES, { error: "Bitte die Belegart wählen." }),
    number: z.string({ error: "Belegnummer fehlt." }).trim().min(1, "Belegnummer fehlt.").max(40, "Die Belegnummer ist zu lang."),
    customerId: objectId,
    shipmentId: objectId.optional().or(z.literal("").transform(() => undefined)),
    issueDate: dateOnly,
    dueDate: optionalDate,
    validUntil: optionalDate,
    netCents: amountCents("Der Nettobetrag"),
    vatCents: amountCents("Die Umsatzsteuer"),
    /** Nur Rechnungen: schon bezahlt, z. B. bar beim Umzug. */
    paidWith: z.enum(PAYMENT_METHODS).optional().or(z.literal("").transform(() => undefined)),
    notify: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  })
  .superRefine((value, context) => {
    if (value.type === "INVOICE" && !value.dueDate) context.addIssue({ code: "custom", path: ["dueDate"], message: "Bitte das Fälligkeitsdatum angeben." });
    if (value.dueDate && value.dueDate < value.issueDate) context.addIssue({ code: "custom", path: ["dueDate"], message: "Die Fälligkeit liegt vor dem Belegdatum." });
    if (value.validUntil && value.validUntil < value.issueDate) context.addIssue({ code: "custom", path: ["validUntil"], message: "Das Angebot endet vor dem Belegdatum." });
  });
export type UploadInvoiceFields = z.infer<typeof UploadInvoiceFields>;

export const UpdateInvoicePaymentInput = z
  .object({ status: z.enum(PAYMENT_STATUSES), method: z.enum(PAYMENT_METHODS).optional() })
  .refine((value) => value.status !== "PAID" || value.method !== undefined, { path: ["method"], message: "Bitte angeben, wie bezahlt wurde." });
export type UpdateInvoicePaymentInput = z.input<typeof UpdateInvoicePaymentInput>;

export interface AdminInvoiceRow {
  id: string;
  type: InvoiceType;
  number: string;
  /** `deleted`: Kunde hat sein Konto gelöscht – der Beleg wird bis `retainUntil` aufbewahrt. */
  customer: { id: string; customerNumber: string; name: string; deleted?: boolean };
  retainUntil?: string;
  shipment?: { id: string; shipmentNumber: string };
  netCents: number;
  vatCents: number;
  grossCents: number;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  paymentStatus?: EffectivePaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  fileName: string;
  /** GENERATED = im Portal erstellte E-Rechnung (unveränderbar, XML-Download), UPLOAD = PDF aus der Buchhaltung. */
  source: InvoiceSource;
  /** Zuletzt per E-Mail (mit PDF im Anhang) an den Kunden gesendet. */
  emailedAt?: string;
  emailedTo?: string;
  /** Höchste gesendete Mahnstufe (1 = Zahlungserinnerung, 2 = 1. Mahnung, 3 = 2. Mahnung). */
  reminderLevel?: 1 | 2 | 3;
  lastReminderAt?: string;
  createdAt: string;
}

/** Kennzahlen der Rechnungsliste – Belege gelöschter Kunden zählen mit (sie bleiben aufbewahrt). */
export interface AdminInvoiceStats {
  openCount: number;
  openGrossCents: number;
  overdueCount: number;
  overdueGrossCents: number;
  /** Einnahmen = bezahlte Rechnungen nach Zahlungsdatum (deutsche Zeit), brutto und netto. */
  paidThisMonthGrossCents: number;
  paidThisMonthNetCents: number;
  paidThisMonthCount: number;
  paidThisYearGrossCents: number;
  paidThisYearNetCents: number;
  paidTotalGrossCents: number;
  paidTotalNetCents: number;
}

export interface AdminInvoiceList {
  invoices: AdminInvoiceRow[];
  total: number;
  stats: AdminInvoiceStats;
}
