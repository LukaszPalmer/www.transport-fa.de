import mongoose, { type Types } from "mongoose";
import { emailKey } from "../auth/rate-limit";
import { logger } from "../lib/logger";
import { sendMail } from "../mail/mailer";
import { accountDeletedMail } from "../mail/templates";
import {
  AuditLog,
  AuthToken,
  ChatMessage,
  ChatSession,
  CustomerProfile,
  DocumentModel,
  EmailLog,
  Invoice,
  InvoiceDraft,
  LocationLog,
  RateLimit,
  Session,
  Shipment,
  User,
} from "../models";
import { customerPrefix, deletePrefix } from "../storage/r2";

/**
 * DSGVO-Löschung „als hätte es den Kunden nie gegeben":
 * 1. Konto sperren (PENDING_DELETION) + alle Sitzungen beenden
 * 2. Alle Dateien in R2 löschen (Präfix customers/<id>/)
 * 3. Alle Datensätze in einer Transaktion löschen
 * Schlägt etwas fehl, bleibt der Nutzer gesperrt und resumePendingDeletions()
 * holt den Rest nach – es bleibt nie ein halb gelöschtes, aber aktives Konto.
 *
 * GPS-Punkte gehören zum LKW, nicht zum Kunden: Sie verlieren nur den Bezug
 * zur Sendung und laufen nach 30 Tagen automatisch ab.
 */
export async function deleteCustomerAccount(userId: Types.ObjectId): Promise<void> {
  const user = await User.findByIdAndUpdate(userId, { state: "PENDING_DELETION" }, { returnDocument: "after" }).lean();
  if (!user) return;
  await Session.deleteMany({ userId });

  const profile = await CustomerProfile.findOne({ userId }).lean();
  const customerId = profile?._id;

  if (customerId) {
    const files = await deletePrefix(customerPrefix(String(customerId)));
    const shipmentIds = await Shipment.find({ customerId }).distinct("_id");
    if (shipmentIds.length > 0) {
      await LocationLog.updateMany({ "meta.shipmentId": { $in: shipmentIds } }, { $unset: { "meta.shipmentId": "" } });
    }
    logger.info({ files, shipments: shipmentIds.length }, "Kontolöschung: Dateien entfernt");
  }

  await mongoose.connection.transaction(async (session) => {
    if (customerId) {
      const chatIds = await ChatSession.find({ customerId }).session(session).distinct("_id");
      await ChatMessage.deleteMany({ sessionId: { $in: chatIds } }, { session });
      await ChatSession.deleteMany({ customerId }, { session });
      await DocumentModel.deleteMany({ customerId }, { session });
      await Invoice.deleteMany({ customerId }, { session });
      await InvoiceDraft.deleteMany({ customerId }, { session });
      await Shipment.deleteMany({ customerId }, { session });
      await CustomerProfile.deleteOne({ _id: customerId }, { session });
    }
    const personal = customerId ? [{ userId }, { customerId }] : [{ userId }];
    await EmailLog.deleteMany({ $or: [...personal, { to: user.email }] }, { session });
    await AuditLog.deleteMany({ $or: [{ actorId: userId }, { targetId: userId }, ...(customerId ? [{ customerId }] : [])] }, { session });
    await AuthToken.deleteMany({ userId }, { session });
    await Session.deleteMany({ userId }, { session });
    // Auch Zähler der Missbrauchsbremse (Schlüssel enthalten E-Mail-Hash bzw. Nutzer-ID)
    await RateLimit.deleteMany(
      {
        $or: [
          { _id: { $in: [emailKey("login", user.email), emailKey("forgot", user.email)] } },
          { _id: { $regex: `:user:${String(userId)}$` } },
        ],
      },
      { session },
    );
    await User.deleteOne({ _id: userId }, { session });
  });

  // Abschiedsbestätigung – bewusst ohne Eintrag im E-Mail-Protokoll (keine Spuren).
  const firstName = profile?.firstName ?? user.name.split(" ")[0] ?? "";
  await sendMail({ type: "ACCOUNT_DELETED", to: user.email, ...accountDeletedMail(firstName) }, { log: false });
}

/** Holt abgebrochene Löschungen nach (beim Start und stündlich). */
export async function resumePendingDeletions(): Promise<void> {
  const pending = await User.find({ state: "PENDING_DELETION" }).select("_id").lean();
  for (const { _id } of pending) {
    try {
      await deleteCustomerAccount(_id);
      logger.info("Offene Kontolöschung abgeschlossen");
    } catch (error) {
      logger.error({ err: error }, "Offene Kontolöschung fehlgeschlagen – nächster Versuch folgt");
    }
  }
}
