import { CHAT_AUTO_CLOSE_DAYS, CHAT_RETENTION_HOURS, type ChatMessageView, type ChatSessionView, type ChatStatus } from "@fa/shared";
import mongoose, { type Types } from "mongoose";
import { AppError } from "../http/errors";
import { logger } from "../lib/logger";
import { ChatMessage, ChatSession, CustomerProfile, StaffProfile, User, type IChatMessage, type IChatSession } from "../models";
import { isOnline } from "../realtime/presence";

/**
 * Chat-Logik unabhängig vom Transport (Socket.IO). Nachrichten sind idempotent
 * (clientMessageId), beendete Chats werden nach CHAT_RETENTION_HOURS gelöscht (TTL).
 *
 * Pro Nachricht genau zwei Datenbank-Operationen (Chat aktualisieren + Nachricht
 * speichern); Namen und Kundennummern kommen aus einem kurzlebigen Zwischenspeicher.
 */

const HISTORY_LIMIT = 200;
const PREVIEW_LENGTH = 140;
const HOUR = 60 * 60 * 1000;
const CACHE_TTL_MS = 60_000;

export const OPEN_STATUSES: ChatStatus[] = ["OPEN", "IN_PROGRESS"];

type SessionLean = Pick<
  IChatSession,
  | "_id"
  | "status"
  | "customerId"
  | "customerUserId"
  | "assignedToId"
  | "lastMessageAt"
  | "lastMessagePreview"
  | "unreadByStaff"
  | "unreadByCustomer"
  | "staffLastReadAt"
  | "customerLastReadAt"
  | "expiresAt"
>;

export type ChatCustomerInfo = ChatSessionView["customer"] & { firstName: string };

function preview(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > PREVIEW_LENGTH ? `${flat.slice(0, PREVIEW_LENGTH - 1)}…` : flat;
}

// --- Zwischenspeicher (Anzeigenamen, Kundendaten) ------------------------------------------

const staffNameCache = new Map<string, { name: string; at: number }>();
const customerCache = new Map<string, { info: ChatCustomerInfo; at: number }>();

async function staffNames(userIds: Types.ObjectId[]): Promise<Map<string, string>> {
  const now = Date.now();
  const result = new Map<string, string>();
  const missing: Types.ObjectId[] = [];
  for (const id of userIds) {
    const cached = staffNameCache.get(String(id));
    if (cached && now - cached.at < CACHE_TTL_MS) result.set(String(id), cached.name);
    else missing.push(id);
  }
  if (missing.length) {
    const profiles = await StaffProfile.find({ userId: { $in: missing } }).select("userId displayName").lean();
    for (const profile of profiles) {
      staffNameCache.set(String(profile.userId), { name: profile.displayName, at: now });
      result.set(String(profile.userId), profile.displayName);
    }
  }
  return result;
}

async function customerInfos(sessions: SessionLean[]): Promise<Map<string, ChatCustomerInfo>> {
  const now = Date.now();
  const result = new Map<string, ChatCustomerInfo>();
  const missing = new Map<string, SessionLean>();
  for (const session of sessions) {
    const cached = customerCache.get(String(session.customerId));
    if (cached && now - cached.at < CACHE_TTL_MS) result.set(String(session.customerId), cached.info);
    else missing.set(String(session.customerId), session);
  }
  if (missing.size) {
    const pending = [...missing.values()];
    const [profiles, users] = await Promise.all([
      CustomerProfile.find({ _id: { $in: pending.map((session) => session.customerId) } }).select("customerNumber firstName lastName companyName").lean(),
      User.find({ _id: { $in: pending.map((session) => session.customerUserId) } }).select("email").lean(),
    ]);
    const profileById = new Map(profiles.map((profile) => [String(profile._id), profile]));
    const emailByUser = new Map(users.map((user) => [String(user._id), user.email]));
    for (const session of pending) {
      const profile = profileById.get(String(session.customerId));
      const info: ChatCustomerInfo = {
        id: String(session.customerId),
        userId: String(session.customerUserId),
        customerNumber: profile?.customerNumber ?? "–",
        name: profile ? profile.companyName || `${profile.firstName} ${profile.lastName}` : "Gelöschter Kunde",
        firstName: profile?.firstName ?? "",
        email: emailByUser.get(String(session.customerUserId)) ?? "",
      };
      if (profile) customerCache.set(info.id, { info, at: now });
      result.set(info.id, info);
    }
  }
  return result;
}

