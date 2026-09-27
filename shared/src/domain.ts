/**
 * Domänen-Konstanten – einzige Quelle für Rollen, Status und Kategorien.
 * Backend (Mongoose-Enums, Validierung) und Frontend (Badges, Filter, Formulare)
 * importieren von hier, damit beide Seiten nie auseinanderlaufen.
 */

// --- Identität & Zugriff ----------------------------------------------------

export const ROLES = ["CUSTOMER", "EMPLOYEE", "ADMIN", "DRIVER"] as const;
export type Role = (typeof ROLES)[number];

/** Mitarbeiter mit Zugang zum Admin-Bereich (/admin). */
export const STAFF_ROLES = ["ADMIN", "EMPLOYEE"] as const satisfies readonly Role[];
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: Role): role is StaffRole {
  return (STAFF_ROLES as readonly Role[]).includes(role);
}

/**
 * Feingranulare Rechte für Mitarbeiter (EMPLOYEE). ADMIN hat immer alle Rechte
 * und darf zusätzlich Mitarbeiter anlegen und deren Rechte vergeben.
 */
export const PERMISSIONS = [
  "can_view_customers",
  "can_edit_customers",
  "can_manage_orders",
  "can_manage_drivers",
  "can_chat",
  "can_view_documents",
  "can_manage_invoices",
  "can_edit_credentials",
  "can_manage_leads",
  "can_manage_accounting",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_INFO: Record<Permission, { label: string; description: string }> = {
  can_view_customers: { label: "Kunden einsehen", description: "Kundenliste und 360°-Akte öffnen" },
  can_edit_customers: { label: "Kundendaten bearbeiten", description: "Name, Firma, Anschrift, Telefon und USt-IdNr. von Kunden ändern" },
  can_manage_orders: { label: "Aufträge verwalten", description: "Aufträge anlegen, Status ändern" },
  can_manage_drivers: { label: "Fahrer zuweisen", description: "Fahrer & LKW anlegen und Aufträgen zuweisen" },
  can_chat: { label: "Live-Chat", description: "Kundenanfragen im Chat beantworten" },
  can_view_documents: { label: "Dokumente einsehen", description: "Alle Kundendokumente öffnen und herunterladen" },
  can_manage_invoices: { label: "Rechnungen & Belege", description: "Angebote, Auftragsbestätigungen und Rechnungen senden, Zahlungen verbuchen" },
  can_edit_credentials: { label: "Zugangsdaten ändern", description: "E-Mail und Passwort von Kunden neu setzen" },
  can_manage_leads: { label: "Anfragen bearbeiten", description: "Anfragen aus dem Kontaktformular übernehmen, nachfassen und abschließen" },
  can_manage_accounting: { label: "Buchhaltung & Export", description: "Umsätze auswerten, DATEV-Export und Belegpaket für den Steuerberater" },
};

/** Rechte einer Rolle – ADMIN immer alle. */
export function effectivePermissions(role: Role, granted: readonly Permission[] = []): Permission[] {
  if (role === "ADMIN") return [...PERMISSIONS];
  if (role === "EMPLOYEE") return PERMISSIONS.filter((permission) => granted.includes(permission));
  return [];
}

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

/** E-Mail-Benachrichtigungen, die Kunden in den Einstellungen an- und abwählen. */
export const NOTIFICATION_TOPICS = ["shipmentUpdates", "documents", "invoices", "chatReplies"] as const;
export type NotificationTopic = (typeof NOTIFICATION_TOPICS)[number];
export type NotificationPreferences = Record<NotificationTopic, boolean>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  shipmentUpdates: true,
  documents: true,
  invoices: true,
  chatReplies: true,
};

export const NOTIFICATION_INFO: Record<NotificationTopic, { label: string; description: string }> = {
  shipmentUpdates: { label: "Auftragsstatus", description: "Fahrer zugewiesen, unterwegs, abgeschlossen" },
  documents: { label: "Neue Dokumente", description: "Wenn wir Unterlagen für Sie hinterlegen" },
  invoices: { label: "Rechnungen & Angebote", description: "Hinweise auf neue Belege im Portal – Rechnungen, die wir Ihnen per E-Mail senden, erhalten Sie unabhängig davon" },
  chatReplies: { label: "Chat-Antworten", description: "Antworten unseres Teams, wenn Sie offline sind" },
};

