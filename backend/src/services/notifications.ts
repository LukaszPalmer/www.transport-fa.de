import { DEFAULT_NOTIFICATION_PREFERENCES, type InvoiceType, type Locale, type NotificationTopic, type ShipmentStatus } from "@fa/shared";
import type { Types } from "mongoose";
import { env } from "../config/env";
import { mailFormats } from "../lib/locale";
import { logger } from "../lib/logger";
import { sendMail } from "../mail/mailer";
import { chatReplyMail, invoiceIssuedMail, shipmentUpdateMail } from "../mail/templates";
import { CustomerProfile, DriverProfile, Invoice, Shipment, User } from "../models";
import { INVOICE_TYPE_LABEL } from "./invoices";

/**
 * E-Mail-Benachrichtigungen an Kunden – nur, wenn das Thema in den Einstellungen
 * aktiviert ist. Läuft im Hintergrund und bricht nie die auslösende Aktion ab.
 */

type ShipmentMessage = { headline: string; message: string };

const SHIPMENT_MESSAGES: Record<Locale, Partial<Record<ShipmentStatus, ShipmentMessage>>> = {
  de: {
    ASSIGNED: { headline: "Fahrer zugewiesen", message: "Für Ihren Auftrag ist jetzt ein Fahrer eingeplant." },
    EN_ROUTE_TO_PICKUP: { headline: "Fahrer ist unterwegs", message: "Unser Fahrer ist auf dem Weg zur Abholung – Sie können ihn live verfolgen." },
    IN_TRANSIT: { headline: "Ware ist unterwegs", message: "Ihre Ware wurde abgeholt und ist auf dem Weg zum Ziel." },
    DELIVERED: { headline: "Auftrag abgeschlossen", message: "Ihr Auftrag wurde erfolgreich abgeschlossen. Vielen Dank für Ihr Vertrauen!" },
  },
  en: {
    ASSIGNED: { headline: "Driver assigned", message: "A driver has now been scheduled for your job." },
    EN_ROUTE_TO_PICKUP: { headline: "Driver on the way", message: "Our driver is on the way to the pickup – you can follow them live." },
    IN_TRANSIT: { headline: "Goods on the way", message: "Your goods have been picked up and are on the way to their destination." },
    DELIVERED: { headline: "Job completed", message: "Your job has been completed successfully. Thank you for your trust!" },
  },
};

/** Beleg- und Hinweistexte der Benachrichtigung „neuer Beleg“ je Sprache. */
const INVOICE_TEXT: Record<Locale, { type: Record<InvoiceType, string>; due: string; valid: string; paid: (method: string) => string; method: Record<"BANK_TRANSFER" | "CASH", string> }> = {
  de: {
    type: INVOICE_TYPE_LABEL,
    due: "Fällig am",
    valid: "Gültig bis",
    paid: (method) => `Bereits bezahlt (${method}) – vielen Dank!`,
    method: { BANK_TRANSFER: "per Überweisung", CASH: "bar" },
  },
  en: {
    type: { INVOICE: "invoice", OFFER: "quote", ORDER_CONFIRMATION: "order confirmation", CREDIT_NOTE: "credit note" },
    due: "Due on",
    valid: "Valid until",
    paid: (method) => `Already paid (${method}) – thank you!`,
    method: { BANK_TRANSFER: "by bank transfer", CASH: "in cash" },
  },
};

async function recipient(customerId: Types.ObjectId, topic: NotificationTopic) {
  const profile = await CustomerProfile.findById(customerId).select("userId firstName notifications locale").lean();
  if (!profile) return null;
  const enabled = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...profile.notifications }[topic];
  if (!enabled) return null;
  const user = await User.findById(profile.userId).select("email emailVerifiedAt state").lean();
  // Nur an bestätigte Adressen – sonst ginge Post an womöglich fremde Postfächer.
  if (!user?.emailVerifiedAt || user.state !== "ACTIVE") return null;
  return { profile, user };
}

const portalUrl = (path: string) => new URL(path, env.FRONTEND_URL).toString();

