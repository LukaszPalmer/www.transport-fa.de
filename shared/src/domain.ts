/**
 * Domänen-Konstanten – einzige Quelle für Rollen, Status und Kategorien.
 * Backend (Mongoose-Enums, Validierung) und Frontend (Badges, Filter, Formulare)
 * importieren von hier, damit beide Seiten nie auseinanderlaufen.
 */

// --- Identität & Zugriff ----------------------------------------------------

export const ROLES = ["CUSTOMER", "ADMIN", "DRIVER"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATES = ["ACTIVE", "DISABLED", "PENDING_DELETION"] as const;
export type UserState = (typeof USER_STATES)[number];

export const AUTH_TOKEN_TYPES = ["EMAIL_VERIFICATION", "PASSWORD_RESET"] as const;
export type AuthTokenType = (typeof AUTH_TOKEN_TYPES)[number];

export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];

// --- Kunden & Mitarbeiter ---------------------------------------------------

export const CUSTOMER_TYPES = ["PRIVATE", "BUSINESS"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const ACCOUNT_STATES = ["ACTIVE", "SUSPENDED", "PENDING_DELETION"] as const;
export type AccountState = (typeof ACCOUNT_STATES)[number];

export const PRESENCE_STATES = ["ONLINE", "OFFLINE"] as const;
export type PresenceState = (typeof PRESENCE_STATES)[number];

// --- Aufträge & Sendungen ---------------------------------------------------

/** Deckungsgleich mit den Leistungsseiten der Website (frontend/src/content/services.ts). */
export const SERVICE_SLUGS = ["umzuege", "entruempelungen", "haushaltsaufloesungen", "transport-logistik"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const SHIPMENT_STATUSES = [
  "PLANNED",
  "ASSIGNED",
  "EN_ROUTE_TO_PICKUP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

/** Nur in diesen Status sieht der Kunde die Live-Position – der LKW fährt dann für ihn. */
export const TRACKABLE_STATUSES: readonly ShipmentStatus[] = ["EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];

/** GPS-Verlauf wird nach dieser Frist automatisch gelöscht (TTL). */
export const LOCATION_HISTORY_DAYS = 30;

// --- Dokumente & Belege -----------------------------------------------------

export const DOCUMENT_CATEGORIES = [
  "CUSTOMS", // Zolldokumente
  "TRANSPORT", // CMR, Lieferschein, Ladeliste
  "PROOF_OF_DELIVERY",
  "INVOICE",
  "OFFER",
  "ORDER_CONFIRMATION",
  "CREDIT_NOTE",
  "CHAT_ATTACHMENT",
  "OTHER",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_VISIBILITIES = ["CUSTOMER", "INTERNAL"] as const;
export type DocumentVisibility = (typeof DOCUMENT_VISIBILITIES)[number];

export const UPLOAD_STATES = ["PENDING_UPLOAD", "READY"] as const;
export type UploadState = (typeof UPLOAD_STATES)[number];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const INVOICE_TYPES = ["INVOICE", "OFFER", "ORDER_CONFIRMATION", "CREDIT_NOTE"] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];

/** Gespeicherter Zahlstatus. OVERDUE wird abgeleitet (siehe effectivePaymentStatus). */
export const PAYMENT_STATUSES = ["PENDING", "PAID", "CANCELLED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type EffectivePaymentStatus = PaymentStatus | "OVERDUE";

/** PENDING + Fälligkeit überschritten → OVERDUE. Nie veraltet, kein Cronjob nötig. */
export function effectivePaymentStatus(
  paymentStatus: PaymentStatus | undefined,
  dueDate: Date | string | undefined,
  now: Date = new Date(),
): EffectivePaymentStatus | undefined {
  if (paymentStatus === "PENDING" && dueDate && new Date(dueDate) < now) return "OVERDUE";
  return paymentStatus;
}

// --- Chat -------------------------------------------------------------------

export const CHAT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
export type ChatStatus = (typeof CHAT_STATUSES)[number];

export const CHAT_SENDER_ROLES = ["CUSTOMER", "ADMIN", "SYSTEM"] as const;
export type ChatSenderRole = (typeof CHAT_SENDER_ROLES)[number];

export const CHAT_MESSAGE_MAX_LENGTH = 4000;

// --- E-Mail -----------------------------------------------------------------

export const EMAIL_TYPES = [
  "VERIFICATION",
  "PASSWORD_RESET",
  "ACCOUNT_DELETED",
  "DOCUMENT_SHARED",
  "INVOICE_ISSUED",
  "SHIPMENT_UPDATE",
  "CHAT_REPLY",
  "MANUAL",
] as const;
export type EmailType = (typeof EMAIL_TYPES)[number];

/** Enthalten Token-Links → Inhalt wird nie gespeichert und dem Kunden nicht angezeigt. */
export const SENSITIVE_EMAIL_TYPES: readonly EmailType[] = ["VERIFICATION", "PASSWORD_RESET"];

export const EMAIL_STATUSES = ["QUEUED", "SENT", "DELIVERED", "BOUNCED", "FAILED"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

export const EMAIL_PROVIDERS = ["resend", "smtp", "console"] as const;
export type EmailProvider = (typeof EMAIL_PROVIDERS)[number];