// --- Aufträge & Sendungen ---------------------------------------------------

/** Deckungsgleich mit den Leistungsseiten der Website (frontend/src/content/services.ts). */
export const SERVICE_SLUGS = ["umzuege", "entruempelungen", "haushaltsaufloesungen", "transport"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/** Frühere Slugs – Aufträge werden beim Start umgeschrieben, alte URLs leiten weiter. */
export const LEGACY_SERVICE_SLUGS: Record<string, ServiceSlug> = { "transport-logistik": "transport" };

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

/** Wie eine Rechnung beglichen wurde – das Büro verbucht es, der Kunde sieht es im Portal. */
export const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Herkunft eines Belegs: im Portal erstellte E-Rechnung oder PDF-Upload aus der Buchhaltung. */
export const INVOICE_SOURCES = ["GENERATED", "UPLOAD"] as const;
export type InvoiceSource = (typeof INVOICE_SOURCES)[number];

/**
 * Gesetzliche Aufbewahrungsfristen (§ 147 AO, § 257 HGB): Rechnungen und Gutschriften sind
 * Buchungsbelege (8 Jahre), Angebote und Auftragsbestätigungen Handelsbriefe (6 Jahre).
 * Die Frist beginnt mit dem Ende des Kalenderjahres, in dem der Beleg ausgestellt wurde.
 */
export const RETENTION_YEARS: Record<InvoiceType, number> = { INVOICE: 8, CREDIT_NOTE: 8, OFFER: 6, ORDER_CONFIRMATION: 6 };

/** Ende der Aufbewahrungsfrist: 31.12. des Ausstellungsjahres + Frist (Ende des Tages, deutsche Zeit). */
export function retentionEnd(type: InvoiceType, issueDate: Date | string): Date {
  const year = new Date(issueDate).getUTCFullYear() + RETENTION_YEARS[type];
  return new Date(`${year}-12-31T23:59:59.999+01:00`);
}

/** Nur Rechnungen haben einen Zahlstatus – Angebote, Auftragsbestätigungen und Gutschriften nicht. */
export function hasPaymentStatus(type: InvoiceType): boolean {
  return type === "INVOICE";
}

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

/** Beendete Chats (RESOLVED) werden nach dieser Frist samt Nachrichten automatisch gelöscht (TTL). */
export const CHAT_RETENTION_HOURS = 24;
/** Chats ohne Aktivität werden nach dieser Frist automatisch beendet – danach greift die Löschfrist. */
export const CHAT_AUTO_CLOSE_DAYS = 7;

// --- E-Mail -----------------------------------------------------------------

export const EMAIL_TYPES = [
  "WELCOME",
  "VERIFICATION",
  "PASSWORD_RESET",
  "ACCOUNT_DELETED",
  "SECURITY_NOTICE",
  "DOCUMENT_SHARED",
  "INVOICE_ISSUED",
  "SHIPMENT_UPDATE",
  "CHAT_REPLY",
  "PAYMENT_REMINDER",
  "ACCOUNTING_EXPORT",
  "MANUAL",
] as const;
export type EmailType = (typeof EMAIL_TYPES)[number];

/** Enthalten Token-Links → Inhalt wird nie gespeichert und dem Kunden nicht angezeigt. */
export const SENSITIVE_EMAIL_TYPES: readonly EmailType[] = ["VERIFICATION", "PASSWORD_RESET"];

export const EMAIL_STATUSES = ["QUEUED", "SENT", "DELIVERED", "BOUNCED", "FAILED"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

export const EMAIL_PROVIDERS = ["resend", "smtp", "console"] as const;
export type EmailProvider = (typeof EMAIL_PROVIDERS)[number];
