"use client";

import {
  CHAT_EVENTS,
  type ChatMessageView,
  type ChatSessionView,
  type CustomerPresenceUpdate,
  type PresenceState,
  type StaffMe,
} from "@fa/shared";
import { useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { routes } from "@/content/navigation";
import { apiRequest } from "@/lib/api/client";
import { connectErrorCode, createRealtimeSocket, emitAck, type ConnectionState } from "@/lib/realtime";

/**
 * Eine Socket-Verbindung für den ganzen Admin-Bereich: eigener Online-Status,
 * Online-Status der Kunden, Chat-Posteingang (für Badge und Konsole).
 */
interface AdminRealtimeValue {
  socket: Socket | null;
  connection: ConnectionState;
  canChat: boolean;
  presence: PresenceState;
  setPresence: (presence: PresenceState) => Promise<void>;
  staffOnline: boolean;
  sessions: ChatSessionView[];
  unreadChats: number;
  /** Live-Online-Status je Kunden-User-ID (überlagert die Werte vom Server-Rendering). */
  customerPresence: Record<string, { online: boolean; lastSeenAt?: string }>;
  /** Die Konsole meldet, welcher Chat gerade offen ist (kein Ton für diesen Chat). */
  setActiveSessionId: (id: string | undefined) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const AdminRealtimeContext = createContext<AdminRealtimeValue | null>(null);

export function useAdminRealtime(): AdminRealtimeValue {
  const value = use(AdminRealtimeContext);
  if (!value) throw new Error("useAdminRealtime nur innerhalb von <AdminRealtimeProvider>");
  return value;
}

function sortSessions(sessions: ChatSessionView[]): ChatSessionView[] {
  return [...sessions].sort((a, b) => {
    const openA = a.status !== "RESOLVED" ? 0 : 1;
    const openB = b.status !== "RESOLVED" ? 0 : 1;
    return openA - openB || b.lastMessageAt.localeCompare(a.lastMessageAt);
  });
}

/** Kurzer, dezenter Hinweiston (Web Audio, keine Datei nötig). */
function playPing(): void {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.4);
    oscillator.onended = () => void context.close();
  } catch {
    // Browser ohne Audio-Freigabe – dann eben ohne Ton.
  }
}

export function AdminRealtimeProvider({ me, children }: { me: StaffMe; children: ReactNode }) {
  const router = useRouter();
  const canChat = me.staff.permissions.includes("can_chat");
  // Einmal je Mount anlegen (ohne Verbindung – die baut erst der Effekt auf); nie auf dem Server.
  const [socket] = useState<Socket | null>(() => (typeof window === "undefined" ? null : createRealtimeSocket()));
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [presence, setPresenceState] = useState<PresenceState>(me.staff.presence);
  const [staffOnline, setStaffOnline] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionView[]>([]);
  const [customerPresence, setCustomerPresence] = useState<AdminRealtimeValue["customerPresence"]>({});
  const activeSessionRef = useRef<string | undefined>(undefined);
  const [soundEnabled, setSoundState] = useState(me.staff.soundEnabled);
  const soundRef = useRef(soundEnabled);
  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const next = socket;
    if (!next) return;

    next.on("connect", async () => {
      setConnection("online");
      if (!canChat) return;
      try {
        const inbox = await emitAck<{ sessions: ChatSessionView[]; staffOnline: boolean; presence: PresenceState }>(next, CHAT_EVENTS.deskList);
        setSessions(sortSessions(inbox.sessions));
        setStaffOnline(inbox.staffOnline);
        setPresenceState(inbox.presence);
      } catch {
        // Liste kommt beim nächsten Verbindungsaufbau erneut.
      }
    });
    next.on("disconnect", (reason) => setConnection(reason === "io server disconnect" ? "ended" : "reconnecting"));
    next.on("connect_error", (error) => {
      const code = connectErrorCode(error);
      if (code === "UNAUTHENTICATED" || code === "MFA_REQUIRED") setConnection("ended");
      else setConnection(next.active ? "reconnecting" : "offline");
    });
    next.on(CHAT_EVENTS.sessionEnded, () => setConnection("ended"));

    next.on(CHAT_EVENTS.session, (session: ChatSessionView) => {
      setSessions((current) => sortSessions([session, ...current.filter((item) => item.id !== session.id)]));
    });
    next.on(CHAT_EVENTS.message, (message: ChatMessageView) => {
      if (message.senderRole !== "CUSTOMER" || !soundRef.current) return;
      if (document.visibilityState === "hidden" || activeSessionRef.current !== message.sessionId) playPing();
    });
    next.on(CHAT_EVENTS.customerPresence, (update: CustomerPresenceUpdate) => {
      setCustomerPresence((current) => ({ ...current, [update.userId]: { online: update.online, lastSeenAt: update.lastSeenAt } }));
      setSessions((current) => current.map((session) => (session.customer.userId === update.userId ? { ...session, customerOnline: update.online } : session)));
    });
    next.on(CHAT_EVENTS.staffPresence, ({ staffOnline: online }: { staffOnline: boolean }) => setStaffOnline(online));
    next.on(CHAT_EVENTS.ownPresence, ({ presence: own }: { presence: PresenceState }) => setPresenceState(own));

    next.connect();
    return () => {
      next.removeAllListeners();
      next.disconnect();
    };
  }, [socket, canChat]);

  // Sitzung abgelaufen oder widerrufen (z. B. Passwort geändert) → neu anmelden.
  useEffect(() => {
    if (connection === "ended") router.replace(`${routes.adminLogin}?abgelaufen=1`);
  }, [connection, router]);

  const setPresence = useCallback(
    async (next: PresenceState) => {
      if (!socket) return;
      const result = await emitAck<{ presence: PresenceState; staffOnline: boolean }>(socket, CHAT_EVENTS.presenceSet, { presence: next });
      setPresenceState(result.presence);
      setStaffOnline(result.staffOnline);
    },
    [socket],
  );

  const setActiveSessionId = useCallback((id: string | undefined) => {
    activeSessionRef.current = id;
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundState(enabled);
    if (enabled) playPing(); // Vorschau – zugleich Audio-Freigabe durch Nutzerklick
    void apiRequest("/admin/me", { method: "PATCH", body: { soundEnabled: enabled } }).catch(() => undefined);
  }, []);

  const value = useMemo<AdminRealtimeValue>(
    () => ({
      socket,
      connection,
      canChat,
      presence,
      setPresence,
      staffOnline,
      sessions,
      unreadChats: sessions.filter((session) => session.status !== "RESOLVED" && session.unreadByStaff > 0).length,
      customerPresence,
      setActiveSessionId,
      soundEnabled,
      setSoundEnabled,
    }),
    [socket, connection, canChat, presence, setPresence, staffOnline, sessions, customerPresence, setActiveSessionId, soundEnabled, setSoundEnabled],
  );

  return <AdminRealtimeContext value={value}>{children}</AdminRealtimeContext>;
}
