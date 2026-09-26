"use client";

import {
  CHAT_EVENTS,
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_RETENTION_HOURS,
  type ChatMessageView,
  type ChatSessionView,
  type CustomerChatState,
  type ReadUpdate,
  type TypingUpdate,
} from "@fa/shared";
import { Check, CheckCheck, ChevronDown, LoaderCircle, MessageCircle, RotateCcw, Send, WifiOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Socket } from "socket.io-client";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { connectErrorCode, createRealtimeSocket, emitAck, newClientMessageId, RealtimeError, type ConnectionState } from "@/lib/realtime";

/** Nachricht im Widget – vom Server bestätigt oder noch unterwegs. */
type WidgetMessage = ChatMessageView & { state: "sent" | "sending" | "failed" };

const TYPING_THROTTLE_MS = 2_000;
const TYPING_IDLE_MS = 3_000;

const time = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" });
const dateTime = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });

/**
 * Live-Chat für Kunden: schwebt unten rechts, lässt sich einklappen und verbindet sich
 * nach Abbrüchen selbst neu. Nicht bestätigte Nachrichten werden dann erneut gesendet
 * (gleiche ID → der Server speichert sie trotzdem nur einmal).
 */
export function ChatWidget() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get("chat") === "1");
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [customer, setCustomer] = useState<CustomerChatState["customer"]>();
  const [session, setSession] = useState<ChatSessionView | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [staffOnline, setStaffOnline] = useState(false);
  const [staffTyping, setStaffTyping] = useState<string>();
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string>();

  const socketRef = useRef<Socket | null>(null);
  const lastTypingSent = useRef(0);
  const typingIdleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const staffTypingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /** Nachricht einsortieren: ersetzt die lokale Kopie (gleiche clientMessageId) oder hängt an. */
  const upsertMessage = useCallback((message: WidgetMessage) => {
    setMessages((current) => {
      const index = current.findIndex((item) => item.clientMessageId === message.clientMessageId || item.id === message.id);
      if (index === -1) return [...current, message];
      const next = [...current];
      next[index] = message;
      return next;
    });
  }, []);

  const deliver = useCallback(
    async (message: WidgetMessage) => {
      const socket = socketRef.current;
      if (!socket) return;
      upsertMessage({ ...message, state: "sending" });
      try {
        const result = await emitAck<{ message: ChatMessageView; session: ChatSessionView }>(socket, CHAT_EVENTS.customerSend, {
          clientMessageId: message.clientMessageId,
          body: message.body,
        });
        setSession(result.session);
        upsertMessage({ ...result.message, state: "sent" });
        setSendError(undefined);
      } catch (error) {
        upsertMessage({ ...message, state: "failed" });
        // Ohne Verbindung übernimmt das automatische Neusenden nach dem Reconnect.
        if (!(error instanceof RealtimeError && error.code === "OFFLINE")) setSendError(error instanceof Error ? error.message : undefined);
      }
    },
    [upsertMessage],
  );

  // --- Verbindung ------------------------------------------------------------------------
  useEffect(() => {
    const socket = createRealtimeSocket();
    socketRef.current = socket;

    socket.on("connect", async () => {
      setConnection("online");
      try {
        const state = await emitAck<CustomerChatState>(socket, CHAT_EVENTS.customerInit);
        setCustomer(state.customer);
        setSession(state.session);
        setStaffOnline(state.staffOnline);
        const pending = messagesRef.current.filter((message) => message.state !== "sent");
        setMessages([...state.messages.map((message) => ({ ...message, state: "sent" as const })), ...pending]);
        // Nach einem Abbruch: nicht bestätigte Nachrichten erneut senden.
        for (const message of pending) void deliver(message);
      } catch {
        setConnection("reconnecting");
      }
    });
    socket.on("disconnect", (reason) => {
      // Vom Server getrennt (Sitzung beendet) → kein automatischer Neuversuch.
      setConnection(reason === "io server disconnect" ? "ended" : "reconnecting");
    });
    socket.on("connect_error", (error) => {
      const code = connectErrorCode(error);
      if (code === "UNAUTHENTICATED") setConnection("ended");
      else if (!socket.active) setConnection("offline");
      else setConnection("reconnecting");
    });
    socket.on(CHAT_EVENTS.sessionEnded, () => setConnection("ended"));

    socket.on(CHAT_EVENTS.message, (message: ChatMessageView) => {
      upsertMessage({ ...message, state: "sent" });
      if (message.senderRole === "ADMIN") setStaffTyping(undefined);
    });
    socket.on(CHAT_EVENTS.session, (next: ChatSessionView) => {
      setSession((current) => (!current || current.id === next.id || next.status !== "RESOLVED" ? next : current));
    });
    socket.on(CHAT_EVENTS.typing, (update: TypingUpdate) => {
      if (update.from !== "STAFF") return;
      clearTimeout(staffTypingTimer.current);
      setStaffTyping(update.typing ? (update.name ?? "Unser Team") : undefined);
      if (update.typing) staffTypingTimer.current = setTimeout(() => setStaffTyping(undefined), 6_000);
    });
    socket.on(CHAT_EVENTS.read, (update: ReadUpdate) => {
      if (update.by === "STAFF") setSession((current) => (current && current.id === update.sessionId ? { ...current, staffLastReadAt: update.at } : current));
    });
    socket.on(CHAT_EVENTS.staffPresence, ({ staffOnline: online }: { staffOnline: boolean }) => setStaffOnline(online));

    socket.connect();
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      clearTimeout(typingIdleTimer.current);
      clearTimeout(staffTypingTimer.current);
    };
  }, [deliver, upsertMessage]);

  // --- Gelesen melden (Widget offen und sichtbar) -------------------------------------------
  const unread = session && session.status !== "RESOLVED" ? session.unreadByCustomer : 0;
  useEffect(() => {
    const socket = socketRef.current;
    if (!open || unread === 0 || !socket?.connected) return;
    const markRead = () => {
      if (document.visibilityState === "visible") void emitAck(socket, CHAT_EVENTS.customerRead).catch(() => undefined);
    };
    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [open, unread, connection]);

  // Beim Öffnen und bei neuen Nachrichten ans Ende scrollen.
  const visible = messages.filter((message) => !session || message.sessionId === session.id || message.state !== "sent");
  useLayoutEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [open, visible.length, staffTyping]);

  // Nur mit Maus/Trackpad direkt ins Eingabefeld – auf dem Handy würde die Tastatur den Verlauf verdecken.
  useEffect(() => {
    if (open && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, [open]);

  // --- Eingabe --------------------------------------------------------------------------------
  const emitTyping = (typing: boolean) => {
    const socket = socketRef.current;
    if (socket?.connected) socket.emit(CHAT_EVENTS.customerTyping, { typing });
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    const now = Date.now();
    if (value && now - lastTypingSent.current > TYPING_THROTTLE_MS) {
      lastTypingSent.current = now;
      emitTyping(true);
    }
    clearTimeout(typingIdleTimer.current);
    typingIdleTimer.current = setTimeout(() => {
      lastTypingSent.current = 0;
      emitTyping(false);
    }, TYPING_IDLE_MS);
  };

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    clearTimeout(typingIdleTimer.current);
    lastTypingSent.current = 0;
    emitTyping(false);
    void deliver({
      id: "",
      sessionId: session && session.status !== "RESOLVED" ? session.id : "",
      senderRole: "CUSTOMER",
      body,
      clientMessageId: newClientMessageId(),
      createdAt: new Date().toISOString(),
      state: "sending",
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const resolved = session?.status === "RESOLVED";
  const staffReadAt = session?.staffLastReadAt ? new Date(session.staffLastReadAt).getTime() : 0;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 print:hidden sm:right-6 sm:bottom-6">
      {open && (
        <section
          aria-label="Live-Chat mit FA Transport"
          onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
          className="fixed inset-0 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-primary/10 sm:static sm:h-[min(36rem,calc(100dvh-7rem))] sm:w-[23rem] sm:rounded-3xl"
        >
          <header className="bg-primary px-5 pt-4 pb-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-base font-bold">Live-Chat</p>
                <p className="mt-0.5 truncate text-xs text-slate-300">
                  {customer ? `Kundennr. ${customer.customerNumber} · ${customer.email}` : "Verbinde …"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-2 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronDown aria-hidden="true" className="size-5" />
                <span className="sr-only">Chat einklappen</span>
              </button>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <span aria-hidden="true" className={cn("size-2 rounded-full", staffOnline ? "bg-emerald-400" : "bg-slate-500")} />
              {staffOnline ? "Unser Team ist online – Antwort meist in wenigen Minuten" : "Gerade niemand online – wir antworten so schnell wie möglich"}
            </p>
          </header>

          <ConnectionBanner state={connection} />

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4" aria-live="polite">
            {visible.length === 0 && (
              <div className="mx-auto mt-6 max-w-64 text-center text-sm text-slate-500">
                <MessageCircle aria-hidden="true" className="mx-auto mb-3 size-8 text-slate-300" />
                Wie können wir helfen? Fragen zu Aufträgen, Terminen oder Dokumenten – schreiben Sie uns einfach.
              </div>
            )}
            {visible.map((message) => {
              const own = message.senderRole === "CUSTOMER";
              const read = own && message.state === "sent" && new Date(message.createdAt).getTime() <= staffReadAt;
              return (
                <div key={message.clientMessageId} className={cn("flex flex-col", own ? "items-end" : "items-start")}>
                  {!own && message.senderName && <span className="mb-1 px-1 text-xs font-semibold text-slate-500">{message.senderName}</span>}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
                      own ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white text-primary shadow-sm ring-1 ring-primary/5",
                      message.state === "failed" && "bg-red-50 text-red-900 ring-1 ring-red-200",
                    )}
                  >
                    {message.body}
                  </div>
                  <span className="mt-1 flex items-center gap-1 px-1 text-[0.6875rem] text-slate-400">
                    {message.state === "sending" && (
                      <>
                        <LoaderCircle aria-hidden="true" className="size-3 animate-spin" /> Wird gesendet
                      </>
                    )}
                    {message.state === "failed" && (
                      <button type="button" onClick={() => void deliver(message)} className="inline-flex items-center gap-1 font-semibold text-red-700">
                        <RotateCcw aria-hidden="true" className="size-3" /> Nicht gesendet – erneut versuchen
                      </button>
                    )}
                    {message.state === "sent" && (
                      <>
                        {time.format(new Date(message.createdAt))}
                        {own &&
                          (read ? (
                            <CheckCheck aria-label="Gelesen" className="size-3.5 text-accent-ink" />
                          ) : (
                            <Check aria-label="Zugestellt" className="size-3.5" />
                          ))}
                      </>
                    )}
                  </span>
                </div>
              );
            })}
            {staffTyping && (
              <p className="flex items-center gap-2 px-1 text-xs text-slate-500">
                <TypingDots /> {staffTyping} schreibt …
              </p>
            )}
            {resolved && session && (
              <p className="rounded-2xl bg-white px-4 py-3 text-center text-xs leading-relaxed text-slate-500 ring-1 ring-primary/5">
                Dieser Chat wurde beendet
                {session.expiresAt
                  ? ` – der Verlauf wird am ${dateTime.format(new Date(session.expiresAt))} automatisch gelöscht.`
                  : ` – der Verlauf wird nach ${CHAT_RETENTION_HOURS} Stunden automatisch gelöscht.`}{" "}
                Schreiben Sie einfach, um einen neuen Chat zu beginnen.
              </p>
            )}
          </div>

          {connection === "ended" ? (
            <div className="border-t border-slate-100 p-4 text-center text-sm text-slate-600">
              Ihre Sitzung ist abgelaufen.{" "}
              <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
                Bitte neu anmelden
              </Link>
            </div>
          ) : (
            <form onSubmit={send} className="border-t border-slate-100 bg-white p-3">
              {sendError && (
                <p role="alert" className="mb-2 px-1 text-xs font-medium text-red-600">
                  {sendError}
                </p>
              )}
              <div className="flex items-end gap-2">
                <label htmlFor="chat-input" className="sr-only">
                  Nachricht
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  maxLength={CHAT_MESSAGE_MAX_LENGTH}
                  placeholder="Nachricht schreiben …"
                  className="field-sizing-content max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-surface px-3.5 py-2.5 text-sm text-primary outline-none placeholder:text-slate-400 focus:border-accent-ink focus:bg-white focus:ring-4 focus:ring-accent/20"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors hover:bg-accent/90 disabled:opacity-40"
                >
                  <Send aria-hidden="true" className="size-5" />
                  <span className="sr-only">Senden</span>
                </button>
              </div>
              <p className="mt-2 px-1 text-[0.6875rem] text-slate-400">Enter zum Senden · Umschalt + Enter für neue Zeile</p>
            </form>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        aria-expanded={open}
        className={cn(
          "relative flex h-14 items-center gap-2.5 rounded-full bg-primary pr-5 pl-4 font-semibold text-white shadow-xl ring-1 ring-white/10 transition-transform hover:-translate-y-0.5",
          open && "hidden sm:flex",
        )}
      >
        {open ? <ChevronDown aria-hidden="true" className="size-6 text-accent" /> : <MessageCircle aria-hidden="true" className="size-6 text-accent" />}
        <span className="text-sm">{open ? "Chat einklappen" : "Fragen? Chat starten"}</span>
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white ring-2 ring-white">
            {unread}
            <span className="sr-only"> ungelesene Nachrichten</span>
          </span>
        )}
      </button>
    </div>
  );
}

function ConnectionBanner({ state }: { state: ConnectionState }) {
  if (state === "online") return null;
  const text =
    state === "connecting"
      ? "Verbinde mit dem Chat …"
      : state === "reconnecting"
        ? "Verbindung unterbrochen – wird automatisch wiederhergestellt …"
        : state === "offline"
          ? "Chat derzeit nicht verfügbar."
          : "Sitzung beendet.";
  return (
    <p role="status" className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900">
      {state === "connecting" || state === "reconnecting" ? (
        <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
      ) : (
        <WifiOff aria-hidden="true" className="size-3.5" />
      )}
      {text}
    </p>
  );
}

function TypingDots() {
  return (
    <span aria-hidden="true" className="inline-flex gap-0.5">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}
