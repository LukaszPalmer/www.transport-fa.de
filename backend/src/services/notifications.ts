import { DEFAULT_NOTIFICATION_PREFERENCES, type NotificationTopic, type ShipmentStatus } from "@fa/shared";
import type { Types } from "mongoose";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { sendMail } from "../mail/mailer";
import { chatReplyMail, shipmentUpdateMail } from "../mail/templates";
import { CustomerProfile, DriverProfile, Shipment, User } from "../models";

/**
 * E-Mail-Benachrichtigungen an Kunden – nur, wenn das Thema in den Einstellungen
 * aktiviert ist. Läuft im Hintergrund und bricht nie die auslösende Aktion ab.
 */

const SHIPMENT_MESSAGES: Partial<Record<ShipmentStatus, { headline: string; message: string }>> = {
  ASSIGNED: { headline: "Fahrer zugewiesen", message: "Für Ihren Auftrag ist jetzt ein Fahrer eingeplant." },
  EN_ROUTE_TO_PICKUP: { headline: "Fahrer ist unterwegs", message: "Unser Fahrer ist auf dem Weg zur Abholung – Sie können ihn live verfolgen." },
  IN_TRANSIT: { headline: "Ware ist unterwegs", message: "Ihre Ware wurde abgeholt und ist auf dem Weg zum Ziel." },
  DELIVERED: { headline: "Zugestellt", message: "Ihr Auftrag wurde erfolgreich zugestellt. Vielen Dank für Ihr Vertrauen!" },
};

async function recipient(customerId: Types.ObjectId, topic: NotificationTopic) {
  const profile = await CustomerProfile.findById(customerId).select("userId firstName notifications").lean();
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
  const content = SHIPMENT_MESSAGES[status];
  if (!content) return;
  void (async () => {
    const shipment = await Shipment.findById(shipmentId).select("customerId shipmentNumber pickup delivery driverId").lean();
    if (!shipment) return;
    const target = await recipient(shipment.customerId, "shipmentUpdates");
    if (!target) return;
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
      }),
    });
  })().catch((error: unknown) => logger.error({ err: error }, "Status-Benachrichtigung fehlgeschlagen"));
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
      }),
    });
  })().catch((error: unknown) => logger.error({ err: error }, "Chat-Benachrichtigung fehlgeschlagen"));
}
