import type { Server as HttpServer } from "node:http";
import {
  CHAT_EVENTS,
  DeskSendInput,
  DeskSessionInput,
  DeskStatusInput,
  DeskTypingInput,
  isStaffRole,
  PresenceInput,
  SendMessageInput,
  TypingInput,
  type ChatAck,
  type ChatConnectErrorCode,
  type ChatSessionView,
  type CustomerChatState,
  type CustomerPresenceUpdate,
  type DeskSessionState,
  type Permission,
  type PresenceState,
  type ReadUpdate,
  type Role,
  type TypingUpdate,
} from "@fa/shared";
import { Types } from "mongoose";
import { Server, type Socket } from "socket.io";
import { z } from "zod";
import { SESSION_COOKIE } from "../auth/cookies";
import { loadStaffContext } from "../auth/middleware";
import { onSessionsRevoked, resolveSession } from "../auth/sessions";
import { allowedOrigins } from "../config/env";
import { AppError } from "../http/errors";
import { logger } from "../lib/logger";
import { ChatSession, CustomerProfile, StaffProfile, User } from "../models";
import {
  customerFirstName,
  customerSend,
  deskSessions,
  findOpenSession,
  findSession,
  loadHistory,
  markRead,
  rememberCustomer,
  setStatus,
  staffSend,
  toMessageViews,
  toSessionView,
  toSessionViews,
} from "../services/chat";
import { notifyChatReply } from "../services/notifications";
import { isOnline, trackConnect, trackDisconnect } from "./presence";

/**
 * Echtzeit-Server (Socket.IO) für Live-Chat und Online-Status.
 * - Anmeldung beim Verbindungsaufbau über das Sitzungs-Cookie (wie die REST-API)
 * - jedes Ereignis: Rate-Limit → Zod-Validierung → Handler → einheitliche Antwort (Ack)
 * - Fehler werden zentral abgefangen, protokolliert und als { ok: false } beantwortet
 */

interface SocketData {
  userId: string;
  sessionId: string;
  sessionExpiresAt: number;
  role: Role;
  email: string;
  customer?: { id: string; customerNumber: string; firstName: string; name: string };
  staff?: { profileId: string; displayName: string; permissions: Permission[]; presence: PresenceState };
  /** Laufender Chat des Kunden – erspart die Suche bei jeder Nachricht/Tipp-Anzeige. */
  chatSessionId?: string;
}

type AppSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, SocketData>;

const MAX_CONNECTIONS_PER_USER = 12;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX_EVENTS = 40;
const STAFF_OFFLINE_GRACE_MS = 30_000;
const CHAT_MAIL_THROTTLE_MS = 15 * 60 * 1000;

const rooms = {
  user: (userId: string) => `user:${userId}`,
  customer: (customerId: string) => `customer:${customerId}`,
  customers: "customers",
  staff: "staff",
  desk: "desk", // Mitarbeiter mit Chat-Recht
};

let io: Server | undefined;
/** Mitarbeiter, die verbunden UND auf „Online" geschaltet sind (mit Chat-Recht). */
const availableStaff = new Set<string>();
let lastStaffOnline = false;
const offlineTimers = new Map<string, NodeJS.Timeout>();
const lastChatMail = new Map<string, number>();

class ConnectError extends Error {
  readonly data: { code: ChatConnectErrorCode };
  constructor(code: ChatConnectErrorCode, message: string) {
    super(message);
    this.data = { code };
  }
}

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

// --- Verbindungsaufbau -------------------------------------------------------------