/** Bekannte Kundendaten (z. B. aus der Socket-Anmeldung) vorab hinterlegen – spart Abfragen. */
export function rememberCustomer(info: ChatCustomerInfo): void {
  customerCache.set(info.id, { info, at: Date.now() });
}

export async function customerFirstName(session: SessionLean): Promise<string> {
  return (await customerInfos([session])).get(String(session.customerId))?.firstName ?? "";
}

// --- Darstellung --------------------------------------------------------------------------

export async function toSessionViews(sessions: SessionLean[]): Promise<ChatSessionView[]> {
  if (sessions.length === 0) return [];
  const [customers, names] = await Promise.all([
    customerInfos(sessions),
    staffNames(sessions.flatMap((session) => (session.assignedToId ? [session.assignedToId] : []))),
  ]);

  return sessions.map((session) => {
    const info = customers.get(String(session.customerId))!;
    return {
      id: String(session._id),
      status: session.status,
      customer: { id: info.id, userId: info.userId, customerNumber: info.customerNumber, name: info.name, email: info.email },
      assignedTo: session.assignedToId
        ? { id: String(session.assignedToId), name: names.get(String(session.assignedToId)) ?? "Team" }
        : undefined,
      lastMessageAt: session.lastMessageAt.toISOString(),
      lastMessagePreview: session.lastMessagePreview,
      unreadByStaff: session.unreadByStaff,
      unreadByCustomer: session.unreadByCustomer,
      customerOnline: isOnline(session.customerUserId),
      staffLastReadAt: session.staffLastReadAt?.toISOString(),
      customerLastReadAt: session.customerLastReadAt?.toISOString(),
      expiresAt: session.expiresAt?.toISOString(),
    };
  });
}

export async function toSessionView(session: SessionLean): Promise<ChatSessionView> {
  const [view] = await toSessionViews([session]);
  return view!;
}

export async function toMessageViews(messages: IChatMessage[], customerFirstName?: string): Promise<ChatMessageView[]> {
  const names = await staffNames(messages.flatMap((message) => (message.senderRole === "ADMIN" && message.senderId ? [message.senderId] : [])));
  return messages.map((message) => ({
    id: String(message._id),
    sessionId: String(message.sessionId),
    senderRole: message.senderRole,
    senderName:
      message.senderRole === "ADMIN"
        ? ((message.senderId ? names.get(String(message.senderId)) : undefined) ?? "Team")
        : message.senderRole === "CUSTOMER"
          ? customerFirstName
          : undefined,
    body: message.body,
    clientMessageId: message.clientMessageId,
    createdAt: message.createdAt.toISOString(),
  }));
}

// --- Abfragen -------------------------------------------------------------------------------

export async function loadHistory(sessionId: Types.ObjectId): Promise<IChatMessage[]> {
  const latest = await ChatMessage.find({ sessionId }).sort({ createdAt: -1 }).limit(HISTORY_LIMIT).lean();
  return latest.reverse();
}

/** Laufender Chat eines Kunden (höchstens einer ist offen – Unique-Index). */
export function findOpenSession(customerId: Types.ObjectId) {
  return ChatSession.findOne({ customerId, status: { $in: OPEN_STATUSES } }).lean();
}

export async function findSession(sessionId: string | Types.ObjectId) {
  const session = await ChatSession.findById(sessionId).lean();
  if (!session) throw AppError.notFound("Dieser Chat existiert nicht mehr.");
  return session;
}

/** Posteingang der Konsole: offene Chats zuerst, dann kürzlich beendete (bis zur Löschung). */
export async function deskSessions(): Promise<SessionLean[]> {
  return ChatSession.find({}).sort({ status: 1, lastMessageAt: -1 }).limit(150).lean();
}

// --- Nachrichten ------------------------------------------------------------------------------

function isDuplicateKey(error: unknown): boolean {
  return error instanceof mongoose.mongo.MongoServerError && error.code === 11000;
}

interface NewMessage {
  sessionId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: "CUSTOMER" | "ADMIN";
  clientMessageId: string;
  body: string;
  createdAt: Date;
}

