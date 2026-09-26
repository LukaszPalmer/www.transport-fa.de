import type { Role, UserState } from "@fa/shared";
import type { Request } from "express";
import type { Types } from "mongoose";
import { randomToken, sha256 } from "../lib/crypto";
import { Session, User, type IUser } from "../models";

/**
 * Serverseitige Sitzungen. Im Cookie steht nur ein Zufallstoken, in der Datenbank
 * dessen Hash – ein Datenbank-Leak liefert also keine gültigen Sitzungen.
 * Laufzeit fest (kein stilles Verlängern): Kunden 14 Tage, Mitarbeiter 12 Stunden,
 * ohne „Angemeldet bleiben" 12 Stunden als Browser-Sitzung.
 */
const HOUR = 60 * 60 * 1000;
const LIFETIME: Record<Role, number> = { CUSTOMER: 14 * 24 * HOUR, EMPLOYEE: 12 * HOUR, ADMIN: 12 * HOUR, DRIVER: 30 * 24 * HOUR };
const SHORT_LIFETIME = 12 * HOUR;
const LAST_SEEN_INTERVAL = 5 * 60 * 1000;

export interface AuthUser {
  id: Types.ObjectId;
  email: string;
  name: string;
  role: Role;
  state: UserState;
  emailVerified: boolean;
}

export interface AuthContext {
  user: AuthUser;
  sessionId: Types.ObjectId;
  /** Zeitpunkt der Anmeldung – für Aktionen, die eine frische Anmeldung verlangen. */
  signedInAt: Date;
  /** Mitarbeiter: zweiter Faktor in dieser Sitzung bestätigt. */
  mfaVerified: boolean;
  /** Feste Laufzeit – auch offene Socket-Verbindungen enden spätestens dann. */
  expiresAt: Date;
}

export interface CreatedSession {
  token: string;
  /** Für das Cookie – undefined bei Browser-Sitzungen. */
  cookieMaxAgeMs?: number;
}

export async function createSession(
  user: Pick<IUser, "_id" | "role">,
  req: Request,
  { persistent }: { persistent: boolean },
): Promise<CreatedSession> {
  const lifetime = persistent ? LIFETIME[user.role] : Math.min(SHORT_LIFETIME, LIFETIME[user.role]);
  const token = randomToken();
  await Session.create({
    tokenHash: sha256(token),
    userId: user._id,
    role: user.role,
    expiresAt: new Date(Date.now() + lifetime),
    ip: req.ip,
    userAgent: req.get("user-agent")?.slice(0, 500),
  });
  return { token, cookieMaxAgeMs: persistent ? lifetime : undefined };
}

/** Prüft ein Cookie-Token. Abgelaufene, widerrufene oder gesperrte Sitzungen ergeben null. */
export async function resolveSession(token: string): Promise<AuthContext | null> {
  if (token.length < 20 || token.length > 100) return null;

  const session = await Session.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;

  const user = await User.findById(session.userId).select("email name role state emailVerifiedAt").lean();
  if (!user || user.state !== "ACTIVE" || user.role !== session.role) return null;

  if (Date.now() - session.lastSeenAt.getTime() > LAST_SEEN_INTERVAL) {
    const now = new Date();
    void Session.updateOne({ _id: session._id }, { lastSeenAt: now }).exec();
    void User.updateOne({ _id: user._id }, { lastSeenAt: now }).exec(); // „Zuletzt online"
  }

  return {
    sessionId: session._id,
    signedInAt: session.createdAt,
    mfaVerified: session.mfaVerified,
    expiresAt: session.expiresAt,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      state: user.state,
      emailVerified: Boolean(user.emailVerifiedAt),
    },
  };
}

/**
 * Benachrichtigung bei widerrufenen Sitzungen – der Echtzeit-Server trennt daraufhin
 * offene Socket-Verbindungen (sonst bliebe ein Chat nach Passwortänderung verbunden).
 */
type RevocationListener = (event: { userId: Types.ObjectId; sessionIds?: Types.ObjectId[]; except?: Types.ObjectId }) => void;
const revocationListeners = new Set<RevocationListener>();

export function onSessionsRevoked(listener: RevocationListener): void {
  revocationListeners.add(listener);
}

function notifyRevoked(event: Parameters<RevocationListener>[0]): void {
  for (const listener of revocationListeners) listener(event);
}

export async function revokeSession(token: string): Promise<void> {
  const session = await Session.findOneAndDelete({ tokenHash: sha256(token) }).select("userId").lean();
  if (session) notifyRevoked({ userId: session.userId, sessionIds: [session._id] });
}

/**
 * Alle Sitzungen eines Nutzers beenden – nach Passwort-/E-Mail-Änderung, Sperre oder
 * Kontolöschung. Optional bleibt die aktuelle Sitzung erhalten (eigene Änderung).
 */
export async function revokeAllSessions(userId: Types.ObjectId, options: { except?: Types.ObjectId } = {}): Promise<number> {
  const result = await Session.deleteMany(options.except ? { userId, _id: { $ne: options.except } } : { userId });
  notifyRevoked({ userId, except: options.except });
  return result.deletedCount;
}

export async function markSessionMfaVerified(sessionId: Types.ObjectId): Promise<void> {
  await Session.updateOne({ _id: sessionId }, { mfaVerified: true });
}
