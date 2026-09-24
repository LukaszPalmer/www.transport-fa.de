import {
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_SENDER_ROLES,
  CHAT_STATUSES,
  type ChatSenderRole,
  type ChatStatus,
} from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

/**
 * Helpdesk-Unterhaltungen. Flüchtiger Zustand (Tippt-gerade, "Anna antwortet …",
 * Verbindungen) lebt nur in Socket.io – persistiert werden Status, Zuweisung und Lesestand.
 */
export interface IChatSession {
  _id: Id;
  customerId: Id; // → CustomerProfile
  customerUserId: Id; // → User (Socket-Autorisierung ohne Join)
  status: ChatStatus;
  assignedToId?: Id; // Mitarbeiter, der übernommen hat
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadByStaff: number; // Badge im Helpdesk
  unreadByCustomer: number; // Badge im Widget
  staffLastReadAt?: Date; // Lesebestätigung: gelesen ⇔ message.createdAt ≤ lastReadAt der Gegenseite
  customerLastReadAt?: Date;
  resolvedAt?: Date;
  resolvedById?: Id;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    customerId: { type: ObjectId, ref: "CustomerProfile", required: true },
    customerUserId: { type: ObjectId, ref: "User", required: true },
    status: { type: String, enum: CHAT_STATUSES, default: "OPEN" },
    assignedToId: { type: ObjectId, ref: "User" },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: "", maxlength: 140 },
    unreadByStaff: { type: Number, default: 0, min: 0 },
    unreadByCustomer: { type: Number, default: 0, min: 0 },
    staffLastReadAt: Date,
    customerLastReadAt: Date,
    resolvedAt: Date,
    resolvedById: { type: ObjectId, ref: "User" },
  },
  { timestamps: true },
);

ChatSessionSchema.index({ status: 1, lastMessageAt: -1 }); // Helpdesk-Inbox
ChatSessionSchema.index({ customerId: 1, lastMessageAt: -1 }); // Widget + 360°-Ansicht
ChatSessionSchema.index({ assignedToId: 1, status: 1 });

export interface IChatMessage {
  _id: Id;
  sessionId: Id;
  senderId?: Id; // fehlt bei SYSTEM
  senderRole: ChatSenderRole;
  body: string;
  attachmentIds: Id[]; // → Document (CHAT_ATTACHMENT)
  clientMessageId: string; // UUID vom Client – keine Duplikate bei Reconnect
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: { type: ObjectId, ref: "ChatSession", required: true },
    senderId: { type: ObjectId, ref: "User" },
    senderRole: { type: String, enum: CHAT_SENDER_ROLES, required: true },
    body: { type: String, required: true, trim: true, maxlength: CHAT_MESSAGE_MAX_LENGTH },
    attachmentIds: { type: [{ type: ObjectId, ref: "Document" }], default: [] },
    clientMessageId: { type: String, required: true, maxlength: 64 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });
ChatMessageSchema.index({ sessionId: 1, clientMessageId: 1 }, { unique: true });

export const ChatSession = defineModel("ChatSession", ChatSessionSchema);
export const ChatMessage = defineModel("ChatMessage", ChatMessageSchema);