async function authenticateSocket(socket: AppSocket): Promise<void> {
  const token = readCookie(socket.request.headers.cookie, SESSION_COOKIE);
  const auth = token ? await resolveSession(token) : null;
  if (!auth) throw new ConnectError("UNAUTHENTICATED", "Bitte melden Sie sich an.");

  const userId = String(auth.user.id);
  const base = { userId, sessionId: String(auth.sessionId), sessionExpiresAt: auth.expiresAt.getTime(), role: auth.user.role, email: auth.user.email };

  if (isStaffRole(auth.user.role)) {
    if (!auth.mfaVerified) throw new ConnectError("MFA_REQUIRED", "Bitte bestätigen Sie die Anmeldung mit Ihrem Authenticator-Code.");
    const staff = await loadStaffContext(auth.user.id, auth.user.role);
    if (!staff) throw new ConnectError("FORBIDDEN", "Für dieses Konto ist kein Mitarbeiterprofil hinterlegt.");
    socket.data = {
      ...base,
      staff: { profileId: String(staff.profileId), displayName: staff.displayName, permissions: staff.permissions, presence: staff.presence },
    };
  } else if (auth.user.role === "CUSTOMER") {
    if (!auth.user.emailVerified) throw new ConnectError("EMAIL_UNVERIFIED", "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.");
    const profile = await CustomerProfile.findOne({ userId: auth.user.id }).select("customerNumber firstName lastName companyName").lean();
    if (!profile) throw new ConnectError("FORBIDDEN", "Kundenprofil nicht gefunden.");
    socket.data = {
      ...base,
      customer: {
        id: String(profile._id),
        customerNumber: profile.customerNumber,
        firstName: profile.firstName,
        name: profile.companyName || `${profile.firstName} ${profile.lastName}`,
      },
    };
  } else {
    throw new ConnectError("FORBIDDEN", "Kein Zugang zum Chat.");
  }

  const open = (await io!.in(rooms.user(userId)).fetchSockets()).length;
  if (open >= MAX_CONNECTIONS_PER_USER) throw new ConnectError("TOO_MANY_CONNECTIONS", "Zu viele offene Fenster – bitte schließen Sie einige.");
}

// --- Fehlerbehandlung & Ereignis-Wrapper ------------------------------------------------

