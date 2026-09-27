import type { DocumentCategory, EffectivePaymentStatus, InvoiceType, PaymentMethod, ShipmentStatus } from "@fa/shared";
import { intlLocale, type Locale } from "@/i18n/config";

/**
 * Anzeige-Texte und Formatierung für Kundenportal (Deutsch/Englisch) und Admin-Bereich (Deutsch).
 * Die bisherigen Exporte (shipmentStatus, formatDate …) liefern Deutsch – der Admin nutzt sie direkt;
 * das Portal holt sich über portalLabels(locale) bzw. den locale-Parameter die passende Sprache.
 */

export type BadgeTone = "neutral" | "info" | "progress" | "success" | "warning" | "danger";

interface PortalLabels {
  shipmentStatus: Record<ShipmentStatus, { label: string; tone: BadgeTone }>;
  paymentStatus: Record<EffectivePaymentStatus, { label: string; tone: BadgeTone }>;
  paymentMethodLabel: Record<PaymentMethod, string>;
  invoiceTypeLabel: Record<InvoiceType, string>;
  documentCategoryLabel: Record<DocumentCategory, string>;
}

const labels: Record<Locale, PortalLabels> = {
  de: {
    shipmentStatus: {
      PLANNED: { label: "Geplant", tone: "neutral" },
      ASSIGNED: { label: "Fahrer zugewiesen", tone: "info" },
      EN_ROUTE_TO_PICKUP: { label: "Unterwegs zur Abholung", tone: "progress" },
      IN_TRANSIT: { label: "Unterwegs zu Ihnen", tone: "progress" },
      DELIVERED: { label: "Abgeschlossen", tone: "success" },
      CANCELLED: { label: "Storniert", tone: "danger" },
    },
    paymentStatus: {
      PENDING: { label: "Offen", tone: "warning" },
      OVERDUE: { label: "Überfällig", tone: "danger" },
      PAID: { label: "Bezahlt", tone: "success" },
      CANCELLED: { label: "Storniert", tone: "neutral" },
    },
    paymentMethodLabel: { BANK_TRANSFER: "per Überweisung", CASH: "bar" },
    invoiceTypeLabel: { INVOICE: "Rechnung", OFFER: "Angebot", ORDER_CONFIRMATION: "Auftragsbestätigung", CREDIT_NOTE: "Gutschrift" },
    documentCategoryLabel: {
      CUSTOMS: "Zolldokument",
      TRANSPORT: "Transportpapier",
      PROOF_OF_DELIVERY: "Abliefernachweis",
      INVOICE: "Rechnung",
      OFFER: "Angebot",
      ORDER_CONFIRMATION: "Auftragsbestätigung",
      CREDIT_NOTE: "Gutschrift",
      CHAT_ATTACHMENT: "Chat-Anhang",
      OTHER: "Sonstiges",
    },
  },
  en: {
    shipmentStatus: {
      PLANNED: { label: "Planned", tone: "neutral" },
      ASSIGNED: { label: "Driver assigned", tone: "info" },
      EN_ROUTE_TO_PICKUP: { label: "On the way to pickup", tone: "progress" },
      IN_TRANSIT: { label: "On the way to you", tone: "progress" },
      DELIVERED: { label: "Completed", tone: "success" },
      CANCELLED: { label: "Cancelled", tone: "danger" },
    },
    paymentStatus: {
      PENDING: { label: "Open", tone: "warning" },
      OVERDUE: { label: "Overdue", tone: "danger" },
      PAID: { label: "Paid", tone: "success" },
      CANCELLED: { label: "Cancelled", tone: "neutral" },
    },
    paymentMethodLabel: { BANK_TRANSFER: "by bank transfer", CASH: "in cash" },
    invoiceTypeLabel: { INVOICE: "Invoice", OFFER: "Quote", ORDER_CONFIRMATION: "Order confirmation", CREDIT_NOTE: "Credit note" },
    documentCategoryLabel: {
      CUSTOMS: "Customs document",
      TRANSPORT: "Transport document",
      PROOF_OF_DELIVERY: "Proof of delivery",
      INVOICE: "Invoice",
      OFFER: "Quote",
      ORDER_CONFIRMATION: "Order confirmation",
      CREDIT_NOTE: "Credit note",
      CHAT_ATTACHMENT: "Chat attachment",
      OTHER: "Other",
    },
  },
};

export function portalLabels(locale: Locale): PortalLabels {
  return labels[locale];
}

// Deutsche Standard-Exporte (Admin-Bereich und bestehende Aufrufe)
export const shipmentStatus = labels.de.shipmentStatus;
export const paymentStatus = labels.de.paymentStatus;
export const paymentMethodLabel = labels.de.paymentMethodLabel;
export const invoiceTypeLabel = labels.de.invoiceTypeLabel;
export const documentCategoryLabel = labels.de.documentCategoryLabel;

const TIME_ZONE = "Europe/Berlin";

export const formatDate = (iso: string, locale: Locale = "de") =>
  new Intl.DateTimeFormat(intlLocale(locale), { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TIME_ZONE }).format(new Date(iso));

export const formatLongDate = (iso: string, locale: Locale = "de") =>
  new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE }).format(new Date(iso));

export function formatDateTime(iso: string, locale: Locale = "de"): string {
  const formatted = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
  return locale === "en" ? formatted : `${formatted} Uhr`;
}

/** Euro-Beträge: 1.234,56 € (Deutsch) bzw. €1,234.56 (Englisch). */
export const formatEuro = (cents: number, locale: Locale = "de") =>
  new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: "EUR" }).format(cents / 100);

export function formatFileSize(bytes: number, locale: Locale = "de"): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return `${locale === "en" ? mb : mb.replace(".", ",")} MB`;
}

const hourFormat = new Intl.DateTimeFormat("de-DE", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE });

/** Tageszeitabhängige Begrüßung (deutsche Zeit). */
export function greeting(now = new Date(), locale: Locale = "de"): string {
  // formatToParts statt format(): „de-DE" liefert sonst „2 Uhr" statt „2".
  const hour = Number(hourFormat.formatToParts(now).find((part) => part.type === "hour")?.value);
  if (hour >= 5 && hour < 11) return locale === "en" ? "Good morning" : "Guten Morgen";
  if (hour >= 11 && hour < 18) return locale === "en" ? "Good afternoon" : "Guten Tag";
  return locale === "en" ? "Good evening" : "Guten Abend";
}
