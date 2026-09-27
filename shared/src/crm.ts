import { z } from "zod";
import { EmailSchema } from "./auth";
import { SERVICE_SLUGS, type InvoiceType, type ServiceSlug, type ShipmentStatus } from "./domain";

/**
 * CRM im Admin-Bereich: Anfragen (Leads) mit Pipeline, erweiterte Übersicht, Aktivitätsprotokoll,
 * Kundennotizen und Mitarbeiter-Löschung.
 */

const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Ungültige ID.");

// --- Anfragen (Leads) --------------------------------------------------------------------

/** Pipeline einer Anfrage – vom Eingang bis zum Auftrag (oder Absage). */
export const LEAD_STATUSES = ["NEW", "CONTACTED", "OFFER_SENT", "WON", "LOST"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_INFO: Record<LeadStatus, { label: string; description: string }> = {
  NEW: { label: "Neu", description: "Noch nicht bearbeitet" },
  CONTACTED: { label: "Kontaktiert", description: "Rückruf, E-Mail oder Besichtigung vereinbart" },
  OFFER_SENT: { label: "Angebot gesendet", description: "Wartet auf Zusage des Kunden" },
  WON: { label: "Gewonnen", description: "Auftrag erteilt" },
  LOST: { label: "Verloren", description: "Abgesagt oder keine Rückmeldung" },
};

export const LEAD_SOURCES = ["WEBSITE", "PHONE", "EMAIL", "MYHAMMER", "REFERRAL", "OTHER"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  WEBSITE: "Website",
  PHONE: "Telefon",
  EMAIL: "E-Mail",
  MYHAMMER: "MyHammer",
  REFERRAL: "Empfehlung",
  OTHER: "Sonstiges",
};

/** Themen des Kontaktformulars: die Leistungen plus Empfehlungsprogramm und „Sonstiges". */
export const LEAD_TOPICS = [...SERVICE_SLUGS, "empfehlung", "sonstiges"] as const;
export type LeadTopic = (typeof LEAD_TOPICS)[number];

/** Anfragen ohne Auftrag werden nach 6 Monaten ohne Aktivität gelöscht (Datenschutzerklärung). */
export const LEAD_RETENTION_DAYS = 183;
/** Gewonnene Anfragen bleiben 3 Jahre (regelmäßige Verjährungsfrist) nachvollziehbar. */
export const LEAD_WON_RETENTION_DAYS = 3 * 365;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximal ${max} Zeichen.`)
    .optional()
    .transform((value) => value || undefined);

/** Eingang vom Kontaktformular (Server Action → API) oder manuelle Erfassung im Admin. */
export const CreateLeadInput = z.object({
  topic: z.enum(LEAD_TOPICS, { error: "Bitte wählen Sie ein Thema." }),
  source: z.enum(LEAD_SOURCES).default("WEBSITE"),
  name: z.string({ error: "Bitte geben Sie einen Namen an." }).trim().min(2, "Bitte geben Sie einen Namen an.").max(100),
  company: optionalText(120),
  email: EmailSchema.optional().or(z.literal("").transform(() => undefined)),
  phone: optionalText(40),
  from: optionalText(160),
  to: optionalText(160),
  preferredDate: optionalText(40),
  message: z.string().trim().max(4000).default(""),
  callback: z.boolean().default(false),
  locale: z.enum(["de", "en"]).default("de"),
});
export type CreateLeadInput = z.input<typeof CreateLeadInput>;

export const UpdateLeadInput = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  assignedToId: objectId.nullable().optional(),
  customerId: objectId.nullable().optional(),
  followUpAt: z.iso.date().nullable().optional(),
  estimatedValueCents: z.number().int().min(0).max(1_000_000_000).nullable().optional(),
  lostReason: z.string().trim().max(300).nullable().optional(),
});
export type UpdateLeadInput = z.input<typeof UpdateLeadInput>;

export const LeadNoteInput = z.object({
  body: z.string({ error: "Bitte eine Notiz eingeben." }).trim().min(1, "Bitte eine Notiz eingeben.").max(2000, "Maximal 2000 Zeichen."),
});

export interface AdminLeadRow {
  id: string;
  number: string;
  status: LeadStatus;
  source: LeadSource;
  topic: LeadTopic;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  callback: boolean;
  route?: string;
  preferredDate?: string;
  messagePreview: string;
  assignedTo?: { id: string; name: string };
  customer?: { id: string; customerNumber: string; name: string };
  followUpAt?: string;
  estimatedValueCents?: number;
  createdAt: string;
  statusChangedAt: string;
}

export interface AdminLeadDetail extends AdminLeadRow {
  message: string;
  from?: string;
  to?: string;
  lostReason?: string;
  locale: "de" | "en";
  notes: Array<{ id: string; body: string; author?: string; createdAt: string }>;
  expiresAt?: string;
}

export interface AdminLeadList {
  leads: AdminLeadRow[];
  total: number;
  /** Anzahl je Status (für die Pipeline-Reiter) plus überfällige Wiedervorlagen. */
  counts: Record<LeadStatus, number> & { followUpDue: number };
  /** Summe der geschätzten Auftragswerte offener Anfragen. */
  pipelineValueCents: number;
}

// --- Übersicht ---------------------------------------------------------------------------

export interface AdminDashboard {
  stats: {
    customers: number;
    customersOnline: number;
    newCustomersThisMonth: number;
    activeShipments: number;
    unassignedShipments: number;
    openChats: number;
    unreadChats: number;
    newLeads: number;
    followUpsDue: number;
  };
  /** Nur mit Recht „Rechnungen & Belege" bzw. „Buchhaltung". */
  finance?: {
    paidThisMonthGrossCents: number;
    paidThisYearGrossCents: number;
    paidTotalGrossCents: number;
    openGrossCents: number;
    overdueCount: number;
    overdueGrossCents: number;
    /** Letzte 12 Monate: Rechnungsbetrag (Rechnungsdatum) und Zahlungseingang, brutto. */
    months: Array<{ month: string; invoicedGrossCents: number; paidGrossCents: number }>;
  };
  /** Aufträge mit Abholung heute oder in den nächsten 7 Tagen. */
  upcoming: Array<{
    id: string;
    shipmentNumber: string;
    status: ShipmentStatus;
    service: ServiceSlug;
    customerName: string;
    route: string;
    plannedPickupAt: string;
    driverName?: string;
  }>;
  /** Neueste Anfragen (Recht „Anfragen bearbeiten"). */
  recentLeads: Array<{ id: string; number: string; name: string; topic: LeadTopic; status: LeadStatus; createdAt: string }>;
  /** Letzte Aktivitäten im Team (nur Administratoren). */
  activity?: AdminActivityItem[];
}

// --- Aktivitätsprotokoll -----------------------------------------------------------------

export interface AdminActivityItem {
  id: string;
  action: string;
  label: string;
  actor?: string;
  target?: string;
  customer?: { id: string; name: string };
  ip?: string;
  createdAt: string;
}

export interface AdminActivityList {
  items: AdminActivityItem[];
  total: number;
  /** Vorhandene Aktionsgruppen für den Filter. */
  groups: Array<{ value: string; label: string }>;
}

// --- Kundenakte ----------------------------------------------------------------------------

export const UpdateCustomerCrmInput = z.object({
  internalNotes: z.string().max(5000, "Maximal 5000 Zeichen.").optional(),
  accountManagerId: objectId.nullable().optional(),
});
export type UpdateCustomerCrmInput = z.input<typeof UpdateCustomerCrmInput>;

// --- Team ---------------------------------------------------------------------------------

/** Endgültiges Löschen eines Mitarbeiters: eigenes Passwort + Eingabe der E-Mail des Mitarbeiters. */
export const DeleteStaffInput = z.object({
  password: z.string({ error: "Bitte geben Sie Ihr Passwort ein." }).min(1, "Bitte geben Sie Ihr Passwort ein.").max(128),
  confirmEmail: z.string().trim().toLowerCase(),
});

// --- Zahlungserinnerung ---------------------------------------------------------------------

export const PAYMENT_REMINDER_LEVELS = [1, 2, 3] as const;
export const PAYMENT_REMINDER_LABEL: Record<(typeof PAYMENT_REMINDER_LEVELS)[number], string> = {
  1: "Zahlungserinnerung",
  2: "1. Mahnung",
  3: "2. Mahnung",
};

export interface PaymentReminderResult {
  level: 1 | 2 | 3;
  sentTo: string;
  sentAt: string;
}

/** Belegarten, die als Buchung zählen (Angebote und Auftragsbestätigungen nicht). */
export const BOOKABLE_INVOICE_TYPES: readonly InvoiceType[] = ["INVOICE", "CREDIT_NOTE"];