/**
 * Speichert eine Nachricht genau einmal – ein erneutes Senden nach Verbindungsabbruch
 * (gleiche clientMessageId) liefert die bereits gespeicherte zurück.
 */
async function insertMessage(input: NewMessage): Promise<{ message: IChatMessage; duplicate: boolean }> {
  try {
    const message = await ChatMessage.create({ ...input, attachmentIds: [] });
    return { message: message.toObject(), duplicate: false };
  } catch (error) {
    if (isDuplicateKey(error)) {
      const existing = await ChatMessage.findOne({ sessionId: input.sessionId, clientMessageId: input.clientMessageId }).lean();
      if (existing) return { message: existing, duplicate: true };
    }
    throw error;
  }
}

interface SendResult {
  session: SessionLean;
  message: IChatMessage;
  duplicate: boolean;
}

/**
 * Kunde schreibt: laufenden Chat fortsetzen (knownSessionId aus der Verbindung spart
 * die Suche) oder neuen eröffnen. Erst der Chat, dann die Nachricht – so landet nie
 * eine Nachricht ohne Löschfrist in einem bereits beendeten Chat.
 */
export async function customerSend(
  customer: { customerId: Types.ObjectId; userId: Types.ObjectId },
  input: { clientMessageId: string; body: string },
  knownSessionId?: Types.ObjectId,
): Promise<SendResult> {
  const now = new Date();
  const update = { lastMessageAt: now, lastMessagePreview: preview(input.body), $inc: { unreadByStaff: 1 } };
  const open = { customerId: customer.customerId, status: { $in: OPEN_STATUSES } };

  let session = knownSessionId
    ? await ChatSession.findOneAndUpdate({ ...open, _id: knownSessionId }, update, { returnDocument: "after" }).lean()
    : null;
  session ??= await ChatSession.findOneAndUpdate(open, update, { returnDocument: "after" }).lean();
  if (!session) {
    try {
      session = (
        await ChatSession.create({
          customerId: customer.customerId,
          customerUserId: customer.userId,
          lastMessageAt: now,
          lastMessagePreview: update.lastMessagePreview,
          unreadByStaff: 1,
        })
      ).toObject();
    } catch (error) {
      // Zwei Tabs gleichzeitig: der zweite schreibt in den soeben eröffneten Chat.
      if (!isDuplicateKey(error)) throw error;
      session = await ChatSession.findOneAndUpdate(open, update, { returnDocument: "after" }).lean();
      if (!session) throw error;
    }
  }

  const result = await insertMessage({ sessionId: session._id, senderId: customer.userId, senderRole: "CUSTOMER", createdAt: now, ...input });
  if (result.duplicate) await ChatSession.updateOne({ _id: session._id, unreadByStaff: { $gt: 0 } }, { $inc: { unreadByStaff: -1 } });
  return { session, ...result };
}

/** Mitarbeiter antwortet. Ein beendeter Chat wird dabei wieder geöffnet (Löschfrist entfällt). */
export async function staffSend(staff: { userId: Types.ObjectId }, input: { sessionId: string; clientMessageId: string; body: string }): Promise<SendResult> {
  const now = new Date();
  const update = {
    status: "IN_PROGRESS" as const,
    lastMessageAt: now,
    lastMessagePreview: preview(input.body),
    // Wer antwortet, hat gelesen.
    unreadByStaff: 0,
    staffLastReadAt: now,
    $inc: { unreadByCustomer: 1 },
  };

  let session = await ChatSession.findOneAndUpdate({ _id: input.sessionId, status: { $in: OPEN_STATUSES } }, update, { returnDocument: "after" }).lean();
  if (!session) {
    const existing = await findSession(input.sessionId); // wirft, falls gelöscht
    await reopen(existing);
    session = await ChatSession.findOneAndUpdate({ _id: existing._id }, update, { returnDocument: "after" }).lean();
    if (!session) throw AppError.notFound("Dieser Chat existiert nicht mehr.");
  }
  if (!session.assignedToId) {
    await ChatSession.updateOne({ _id: session._id, assignedToId: { $exists: false } }, { assignedToId: staff.userId });
    session = { ...session, assignedToId: staff.userId };
  }

  const result = await insertMessage({
    sessionId: session._id,
    senderId: staff.userId,
    senderRole: "ADMIN",
    clientMessageId: input.clientMessageId,
    body: input.body,
    createdAt: now,
  });
  if (result.duplicate) await ChatSession.updateOne({ _id: session._id, unreadByCustomer: { $gt: 0 } }, { $inc: { unreadByCustomer: -1 } });
  return { session, ...result };
}

