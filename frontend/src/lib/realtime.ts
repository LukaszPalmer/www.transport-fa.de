"use client";

import type { ChatAck, ChatConnectErrorCode } from "@fa/shared";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "./api/client";

/**
 * Socket.IO-Verbindung zur API (Live-Chat, Online-Status). Anmeldung über das
 * httpOnly-Sitzungs-Cookie – der Browser schickt es beim Verbindungsaufbau mit.
 * Verbindungsabbrüche werden automatisch mit wachsendem Abstand neu versucht.
 */
export function createRealtimeSocket(): Socket {
  return io(API_URL, {
    path: "/socket.io",
    withCredentials: true,
    autoConnect: false,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    randomizationFactor: 0.5,
    timeout: 10_000,
  });
}

export class RealtimeError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "RealtimeError";
  }
}

const ACK_TIMEOUT_MS = 10_000;

/** Ereignis senden und auf die Antwort des Servers warten ({ ok, data } bzw. Fehler). */
export async function emitAck<T>(socket: Socket, event: string, payload: object = {}): Promise<T> {
  if (!socket.connected) throw new RealtimeError("OFFLINE", "Keine Verbindung – wird automatisch erneut versucht.");
  let response: ChatAck<T>;
  try {
    response = (await socket.timeout(ACK_TIMEOUT_MS).emitWithAck(event, payload)) as ChatAck<T>;
  } catch {
    throw new RealtimeError("TIMEOUT", "Der Server antwortet gerade nicht. Bitte versuchen Sie es erneut.");
  }
  if (!response.ok) throw new RealtimeError(response.error.code, response.error.message);
  return response.data;
}

/** Code eines abgelehnten Verbindungsaufbaus (z. B. abgelaufene Sitzung). */
export function connectErrorCode(error: Error): ChatConnectErrorCode | undefined {
  const data = (error as Error & { data?: { code?: ChatConnectErrorCode } }).data;
  return data?.code;
}

export type ConnectionState = "connecting" | "online" | "reconnecting" | "offline" | "ended";

/** Clientseitige ID je Nachricht – macht erneutes Senden nach einem Abbruch idempotent. */
export function newClientMessageId(): string {
  return crypto.randomUUID();
}
