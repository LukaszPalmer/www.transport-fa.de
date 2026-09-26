import { z } from "zod";
import type { CustomerSummary } from "./auth";
import type {
  DocumentCategory,
  EffectivePaymentStatus,
  InvoiceType,
  ServiceSlug,
  ShipmentStatus,
} from "./domain";

/** Antwort von GET /api/v1/portal/overview – alles für die Übersichtsseite in einer Anfrage. */
export interface PortalOverview {
  customer: CustomerSummary;
  stats: {
    activeShipments: number;
    openInvoices: number;
    openInvoicesGrossCents: number;
    overdueInvoices: number;
    documents: number;
  };
  activeShipments: ShipmentSummary[];
  openInvoices: InvoiceSummary[];
  recentDocuments: DocumentSummary[];
}

export interface ShipmentSummary {
  id: string;
  shipmentNumber: string;
  status: ShipmentStatus;
  service: ServiceSlug;
  pickupCity: string;
  deliveryCity: string;
  plannedPickupAt?: string;
  plannedDeliveryAt?: string;
  etaAt?: string;
  /** Nur sichtbar, sobald ein Fahrer zugewiesen ist. */
  driver?: { firstName: string; lastName: string; phone: string };
}

export interface InvoiceSummary {
  id: string;
  type: InvoiceType;
  number: string;
  grossCents: number;
  issueDate: string;
  dueDate?: string;
  paymentStatus?: EffectivePaymentStatus;
}

export interface DocumentSummary {
  id: string;
  title: string;
  category: DocumentCategory;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

// --- Dokumente -------------------------------------------------------------------

/** Kategorien, die Kunden selbst hochladen dürfen. Belege (Rechnung, Angebot …) stellt nur das Büro ein. */
export const CUSTOMER_UPLOAD_CATEGORIES = ["CUSTOMS", "TRANSPORT", "OTHER"] as const satisfies readonly DocumentCategory[];

/** Erlaubte Dateitypen (per Dateisignatur geprüft, nicht nur per Endung). */
export const UPLOAD_FILE_TYPES = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
} as const;
export type UploadMimeType = keyof typeof UPLOAD_FILE_TYPES;
export const UPLOAD_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/jpeg,image/png,image/webp,image/heic";

export const DocumentUploadFields = z.object({
  title: z.string({ error: "Bitte geben Sie eine Bezeichnung ein." }).trim().min(1, "Bitte geben Sie eine Bezeichnung ein.").max(200),
  category: z.enum(CUSTOMER_UPLOAD_CATEGORIES, { error: "Bitte wählen Sie eine Kategorie." }),
  shipmentId: z
    .string()
    .regex(/^[a-f0-9]{24}$/, "Ungültiger Auftrag.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  handToDriver: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});
export type DocumentUploadFields = z.infer<typeof DocumentUploadFields>;

export interface DocumentItem extends DocumentSummary {
  /** Wer hat es bereitgestellt – der Kunde selbst oder das Büro. */
  source: "CUSTOMER" | "OFFICE";
  handToDriver: boolean;
  shipmentId?: string;
  shipmentNumber?: string;
  /** Eigene Uploads darf der Kunde löschen, Unterlagen vom Büro nicht. */
  canDelete: boolean;
}

export interface DocumentListResponse {
  documents: DocumentItem[];
  /** Aufträge zur Auswahl beim Hochladen. */
  shipments: Array<{ id: string; shipmentNumber: string; label: string }>;
}

// --- Sendungsverfolgung ------------------------------------------------------------

export type LngLat = [lng: number, lat: number];

export interface ShipmentListResponse {
  active: ShipmentSummary[];
  past: ShipmentSummary[];
}

export interface StopView {
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  location?: LngLat;
}

/** Live-Daten – per Abfrage alle paar Sekunden aktualisiert. Position nur, solange der LKW für den Kunden fährt. */
export interface ShipmentLive {
  status: ShipmentStatus;
  trackable: boolean;
  position?: LngLat;
  positionAt?: string;
  distanceCoveredMeters?: number;
  etaAt?: string;
}

export interface ShipmentDetail extends ShipmentSummary {
  customerReference?: string;
  cargoDescription?: string;
  pickup: StopView;
  delivery: StopView;
  statusHistory: Array<{ status: ShipmentStatus; at: string }>;
  vehicle?: { plate: string; label?: string };
  route?: { polyline: string; distanceMeters: number; durationSeconds: number };
  live: ShipmentLive;
  documents: DocumentItem[];
}

// --- Konto löschen ------------------------------------------------------------------

export const ACCOUNT_DELETE_CONFIRMATION = "LÖSCHEN";

export function isDeleteConfirmation(value: string): boolean {
  const normalized = value.normalize("NFC").trim().toUpperCase();
  return normalized === ACCOUNT_DELETE_CONFIRMATION || normalized === "LOESCHEN";
}

export const DeleteAccountInput = z.object({
  password: z.string().max(128).optional(),
  /** Tolerant: Groß-/Kleinschreibung, „OE" statt „Ö" und unterschiedliche Unicode-Schreibweisen des Ö. */
  confirmation: z
    .string({ error: `Bitte geben Sie zur Bestätigung „${ACCOUNT_DELETE_CONFIRMATION}" ein.` })
    .refine((value) => isDeleteConfirmation(value), `Bitte geben Sie zur Bestätigung „${ACCOUNT_DELETE_CONFIRMATION}" ein.`),
});
export type DeleteAccountInput = z.infer<typeof DeleteAccountInput>;