/** Gelesen markieren – nur, wenn es Ungelesenes gibt (eine Operation, sonst keine). */
export async function markRead(sessionId: Types.ObjectId, by: "CUSTOMER" | "STAFF"): Promise<{ session: SessionLean | null; at: Date }> {
  const at = new Date();
  const session =
    by === "CUSTOMER"
      ? await ChatSession.findOneAndUpdate({ _id: sessionId, unreadByCustomer: { $gt: 0 } }, { unreadByCustomer: 0, customerLastReadAt: at }, { returnDocument: "after" }).lean()
      : await ChatSession.findOneAndUpdate({ _id: sessionId, unreadByStaff: { $gt: 0 } }, { unreadByStaff: 0, staffLastReadAt: at }, { returnDocument: "after" }).lean();
  return { session, at };
}

// --- Status & Löschfrist ------------------------------------------------------------------------

/**
 * Chat beenden: Ab jetzt läuft die Löschfrist – MongoDB entfernt Chat und
 * Nachrichten nach CHAT_RETENTION_HOURS automatisch (TTL-Index auf expiresAt).
 */
export async function resolveSession(sessionId: Types.ObjectId, byUserId?: Types.ObjectId): Promise<SessionLean | null> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CHAT_RETENTION_HOURS * HOUR);
  const session = await ChatSession.findOneAndUpdate(
    { _id: sessionId, status: { $ne: "RESOLVED" } },
    { status: "RESOLVED", resolvedAt: now, resolvedById: byUserId, expiresAt },
    { returnDocument: "after" },
  ).lean();
  if (session) await ChatMessage.updateMany({ sessionId }, { expiresAt });
  return session;
}

/** Beendeten Chat wieder öffnen – nur, solange der Kunde keinen neuen begonnen hat. */
async function reopen(session: SessionLean): Promise<void> {
  if (await ChatSession.exists({ customerId: session.customerId, status: { $in: OPEN_STATUSES }, _id: { $ne: session._id } })) {
    throw AppError.conflict("Der Kunde hat inzwischen einen neuen Chat begonnen – bitte dort antworten.");
  }
  await ChatSession.updateOne({ _id: session._id }, { status: "IN_PROGRESS", $unset: { expiresAt: 1, resolvedAt: 1, resolvedById: 1 } });
  await ChatMessage.updateMany({ sessionId: session._id }, { $unset: { expiresAt: 1 } });
}

export async function setStatus(sessionId: Types.ObjectId, status: ChatStatus, byUserId: Types.ObjectId): Promise<SessionLean | null> {
  if (status === "RESOLVED") return (await resolveSession(sessionId, byUserId)) ?? ChatSession.findById(sessionId).lean();
  const session = await ChatSession.findById(sessionId).lean();
  if (!session) return null;
  if (session.status === "RESOLVED") await reopen(session);
  return ChatSession.findByIdAndUpdate(sessionId, { status }, { returnDocument: "after" }).lean();
}

/**
 * Stündlicher Job: Chats ohne Aktivität seit CHAT_AUTO_CLOSE_DAYS werden beendet –
 * danach greift die 24-Stunden-Löschfrist. Liefert die beendeten Chats (für Live-Updates).
 */
export async function autoCloseInactiveChats(): Promise<SessionLean[]> {
  const cutoff = new Date(Date.now() - CHAT_AUTO_CLOSE_DAYS * 24 * HOUR);
  const stale = await ChatSession.find({ status: { $in: OPEN_STATUSES }, lastMessageAt: { $lt: cutoff } }).select("_id").lean();
  const closed: SessionLean[] = [];
  for (const { _id } of stale) {
    const session = await resolveSession(_id);
    if (session) closed.push(session);
  }
  if (closed.length) logger.info({ count: closed.length }, "Inaktive Chats automatisch beendet");
  return closed;
}
