import type { DocumentCategory, EffectivePaymentStatus, InvoiceType, ShipmentStatus } from "@fa/shared";

/** Anzeige-Texte und Formatierung für das Kundenportal – eine Quelle für alle Seiten. */

export type BadgeTone = "neutral" | "info" | "progress" | "success" | "warning" | "danger";

export const shipmentStatus: Record<ShipmentStatus, { label: string; tone: BadgeTone }> = {
  PLANNED: { label: "Geplant", tone: "neutral" },
  ASSIGNED: { label: "Fahrer zugewiesen", tone: "info" },
  EN_ROUTE_TO_PICKUP: { label: "Unterwegs zur Abholung", tone: "progress" },
  IN_TRANSIT: { label: "Unterwegs zu Ihnen", tone: "progress" },
  DELIVERED: { label: "Zugestellt", tone: "success" },
  CANCELLED: { label: "Storniert", tone: "danger" },
};

export const paymentStatus: Record<EffectivePaymentStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: "Offen", tone: "warning" },
  OVERDUE: { label: "Überfällig", tone: "danger" },
  PAID: { label: "Bezahlt", tone: "success" },
  CANCELLED: { label: "Storniert", tone: "neutral" },
};

export const invoiceTypeLabel: Record<InvoiceType, string> = {
  INVOICE: "Rechnung",
  OFFER: "Angebot",
  ORDER_CONFIRMATION: "Auftragsbestätigung",
  CREDIT_NOTE: "Gutschrift",
};

export const documentCategoryLabel: Record<DocumentCategory, string> = {
  CUSTOMS: "Zolldokument",
  TRANSPORT: "Transportpapier",
  PROOF_OF_DELIVERY: "Abliefernachweis",
  INVOICE: "Rechnung",
  OFFER: "Angebot",
  ORDER_CONFIRMATION: "Auftragsbestätigung",
  CREDIT_NOTE: "Gutschrift",
  CHAT_ATTACHMENT: "Chat-Anhang",
  OTHER: "Sonstiges",
};

const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });
const longDateFormat = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" });
const dateTimeFormat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});
const euroFormat = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatLongDate = (iso: string) => longDateFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => `${dateTimeFormat.format(new Date(iso))} Uhr`;
export const formatEuro = (cents: number) => euroFormat.format(cents / 100);

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

const hourFormat = new Intl.DateTimeFormat("de-DE", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Berlin" });

/** Tageszeitabhängige Begrüßung (deutsche Zeit). */
export function greeting(now = new Date()): string {
  // formatToParts statt format(): „de-DE" liefert sonst „2 Uhr" statt „2".
  const hour = Number(hourFormat.formatToParts(now).find((part) => part.type === "hour")?.value);
  if (hour >= 5 && hour < 11) return "Guten Morgen";
  if (hour >= 11 && hour < 18) return "Guten Tag";
  return "Guten Abend";
}
