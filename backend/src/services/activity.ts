import type { AdminActivityItem } from "@fa/shared";
import { CustomerProfile, StaffProfile, User, type IAuditLog } from "../models";

/**
 * Aktivitätsprotokoll für Administratoren: lesbare Bezeichnungen der Audit-Ereignisse,
 * aufgelöste Namen von Mitarbeitern und Kunden.
 */

export const ACTIVITY_LABELS: Record<string, string> = {
  "auth.login": "Anmeldung",
  "auth.login_failed": "Fehlgeschlagene Anmeldung",
  "auth.account_locked": "Konto nach Fehlversuchen gesperrt",
  "auth.logout": "Abmeldung",
  "auth.registered": "Neues Kundenkonto",
  "auth.email_verified": "E-Mail-Adresse bestätigt",
  "auth.password_reset_requested": "Passwort-Zurücksetzen angefordert",
  "auth.password_reset": "Passwort zurückgesetzt",
  "auth.google_failed": "Google-Anmeldung fehlgeschlagen",
  "auth.mfa_enabled": "2FA eingerichtet",
  "auth.mfa_verified": "2FA-Code bestätigt",
  "auth.mfa_failed": "Falscher 2FA-Code",
  "account.profile_updated": "Kundenprofil geändert",
  "account.email_changed": "E-Mail-Adresse geändert",
  "account.password_changed": "Passwort geändert",
  "account.password_change_failed": "Passwortänderung fehlgeschlagen",
  "admin.customer_viewed": "Kundenakte geöffnet",
  "admin.customer_updated": "Kundenakte bearbeitet",
  "admin.credentials_changed": "Zugangsdaten neu gesetzt",
  "admin.staff_created": "Mitarbeiter angelegt",
  "admin.staff_updated": "Mitarbeiter geändert",
  "admin.staff_deleted": "Mitarbeiter gelöscht",
  "document.uploaded": "Dokument hochgeladen",
  "document.deleted": "Dokument gelöscht",
  "document.opened_by_staff": "Dokument geöffnet",
  "shipment.created": "Auftrag angelegt",
  "shipment.status_changed": "Auftragsstatus geändert",
  "shipment.driver_assigned": "Fahrer zugewiesen",
  "shipment.driver_unassigned": "Fahrer entfernt",
  "invoice.issued": "Beleg gesendet",
  "invoice.payment_updated": "Zahlstatus geändert",
  "invoice.deleted": "Beleg zurückgezogen",
  "invoice.emailed": "Rechnung erneut per E-Mail",
  "invoice.reminder_sent": "Zahlungserinnerung/Mahnung gesendet",
  "invoice_draft.created": "Rechnungsentwurf angelegt",
  "invoice_draft.deleted": "Rechnungsentwurf gelöscht",
  "lead.created": "Anfrage erfasst",
  "lead.updated": "Anfrage bearbeitet",
  "lead.deleted": "Anfrage gelöscht",
  "accounting.exported": "Buchhaltungsexport",
  "accounting.settings_updated": "Buchhaltungs-Einstellungen geändert",
};

export const ACTIVITY_GROUPS: Array<{ value: string; label: string }> = [
  { value: "auth", label: "Anmeldungen & Sicherheit" },
  { value: "admin", label: "Team & Zugänge" },
  { value: "account", label: "Kundenkonten" },
  { value: "shipment", label: "Aufträge" },
  { value: "invoice", label: "Rechnungen" },
  { value: "lead", label: "Anfragen" },
  { value: "document", label: "Dokumente" },
  { value: "accounting", label: "Buchhaltung" },
];

export function activityLabel(action: string): string {
  return ACTIVITY_LABELS[action] ?? action;
}

type AuditLike = Pick<IAuditLog, "_id" | "action" | "actorId" | "targetId" | "targetType" | "customerId" | "ip" | "meta" | "createdAt">;

function metaSummary(entry: AuditLike): string | undefined {
  const meta = (entry.meta ?? {}) as Record<string, unknown>;
  if (typeof meta.number === "string") return meta.number;
  if (entry.action === "accounting.exported" && typeof meta.from === "string") return `${meta.kind ?? ""} ${meta.from} – ${meta.to}`.trim();
  if (entry.action === "shipment.status_changed" && typeof meta.status === "string") return meta.status;
  if (entry.action === "invoice.payment_updated" && typeof meta.status === "string") return meta.status;
  return undefined;
}

export async function toActivityItems(entries: AuditLike[]): Promise<AdminActivityItem[]> {
  const userIds = [...new Set(entries.flatMap((entry) => [entry.actorId, entry.targetType === "User" ? entry.targetId : undefined]).filter(Boolean).map(String))];
  const customerIds = [...new Set(entries.flatMap((entry) => (entry.customerId ? [String(entry.customerId)] : [])))];
  const [users, staff, customers] = await Promise.all([
    userIds.length ? User.find({ _id: { $in: userIds } }).select("name email role").lean() : [],
    userIds.length ? StaffProfile.find({ userId: { $in: userIds } }).select("userId displayName").lean() : [],
    customerIds.length ? CustomerProfile.find({ _id: { $in: customerIds } }).select("customerNumber firstName lastName companyName").lean() : [],
  ]);
  const staffName = new Map(staff.map((profile) => [String(profile.userId), profile.displayName]));
  const userName = new Map(users.map((user) => [String(user._id), staffName.get(String(user._id)) ?? user.name]));
  const customerName = new Map(customers.map((customer) => [String(customer._id), `${customer.companyName || `${customer.firstName} ${customer.lastName}`} (${customer.customerNumber})`]));

  return entries.map((entry) => ({
    id: String(entry._id),
    action: entry.action,
    label: activityLabel(entry.action),
    actor: entry.actorId ? userName.get(String(entry.actorId)) : undefined,
    target: metaSummary(entry) ?? (entry.targetType === "User" && entry.targetId && String(entry.targetId) !== String(entry.actorId) ? userName.get(String(entry.targetId)) : undefined),
    customer: entry.customerId && customerName.has(String(entry.customerId)) ? { id: String(entry.customerId), name: customerName.get(String(entry.customerId))! } : undefined,
    ip: entry.ip,
    createdAt: entry.createdAt.toISOString(),
  }));
}
