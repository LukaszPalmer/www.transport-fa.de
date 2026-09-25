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