export function notifyShipmentUpdate(shipmentId: Types.ObjectId, status: ShipmentStatus): void {
  if (!SHIPMENT_MESSAGES.de[status]) return;
  void (async () => {
    const shipment = await Shipment.findById(shipmentId).select("customerId shipmentNumber pickup delivery driverId").lean();
    if (!shipment) return;
    const target = await recipient(shipment.customerId, "shipmentUpdates");
    if (!target) return;
    const locale = target.profile.locale ?? "de";
    const content = SHIPMENT_MESSAGES[locale][status];
    if (!content) return;
    const driver =
      shipment.driverId && status !== "DELIVERED"
        ? await DriverProfile.findById(shipment.driverId).select("firstName lastName phone vehicle").lean()
        : null;

    await sendMail({
      type: "SHIPMENT_UPDATE",
      to: target.user.email,
      userId: target.user._id,
      customerId: target.profile._id,
      ...shipmentUpdateMail({
        firstName: target.profile.firstName,
        shipmentNumber: shipment.shipmentNumber,
        route: `${shipment.pickup.address.city} → ${shipment.delivery.address.city}`,
        ...content,
        driver: driver ? { name: `${driver.firstName} ${driver.lastName}`, phone: driver.phone, plate: driver.vehicle?.plate } : undefined,
        url: portalUrl(`/kundenportal/tracking?sendung=${String(shipment._id)}`),
        settingsUrl: portalUrl("/kundenportal/einstellungen"),
        locale,
      }),
    });
  })().catch((error: unknown) => logger.error({ err: error }, "Status-Benachrichtigung fehlgeschlagen"));
}

/** Neuer Beleg im Kundenportal – mit Betrag und Fälligkeit, ohne Anhang (PDF liegt geschützt im Portal). */
export function notifyInvoiceIssued(invoiceId: Types.ObjectId): void {
  void (async () => {
    const invoice = await Invoice.findById(invoiceId).lean();
    if (!invoice) return;
    const target = await recipient(invoice.customerId, "invoices");
    if (!target) return;
    const shipment = invoice.shipmentId ? await Shipment.findById(invoice.shipmentId).select("shipmentNumber").lean() : null;
    const locale = target.profile.locale ?? "de";
    const text = INVOICE_TEXT[locale];
    const { euro, day } = mailFormats(locale);

    const deadline: [string, string] | undefined = invoice.dueDate
      ? [text.due, day(invoice.dueDate)]
      : invoice.validUntil
        ? [text.valid, day(invoice.validUntil)]
        : undefined;
    const paidNote = invoice.paymentStatus === "PAID" && invoice.paymentMethod ? text.paid(text.method[invoice.paymentMethod]) : undefined;

    await sendMail({
      type: "INVOICE_ISSUED",
      to: target.user.email,
      userId: target.user._id,
      customerId: target.profile._id,
      ...invoiceIssuedMail({
        firstName: target.profile.firstName,
        typeLabel: text.type[invoice.type],
        number: invoice.number,
        amount: euro(invoice.grossCents),
        deadline: paidNote ? undefined : deadline,
        paidNote,
        shipmentNumber: shipment?.shipmentNumber,
        url: portalUrl(`/kundenportal/rechnungen?beleg=${String(invoice._id)}`),
        settingsUrl: portalUrl("/kundenportal/einstellungen"),
        locale,
      }),
    });
  })().catch((error: unknown) => logger.error({ err: error }, "Beleg-Benachrichtigung fehlgeschlagen"));
}

/** Chat-Antwort, während der Kunde nicht verbunden ist. */
export function notifyChatReply(customerId: Types.ObjectId, staffName: string, body: string): void {
  void (async () => {
    const target = await recipient(customerId, "chatReplies");
    if (!target) return;
    const preview = body.length > 280 ? `${body.slice(0, 277)}…` : body;
    await sendMail({
      type: "CHAT_REPLY",
      to: target.user.email,
      userId: target.user._id,
      customerId: target.profile._id,
      ...chatReplyMail({
        firstName: target.profile.firstName,
        staffName,
        preview,
        url: portalUrl("/kundenportal?chat=1"),
        settingsUrl: portalUrl("/kundenportal/einstellungen"),
        locale: target.profile.locale,
      }),
    });
  })().catch((error: unknown) => logger.error({ err: error }, "Chat-Benachrichtigung fehlgeschlagen"));
}