function toAckError(error: unknown, socket: AppSocket, event: string): { code: string; message: string } {
  if (error instanceof AppError) return { code: error.code, message: error.message };
  if (error instanceof z.ZodError) return { code: "VALIDATION_FAILED", message: error.issues[0]?.message ?? "Ungültige Eingabe." };
  logger.error({ err: error, event, userId: socket.data.userId }, "Fehler im Socket-Ereignis");
  return { code: "INTERNAL", message: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut." };
}

/**
 * Registriert ein Ereignis mit Validierung und zentraler Fehlerbehandlung. Antwortet
 * immer per Ack ({ ok, data } bzw. { ok: false, error }) – der Client wartet nie ins Leere.
 */
function on<S extends z.ZodType, R>(socket: AppSocket, event: string, schema: S, handler: (input: z.output<S>) => Promise<R>): void {
  (socket as Socket).on(event, async (...args: unknown[]) => {
    const maybeAck = args.at(-1);
    const ack = typeof maybeAck === "function" ? (maybeAck as (response: ChatAck<R>) => void) : undefined;
    const payload = ack ? args.slice(0, -1)[0] : args[0];
    try {
      const data = await handler(schema.parse(payload ?? {}));
      ack?.({ ok: true, data });
    } catch (error) {
      ack?.({ ok: false, error: toAckError(error, socket, event) });
    }
  });
}

/** Einfaches Zeitfenster-Limit je Verbindung (Schutz vor Spam und fehlerhaften Clients). */
function rateLimiter(socket: AppSocket): void {
  let windowStart = Date.now();
  let count = 0;
  (socket as Socket).use(([, ...args], next) => {
    const now = Date.now();
    if (now >= socket.data.sessionExpiresAt) {
      endSession(socket);
      return;
    }
    if (now - windowStart > RATE_WINDOW_MS) {
      windowStart = now;
      count = 0;
    }
    count += 1;
    if (count > RATE_MAX_EVENTS) {
      const ack = args.at(-1);
      if (typeof ack === "function") ack({ ok: false, error: { code: "RATE_LIMITED", message: "Zu viele Nachrichten in kurzer Zeit. Bitte kurz warten." } });
      return;
    }
    next();
  });
}

function endSession(socket: AppSocket): void {
  (socket as Socket).emit(CHAT_EVENTS.sessionEnded);
  socket.disconnect(true);
}

// --- Präsenz -------------------------------------------------------------------------------

function broadcastStaffAvailability(): void {
  const staffOnline = availableStaff.size > 0;
  if (staffOnline === lastStaffOnline) return;
  lastStaffOnline = staffOnline;
  io?.to([rooms.customers, rooms.staff]).emit(CHAT_EVENTS.staffPresence, { staffOnline });
}

function setAvailable(userId: string, available: boolean): void {
  if (available) availableStaff.add(userId);
  else availableStaff.delete(userId);
  broadcastStaffAvailability();
}

export function isStaffAvailable(): boolean {
  return availableStaff.size > 0;
}

function emitCustomerPresence(update: CustomerPresenceUpdate): void {
  io?.to(rooms.staff).emit(CHAT_EVENTS.customerPresence, update);
}

// --- Live-Updates ----------------------------------------------------------------------------

function publishSession(view: ChatSessionView): void {
  io?.to(rooms.desk).to(rooms.customer(view.customer.id)).emit(CHAT_EVENTS.session, view);
}

/** Für Hintergrundjobs (z. B. automatisch beendete Chats). */
export async function publishSessions(sessions: Parameters<typeof toSessionViews>[0]): Promise<void> {
  for (const view of await toSessionViews(sessions)) {
    publishSession(view);
    if (view.status === "RESOLVED") await syncCustomerSession(view.customer.id, undefined);
  }
}

// --- Kunde ---------------------------------------------------------------------------------

function registerCustomerEvents(socket: AppSocket): void {
  const customer = socket.data.customer!;
  const customerId = new Types.ObjectId(customer.id);
  const userId = new Types.ObjectId(socket.data.userId);
  rememberCustomer({ id: customer.id, userId: socket.data.userId, customerNumber: customer.customerNumber, name: customer.name, firstName: customer.firstName, email: socket.data.email });

  on(socket, CHAT_EVENTS.customerInit, z.object({}), async (): Promise<CustomerChatState> => {
    // Laufender Chat – sonst der zuletzt beendete, solange er noch nicht gelöscht ist.
    const open = await findOpenSession(customerId);
    const session = open ?? (await ChatSession.findOne({ customerId }).sort({ lastMessageAt: -1 }).lean());
    socket.data.chatSessionId = open ? String(open._id) : undefined;
    return {
      customer: { customerNumber: customer.customerNumber, email: socket.data.email, name: customer.name },
      session: session ? await toSessionView(session) : null,
      messages: session ? await toMessageViews(await loadHistory(session._id), customer.firstName) : [],
      staffOnline: isStaffAvailable(),
    };
  });

  on(socket, CHAT_EVENTS.customerSend, SendMessageInput, async (input) => {
    const known = socket.data.chatSessionId ? new Types.ObjectId(socket.data.chatSessionId) : undefined;
    const { session, message, duplicate } = await customerSend({ customerId, userId }, input, known);
    socket.data.chatSessionId = String(session._id);
    rememberSessionCustomer(String(session._id), customer.id);
    const [view] = await toMessageViews([message], customer.firstName);
    const sessionView = await toSessionView(session);
    if (!duplicate) {
      io!.to(rooms.customer(customer.id)).to(rooms.desk).emit(CHAT_EVENTS.message, view);
      publishSession(sessionView);
    }
    return { message: view, session: sessionView };
  });

  on(socket, CHAT_EVENTS.customerTyping, TypingInput, async ({ typing }) => {
    const sessionId = socket.data.chatSessionId;
    if (sessionId) {
      const update: TypingUpdate = { sessionId, from: "CUSTOMER", name: customer.firstName, typing };
      io!.to(rooms.desk).emit(CHAT_EVENTS.typing, update);
    }
    return null;
  });

  on(socket, CHAT_EVENTS.customerRead, z.object({}), async () => {
    const sessionId = socket.data.chatSessionId;
    if (!sessionId) return null;
    const { session, at } = await markRead(new Types.ObjectId(sessionId), "CUSTOMER");
    if (!session) return null; // nichts Ungelesenes
    const update: ReadUpdate = { sessionId, by: "CUSTOMER", at: at.toISOString() };
    io!.to(rooms.desk).to(rooms.customer(customer.id)).emit(CHAT_EVENTS.read, update);
    publishSession(await toSessionView(session));
    return null;
  });
}

/** Chat → Kunde (ändert sich nie) – für Tipp-Anzeige und Lesebestätigung ohne Datenbankabfrage. */
const sessionCustomers = new Map<string, string>();

function rememberSessionCustomer(sessionId: string, customerId: string): void {
  if (sessionCustomers.size > 10_000) sessionCustomers.clear();
  sessionCustomers.set(sessionId, customerId);
}

async function customerOfSession(sessionId: string): Promise<string> {
  const known = sessionCustomers.get(sessionId);
  if (known) return known;
  const session = await findSession(sessionId);
  rememberSessionCustomer(sessionId, String(session.customerId));
  return String(session.customerId);
}

// --- Mitarbeiter (Konsole /admin/chat) ------------------------------------------------------

function registerStaffEvents(socket: AppSocket): void {
  const staff = socket.data.staff!;
  const staffUserId = new Types.ObjectId(socket.data.userId);
  const canChat = staff.permissions.includes("can_chat");

  const requireChat = () => {
    if (!canChat) throw AppError.forbidden("Für den Live-Chat fehlt Ihnen die Berechtigung.");
  };

  on(socket, CHAT_EVENTS.presenceSet, PresenceInput, async ({ presence }) => {
    requireChat();
    await StaffProfile.updateOne({ _id: staff.profileId }, { presence, presenceChangedAt: new Date() });
    staff.presence = presence;
    // Alle Tabs dieses Mitarbeiters übernehmen den Status.
    for (const other of await io!.in(rooms.user(socket.data.userId)).fetchSockets()) {
      if (other.data.staff) other.data.staff.presence = presence;
    }
    io!.to(rooms.user(socket.data.userId)).emit(CHAT_EVENTS.ownPresence, { presence });
    setAvailable(socket.data.userId, presence === "ONLINE");
    return { presence, staffOnline: isStaffAvailable() };
  });

  on(socket, CHAT_EVENTS.deskList, z.object({}), async () => {
    requireChat();
    return { sessions: await toSessionViews(await deskSessions()), staffOnline: isStaffAvailable(), presence: staff.presence };
  });

  on(socket, CHAT_EVENTS.deskOpen, DeskSessionInput, async ({ sessionId }): Promise<DeskSessionState> => {
    requireChat();
    const session = await findSession(sessionId);
    rememberSessionCustomer(sessionId, String(session.customerId));
    return { session: await toSessionView(session), messages: await toMessageViews(await loadHistory(session._id), await customerFirstName(session)) };
  });

  on(socket, CHAT_EVENTS.deskSend, DeskSendInput, async (input) => {
    requireChat();
    // Serverseitig geprüft: Antworten nur mit Status „Online" (über alle Tabs synchron gehalten).
    if (staff.presence !== "ONLINE") throw AppError.forbidden("Bitte schalten Sie sich zuerst auf „Online“, um zu antworten.");

    const { session, message, duplicate } = await staffSend({ userId: staffUserId }, input);
    const [view] = await toMessageViews([message]);
    const sessionView = await toSessionView(session);
    if (!duplicate) {
      io!.to(rooms.customer(String(session.customerId))).to(rooms.desk).emit(CHAT_EVENTS.message, view);
      publishSession(sessionView);
      await syncCustomerSession(String(session.customerId), String(session._id));
      maybeMailCustomer(session.customerId, session.customerUserId, String(session._id), staff.displayName, message.body);
    }
    return { message: view, session: sessionView };
  });

  on(socket, CHAT_EVENTS.deskTyping, DeskTypingInput, async ({ sessionId, typing }) => {
    requireChat();
    const update: TypingUpdate = { sessionId, from: "STAFF", name: staff.displayName, typing };
    io!.to(rooms.customer(await customerOfSession(sessionId))).emit(CHAT_EVENTS.typing, update);
    return null;
  });

  on(socket, CHAT_EVENTS.deskRead, DeskSessionInput, async ({ sessionId }) => {
    requireChat();
    const { session, at } = await markRead(new Types.ObjectId(sessionId), "STAFF");
    if (!session) return null; // nichts Ungelesenes
    const update: ReadUpdate = { sessionId, by: "STAFF", at: at.toISOString() };
    io!.to(rooms.desk).to(rooms.customer(String(session.customerId))).emit(CHAT_EVENTS.read, update);
    publishSession(await toSessionView(session));
    return null;
  });

  on(socket, CHAT_EVENTS.deskStatus, DeskStatusInput, async ({ sessionId, status }) => {
    requireChat();
    const session = await setStatus(new Types.ObjectId(sessionId), status, staffUserId);
    if (!session) throw AppError.notFound("Dieser Chat existiert nicht mehr.");
    const view = await toSessionView(session);
    publishSession(view);
    await syncCustomerSession(String(session.customerId), session.status === "RESOLVED" ? undefined : sessionId);
    return view;
  });
}

/** Laufenden Chat in den Verbindungen des Kunden nachführen (beendet → nächste Nachricht eröffnet neuen Chat). */
async function syncCustomerSession(customerId: string, sessionId: string | undefined): Promise<void> {
  for (const socket of await io!.in(rooms.customer(customerId)).fetchSockets()) {
    (socket.data as SocketData).chatSessionId = sessionId;
  }
}

/** Kunde ist nicht verbunden → E-Mail (falls in den Einstellungen aktiviert), höchstens alle 15 Minuten je Chat. */
function maybeMailCustomer(customerId: Types.ObjectId, customerUserId: Types.ObjectId, sessionId: string, staffName: string, body: string): void {
  if (isOnline(customerUserId)) return;
  const last = lastChatMail.get(sessionId) ?? 0;
  if (Date.now() - last < CHAT_MAIL_THROTTLE_MS) return;
  lastChatMail.set(sessionId, Date.now());
  notifyChatReply(customerId, staffName, body);
}

// --- Verbindung ------------------------------------------------------------------------------

function onConnection(socket: AppSocket): void {
  const { userId } = socket.data;
  rateLimiter(socket);
  void socket.join(rooms.user(userId));

  const firstConnection = trackConnect(userId, socket.id);
  clearTimeout(offlineTimers.get(userId));
  offlineTimers.delete(userId);

  if (socket.data.customer) {
    void socket.join([rooms.customers, rooms.customer(socket.data.customer.id)]);
    registerCustomerEvents(socket);
    if (firstConnection) emitCustomerPresence({ customerId: socket.data.customer.id, userId, online: true });
  } else if (socket.data.staff) {
    const staff = socket.data.staff;
    void socket.join(rooms.staff);
    if (staff.permissions.includes("can_chat")) {
      void socket.join(rooms.desk);
      if (staff.presence === "ONLINE") setAvailable(userId, true);
    }
    registerStaffEvents(socket);
  }

  socket.on("error", (error) => logger.warn({ err: error, userId }, "Socket-Fehler"));

  socket.on("disconnect", () => {
    if (!trackDisconnect(userId, socket.id)) return;
    const lastSeenAt = new Date();
    void User.updateOne({ _id: userId }, { lastSeenAt }).exec().catch(() => undefined);

    if (socket.data.customer) {
      emitCustomerPresence({ customerId: socket.data.customer.id, userId, online: false, lastSeenAt: lastSeenAt.toISOString() });
    } else if (socket.data.staff) {
      setAvailable(userId, false);
      // Kurz warten (Neuladen der Seite), dann Status auf „Offline" – sonst wirkt das Team erreichbar.
      offlineTimers.set(
        userId,
        setTimeout(() => {
          offlineTimers.delete(userId);
          if (isOnline(userId)) return;
          void StaffProfile.updateOne({ userId, presence: "ONLINE" }, { presence: "OFFLINE", presenceChangedAt: new Date() })
            .exec()
            .catch(() => undefined);
        }, STAFF_OFFLINE_GRACE_MS),
      );
    }
  });
}

export function attachRealtime(server: HttpServer): Server {
  io = new Server(server, {
    path: "/socket.io",
    serveClient: false,
    cors: { origin: allowedOrigins, credentials: true },
    // WebSocket-Upgrades umgehen CORS – Herkunft deshalb selbst prüfen (Schutz vor Cross-Site-WebSocket-Hijacking).
    allowRequest: (req, callback) => callback(null, allowedOrigins.includes(req.headers.origin ?? "")),
    maxHttpBufferSize: 64 * 1024,
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  io.use((socket, next) => {
    authenticateSocket(socket as AppSocket).then(
      () => next(),
      (error: unknown) => {
        if (error instanceof ConnectError) return next(error);
        logger.error({ err: error }, "Socket-Anmeldung fehlgeschlagen");
        next(new ConnectError("INTERNAL", "Verbindung derzeit nicht möglich."));
      },
    );
  });

  io.on("connection", (socket) => onConnection(socket as AppSocket));

  io.engine.on("connection_error", (error: { code: number; message: string; req?: { headers?: { origin?: string } } }) => {
    logger.warn({ code: error.code, message: error.message, origin: error.req?.headers?.origin }, "Socket-Verbindung abgelehnt");
  });

  // Passwort geändert, abgemeldet, gesperrt → offene Verbindungen dieser Sitzungen sofort trennen.
  onSessionsRevoked(({ userId, sessionIds, except }) => {
    void io
      ?.in(rooms.user(String(userId)))
      .fetchSockets()
      .then((sockets) => {
        for (const socket of sockets) {
          const sessionId = (socket.data as SocketData).sessionId;
          const affected = sessionIds ? sessionIds.some((id) => String(id) === sessionId) : !except || String(except) !== sessionId;
          if (affected) {
            socket.emit(CHAT_EVENTS.sessionEnded);
            socket.disconnect(true);
          }
        }
      });
  });

  return io;
}
