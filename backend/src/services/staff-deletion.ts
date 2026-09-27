import mongoose, { type Types } from "mongoose";
import { revokeAllSessions } from "../auth/sessions";
import { emailKey } from "../auth/rate-limit";
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
  Lead,
  RateLimit,
  Session,
  Shipment,
  StaffProfile,
  User,
} from "../models";

/**
 * Mitarbeiter-Zugang endgültig löschen – „als hätte es ihn nie gegeben":
 * Konto, Profil, Sitzungen, Einmal-Links, Rate-Limit-Zähler, E-Mail-Protokoll und alle
 * Protokolleinträge von ihm und über ihn verschwinden.
 *
 * Was dem Unternehmen gehört, bleibt erhalten – nur ohne Personenbezug:
 * - Chat-Nachrichten an Kunden erscheinen danach als „Team" (Kundenverlauf bleibt vollständig).
 * - Rechnungen, Dokumente, Aufträge und Kunden verlieren nur den Verweis auf den Bearbeiter.
 * - Offene Rechnungsentwürfe und zugewiesene Anfragen übernimmt der löschende Administrator.
 */
export async function deleteStaffMember(userId: Types.ObjectId, takeoverById: Types.ObjectId): Promise<void> {
  const user = await User.findById(userId).select("email").lean();
  if (!user) return;

  // Zuerst aussperren: Sitzungen beenden, offene Socket-Verbindungen werden getrennt.
  await revokeAllSessions(userId);

  await mongoose.connection.transaction(async (session) => {
    const opts = { session };
    // Verweise in Unternehmensdaten lösen
    await ChatMessage.updateMany({ senderId: userId }, { $unset: { senderId: 1 } }, opts);
    await ChatSession.updateMany({ assignedToId: userId }, { $unset: { assignedToId: 1 } }, opts);
    await ChatSession.updateMany({ resolvedById: userId }, { $unset: { resolvedById: 1 } }, opts);
    await CustomerProfile.updateMany({ accountManagerId: userId }, { $unset: { accountManagerId: 1 } }, opts);
    await DocumentModel.updateMany({ uploadedById: userId }, { $unset: { uploadedById: 1 } }, opts);
    await Invoice.updateMany({ createdById: userId }, { $unset: { createdById: 1 } }, opts);
    await InvoiceDraft.updateMany({ createdById: userId }, { $set: { createdById: takeoverById } }, opts);
    await InvoiceDraft.updateMany({ updatedById: userId }, { $set: { updatedById: takeoverById } }, opts);
    await Lead.updateMany({ assignedToId: userId }, { $set: { assignedToId: takeoverById } }, opts);
    await Lead.updateMany({ "notes.authorId": userId }, { $unset: { "notes.$[note].authorId": 1 } }, { ...opts, arrayFilters: [{ "note.authorId": userId }] });
    await Shipment.updateMany(
      { "statusHistory.byUserId": userId },
      { $unset: { "statusHistory.$[entry].byUserId": 1 } },
      { ...opts, arrayFilters: [{ "entry.byUserId": userId }] },
    );
    await StaffProfile.updateMany({ createdById: userId }, { $unset: { createdById: 1 } }, opts);
    await EmailLog.updateMany({ sentById: userId }, { $unset: { sentById: 1 } }, opts);

    // Personenbezogenes löschen
    await EmailLog.deleteMany({ $or: [{ userId }, { to: user.email }] }, opts);
    await AuditLog.deleteMany({ $or: [{ actorId: userId }, { targetId: userId }] }, opts);
    await AuthToken.deleteMany({ userId }, opts);
    await Session.deleteMany({ userId }, opts);
    await RateLimit.deleteMany(
      {
        $or: [
          { _id: { $in: [emailKey("login", user.email), emailKey("forgot", user.email)] } },
          { _id: { $regex: `:user:${String(userId)}$` } },
        ],
      },
      opts,
    );
    await StaffProfile.deleteOne({ userId }, opts);
    await User.deleteOne({ _id: userId }, opts);
  });
}
