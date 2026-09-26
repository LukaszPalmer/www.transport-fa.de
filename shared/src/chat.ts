import { z } from "zod";
import { CHAT_MESSAGE_MAX_LENGTH, CHAT_STATUSES, PRESENCE_STATES, type ChatSenderRole, type ChatStatus, type PresenceState } from "./domain";

/**
 * Echtzeit-Chat (Socket.IO): Ereignisnamen, Nutzdaten und Antworten (Acks).
 * Kunden-Widget und Admin-Konsole sprechen exakt dieses Protokoll.
 */

export const CHAT_EVENTS = {
  // Kunde → Server
  customerInit: "chat:init",
  customerSend: "chat:send",
  customerTyping: "chat:typing",
  customerRead: "chat:read",
  // Mitarbeiter → Server
  deskList: "desk:list",
  deskOpen: "desk:open",
  deskSend: "desk:send",
  deskTyping: "desk:typing",
  deskRead: "desk:read",
  deskStatus: "desk:status",
  presenceSet: "presence:set",
  // Server → Clients
  message: "chat:message",
  typing: "chat:typing-update",
  read: "chat:read-update",
  session: "chat:session",
  staffPresence: "presence:staff",
  customerPresence: "presence:customer",
  /** Eigener Online-Status (synchronisiert mehrere Tabs desselben Mitarbeiters). */
  ownPresence: "presence:own",
  /** Sitzung abgelaufen oder widerrufen (z. B. Passwort geändert) – Client meldet sich neu an. */
  sessionEnded: "session:ended",
} as const;

/** Fehlercodes beim Verbindungsaufbau (connect_error → err.data.code). */
export type ChatConnectErrorCode = "UNAUTHENTICATED" | "MFA_REQUIRED" | "FORBIDDEN" | "EMAIL_UNVERIFIED" | "TOO_MANY_CONNECTIONS" | "INTERNAL";

export interface ChatMessageView {
  id: string;
  sessionId: string;
  senderRole: ChatSenderRole;
  senderName?: string;
  body: string;
  clientMessageId: string;
  createdAt: string;
}

export interface ChatSessionView {
  id: string;
  status: ChatStatus;
  customer: { id: string; userId: string; customerNumber: string; name: string; email: string };
  assignedTo?: { id: string; name: string };
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadByStaff: number;
  unreadByCustomer: number;
  customerOnline: boolean;
  staffLastReadAt?: string;
  customerLastReadAt?: string;
  expiresAt?: string;
}

export interface CustomerChatState {
  customer: { customerNumber: string; email: string; name: string };
  session: ChatSessionView | null;
  messages: ChatMessageView[];
  /** Mindestens ein Mitarbeiter hat „Online" geschaltet und ist verbunden. */
  staffOnline: boolean;
}

export interface DeskSessionState {
  session: ChatSessionView;
  messages: ChatMessageView[];
}

export const SendMessageInput = z.object({
  clientMessageId: z.string().min(8).max(64),
  body: z.string().trim().min(1, "Die Nachricht ist leer.").max(CHAT_MESSAGE_MAX_LENGTH, "Die Nachricht ist zu lang."),
});

const sessionId = z.string().regex(/^[a-f0-9]{24}$/);

export const DeskSendInput = SendMessageInput.extend({ sessionId });
export const DeskSessionInput = z.object({ sessionId });
export const DeskTypingInput = z.object({ sessionId, typing: z.boolean() });
export const DeskStatusInput = z.object({ sessionId, status: z.enum(CHAT_STATUSES) });
export const TypingInput = z.object({ typing: z.boolean() });
export const PresenceInput = z.object({ presence: z.enum(PRESENCE_STATES) });

export interface TypingUpdate {
  sessionId: string;
  from: "CUSTOMER" | "STAFF";
  name?: string;
  typing: boolean;
}

export interface ReadUpdate {
  sessionId: string;
  by: "CUSTOMER" | "STAFF";
  at: string;
}

export interface CustomerPresenceUpdate {
  customerId: string;
  userId: string;
  online: boolean;
  lastSeenAt?: string;
}

export interface StaffPresenceUpdate {
  staffOnline: boolean;
}

export interface OwnPresence {
  presence: PresenceState;
}

/** Einheitliche Antwort auf jedes Client-Ereignis (Socket.IO-Acknowledgement). */
export type ChatAck<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
