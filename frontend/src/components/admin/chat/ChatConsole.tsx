"use client";

import {
  CHAT_EVENTS,
  CHAT_MESSAGE_MAX_LENGTH,
  type ChatMessageView,
  type ChatSessionView,
  type ChatStatus,
  type DeskSessionState,
  type ReadUpdate,
  type TypingUpdate,
} from "@fa/shared";
import { ArrowLeft, Check, CheckCheck, CircleCheck, ExternalLink, LoaderCircle, MessagesSquare, RotateCcw, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { formatRelative, formatTime } from "@/lib/admin-format";
import { emitAck, newClientMessageId } from "@/lib/realtime";
import { useNow } from "../customers/CustomerTable";
import { useAdminRealtime } from "../realtime/AdminRealtime";
import { OnlineDot } from "../ui";

type ConsoleMessage = ChatMessageView & { state: "sent" | "sending" | "failed" };
/** Geladener Verlauf eines Chats – fehlt der Eintrag, wird er gerade geladen. */
interface Thread {
  messages: ConsoleMessage[];
  status: "ready" | "error";
}

const TYPING_THROTTLE_MS = 2_000;
const TYPING_IDLE_MS = 3_000;

/**
 * Chat-Konsole (Master-Detail): links alle Chats mit Ungelesen-Badge, Kundennummer,
 * E-Mail und Online-Punkt; rechts die Unterhaltung. Verläufe bleiben beim Wechseln
 * im Speicher und werden live ergänzt – auch für gerade nicht geöffnete Chats.
 */
export function ChatConsole({ initialChatId }: { initialChatId?: string }) {
  const { socket, connection, sessions, presence, setPresence, setActiveSessionId } = useAdminRealtime();
  const now = useNow();
  const [filter, setFilter] = useState<"open" | "resolved">("open");
  const [selectedId, setSelectedId] = useState<string | undefined>(initialChatId);
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [extraSessions, setExtraSessions] = useState<Record<string, ChatSessionView>>({});
  const [customerTyping, setCustomerTyping] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string>();
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastTypingSent = useRef(0);
  const typingIdleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  const allSessions = useMemo(() => {
    const byId = new Map(sessions.map((session) => [session.id, session]));
    for (const [id, session] of Object.entries(extraSessions)) if (!byId.has(id)) byId.set(id, session);
    return [...byId.values()];
  }, [sessions, extraSessions]);
  const visibleSessions = allSessions.filter((session) => (filter === "open" ? session.status !== "RESOLVED" : session.status === "RESOLVED"));
  const selected = allSessions.find((session) => session.id === selectedId);
  const thread = selectedId ? threads[selectedId] : undefined;

  // --- Nachrichten in den Zwischenspeicher einsortieren ----------------------------------------
  const upsert = useCallback((message: ConsoleMessage) => {
    setThreads((current) => {
      const existing = current[message.sessionId];
      if (!existing) return current; // Verlauf wird beim Öffnen vollständig geladen
      const index = existing.messages.findIndex((item) => item.clientMessageId === message.clientMessageId);
      const messages = index === -1 ? [...existing.messages, message] : existing.messages.map((item, i) => (i === index ? message : item));
      return { ...current, [message.sessionId]: { ...existing, messages } };
    });
  }, []);

  const inflight = useRef(new Set<string>());
  const loadThread = useCallback(
    async (sessionId: string) => {
      if (!socket?.connected || inflight.current.has(sessionId)) return;
      inflight.current.add(sessionId);
      try {
        const state = await emitAck<DeskSessionState>(socket, CHAT_EVENTS.deskOpen, { sessionId });
        setExtraSessions((current) => ({ ...current, [sessionId]: state.session }));
        setThreads((current) => {
          const pending = (current[sessionId]?.messages ?? []).filter((message) => message.state !== "sent");
          return { ...current, [sessionId]: { status: "ready", messages: [...state.messages.map((message) => ({ ...message, state: "sent" as const })), ...pending] } };
        });
      } catch (error) {
        setThreads((current) => ({ ...current, [sessionId]: { messages: current[sessionId]?.messages ?? [], status: "error" } }));
        setActionError(error instanceof Error ? error.message : undefined);
      } finally {
        inflight.current.delete(sessionId);
      }
    },
    [socket],
  );

  // Live-Ereignisse
  useEffect(() => {
    if (!socket) return;
    const onMessage = (message: ChatMessageView) => {
      upsert({ ...message, state: "sent" });
      if (message.senderRole === "CUSTOMER") setCustomerTyping((current) => ({ ...current, [message.sessionId]: false }));
    };
    const onTyping = (update: TypingUpdate) => {
      if (update.from !== "CUSTOMER") return;
      clearTimeout(typingTimers.current[update.sessionId]);
      setCustomerTyping((current) => ({ ...current, [update.sessionId]: update.typing }));
      if (update.typing) {
        typingTimers.current[update.sessionId] = setTimeout(() => setCustomerTyping((current) => ({ ...current, [update.sessionId]: false })), 6_000);
      }
    };
    const onRead = (update: ReadUpdate) => {
      if (update.by !== "CUSTOMER") return;
      setExtraSessions((current) => (current[update.sessionId] ? { ...current, [update.sessionId]: { ...current[update.sessionId]!, customerLastReadAt: update.at } } : current));
    };
    // Nach einem Verbindungsabbruch: geöffneten Chat neu laden, andere beim nächsten Öffnen.
    const onConnect = () => {
      setThreads((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id === selectedId)));
      if (selectedId) void loadThread(selectedId);
    };
    socket.on(CHAT_EVENTS.message, onMessage);
    socket.on(CHAT_EVENTS.typing, onTyping);
    socket.on(CHAT_EVENTS.read, onRead);
    socket.on("connect", onConnect);
    return () => {
      socket.off(CHAT_EVENTS.message, onMessage);
      socket.off(CHAT_EVENTS.typing, onTyping);
      socket.off(CHAT_EVENTS.read, onRead);
      socket.off("connect", onConnect);
    };
  }, [socket, upsert, loadThread, selectedId]);

  // Auswahl: URL aktualisieren (Deep-Link), Ton für diesen Chat stumm.
  useEffect(() => {
    setActiveSessionId(selectedId);
    const url = new URL(window.location.href);
    if (selectedId) url.searchParams.set("chat", selectedId);
    else url.searchParams.delete("chat");
    window.history.replaceState(null, "", url);
    return () => setActiveSessionId(undefined);
  }, [selectedId, setActiveSessionId]);

  // Verlauf einmal laden – danach bleibt er im Speicher und wird live ergänzt.
  const loaded = selectedId ? Boolean(threads[selectedId]) : true;
  useEffect(() => {
    if (!selectedId || loaded || connection !== "online") return;
    // Als Callback geplant: schnelles Durchklicken lädt nur den Chat, bei dem man bleibt.
    const timer = setTimeout(() => void loadThread(selectedId), 0);
    return () => clearTimeout(timer);
  }, [selectedId, loaded, connection, loadThread]);

  // Gelesen melden, solange der Chat offen und das Fenster sichtbar ist.
  const unread = selected?.unreadByStaff ?? 0;
  useEffect(() => {
    if (!socket?.connected || !selectedId || unread === 0) return;
    const markRead = () => {
      if (document.visibilityState === "visible") void emitAck(socket, CHAT_EVENTS.deskRead, { sessionId: selectedId }).catch(() => undefined);
    };
    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [socket, selectedId, unread]);

  const messageCount = thread?.messages.length ?? 0;
  const selectedTyping = selectedId ? Boolean(customerTyping[selectedId]) : false;
  useLayoutEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [selectedId, messageCount, selectedTyping]);

  // --- Aktionen ---------------------------------------------------------------------------
  const deliver = async (message: ConsoleMessage) => {
    if (!socket) return;
    upsert({ ...message, state: "sending" });
    try {
      const result = await emitAck<{ message: ChatMessageView; session: ChatSessionView }>(socket, CHAT_EVENTS.deskSend, {
        sessionId: message.sessionId,
        clientMessageId: message.clientMessageId,
        body: message.body,
      });
      upsert({ ...result.message, state: "sent" });
      setActionError(undefined);
    } catch (error) {
      upsert({ ...message, state: "failed" });
      setActionError(error instanceof Error ? error.message : undefined);
    }
  };

  const send = () => {
    if (!selectedId) return;
    const body = (drafts[selectedId] ?? "").trim();
    if (!body) return;
    setDrafts((current) => ({ ...current, [selectedId]: "" }));
    emitTyping(selectedId, false);
    void deliver({
      id: "",
      sessionId: selectedId,
      senderRole: "ADMIN",
      body,
      clientMessageId: newClientMessageId(),
      createdAt: new Date().toISOString(),
      state: "sending",
    });
  };

  const emitTyping = (sessionId: string, typing: boolean) => {
    clearTimeout(typingIdleTimer.current);
    if (!typing) lastTypingSent.current = 0;
    if (socket?.connected) socket.emit(CHAT_EVENTS.deskTyping, { sessionId, typing }, () => undefined);
  };

  const onDraftChange = (value: string) => {
    if (!selectedId) return;
    setDrafts((current) => ({ ...current, [selectedId]: value }));
    if (value && Date.now() - lastTypingSent.current > TYPING_THROTTLE_MS) {
      lastTypingSent.current = Date.now();
      emitTyping(selectedId, true);
    }
    clearTimeout(typingIdleTimer.current);
    const sessionId = selectedId;
    typingIdleTimer.current = setTimeout(() => emitTyping(sessionId, false), TYPING_IDLE_MS);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const changeStatus = async (status: ChatStatus) => {
    if (!socket || !selectedId) return;
    if (status === "RESOLVED" && !window.confirm("Chat beenden? Der Verlauf wird nach 24 Stunden automatisch gelöscht.")) return;
    try {
      const session = await emitAck<ChatSessionView>(socket, CHAT_EVENTS.deskStatus, { sessionId: selectedId, status });
      setExtraSessions((current) => ({ ...current, [session.id]: session }));
      setActionError(undefined);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : undefined);
    }
  };

  const canSend = presence === "ONLINE" && connection === "online";
  const customerReadAt = selected?.customerLastReadAt ? new Date(selected.customerLastReadAt).getTime() : 0;
  const openCount = allSessions.filter((session) => session.status !== "RESOLVED").length;

  return (
    <div className="grid h-[calc(100dvh-8.5rem)] min-h-[32rem] grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-primary/5 lg:h-[calc(100dvh-10rem)] lg:grid-cols-[22rem_1fr]">
      {/* Liste */}
      <aside className={cn("flex min-h-0 flex-col border-r border-slate-100", selectedId && "hidden lg:flex")}>
        <div className="flex gap-1 border-b border-slate-100 p-3">
          {(["open", "resolved"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                filter === value ? "bg-primary text-white" : "text-slate-600 hover:bg-surface",
              )}
            >
              {value === "open" ? `Offen (${openCount})` : "Beendet"}
            </button>
          ))}
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {visibleSessions.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-slate-500">
              <MessagesSquare aria-hidden="true" className="mx-auto mb-3 size-8 text-slate-300" />
              {filter === "open" ? "Keine offenen Chats." : "Keine beendeten Chats (werden nach 24 h gelöscht)."}
            </li>
          )}
          {visibleSessions.map((session) => (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => setSelectedId(session.id)}
                aria-current={session.id === selectedId ? "true" : undefined}
                className={cn(
                  "flex w-full gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition-colors",
                  session.id === selectedId ? "bg-accent/10" : "hover:bg-surface",
                )}
              >
                <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {initials(session.customer.name)}
                  <span className="absolute -right-0.5 -bottom-0.5 flex rounded-full ring-2 ring-white">
                    <OnlineDot online={session.customerOnline} />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn("truncate text-sm text-primary", session.unreadByStaff > 0 ? "font-bold" : "font-semibold")}>{session.customer.name}</span>
                    <span className="shrink-0 text-[0.6875rem] text-slate-400">{formatRelative(session.lastMessageAt, now)}</span>
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {session.customer.customerNumber} · {session.customer.email}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", session.unreadByStaff > 0 ? "font-semibold text-primary" : "text-slate-500")}>
                      {customerTyping[session.id] ? <em className="text-accent-ink">schreibt …</em> : session.lastMessagePreview || "–"}
                    </span>
                    {session.unreadByStaff > 0 && (
                      <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                        {session.unreadByStaff}
                        <span className="sr-only"> ungelesen</span>
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Unterhaltung */}
      <section className={cn("flex min-h-0 flex-col", !selectedId && "hidden lg:flex")} aria-label="Unterhaltung">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-sm text-slate-500">
            <MessagesSquare aria-hidden="true" className="mb-3 size-10 text-slate-300" />
            {selectedId && thread?.status !== "error" ? "Chat wird geladen …" : "Wählen Sie links einen Chat aus."}
          </div>
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
              <button type="button" onClick={() => setSelectedId(undefined)} className="-ml-2 rounded-lg p-2 text-slate-500 hover:bg-surface lg:hidden">
                <ArrowLeft aria-hidden="true" className="size-5" />
                <span className="sr-only">Zur Liste</span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-display font-bold text-primary">
                  <span className="truncate">{selected.customer.name}</span>
                  <OnlineDot online={selected.customerOnline} />
                </p>
                <p className="truncate text-xs text-slate-500">
                  {selected.customer.customerNumber} · {selected.customer.email}
                  {selected.assignedTo && ` · betreut von ${selected.assignedTo.name}`}
                </p>
              </div>
              <Link
                href={`${routes.adminUsers}/${selected.customer.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:text-primary"
              >
                <ExternalLink aria-hidden="true" className="size-4" /> Kundenakte
              </Link>
              {selected.status === "RESOLVED" ? (
                <button type="button" onClick={() => void changeStatus("IN_PROGRESS")} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-accent-ink ring-1 ring-accent/30 hover:bg-accent/10">
                  <RotateCcw aria-hidden="true" className="size-4" /> Wieder öffnen
                </button>
              ) : (
                <button type="button" onClick={() => void changeStatus("RESOLVED")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  <CircleCheck aria-hidden="true" className="size-4" /> Beenden
                </button>
              )}
            </header>

            {selected.status === "RESOLVED" && selected.expiresAt && (
              <p className="border-b border-amber-100 bg-amber-50 px-6 py-2 text-xs text-amber-900">
                Beendet – wird am {new Date(selected.expiresAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })} automatisch gelöscht.
              </p>
            )}

            <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-5 sm:px-6" aria-live="polite">
              {!thread && (
                <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Verlauf wird geladen …
                </p>
              )}
              {thread?.status === "error" && (
                <p className="text-center text-sm text-slate-500">
                  Verlauf konnte nicht geladen werden.{" "}
                  <button type="button" onClick={() => void loadThread(selected.id)} className="font-semibold text-accent-ink underline underline-offset-4">
                    Erneut versuchen
                  </button>
                </p>
              )}
              {thread?.messages.map((message) => {
                const own = message.senderRole === "ADMIN";
                const read = own && message.state === "sent" && new Date(message.createdAt).getTime() <= customerReadAt;
                return (
                  <div key={message.clientMessageId} className={cn("flex flex-col", own ? "items-end" : "items-start")}>
                    <span className="mb-1 px-1 text-xs font-semibold text-slate-500">{own ? (message.senderName ?? "Team") : (message.senderName ?? selected.customer.name)}</span>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
                        own ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white text-primary shadow-sm ring-1 ring-primary/5",
                        message.state === "failed" && "bg-red-50 text-red-900 ring-1 ring-red-200",
                      )}
                    >
                      {message.body}
                    </div>
                    <span className="mt-1 flex items-center gap-1 px-1 text-[0.6875rem] text-slate-400">
                      {message.state === "sending" && <LoaderCircle aria-label="Wird gesendet" className="size-3 animate-spin" />}
                      {message.state === "failed" && (
                        <button type="button" onClick={() => void deliver(message)} className="inline-flex items-center gap-1 font-semibold text-red-700">
                          <RotateCcw aria-hidden="true" className="size-3" /> Erneut senden
                        </button>
                      )}
                      {message.state === "sent" && (
                        <>
                          {formatTime(message.createdAt)}
                          {own && (read ? <CheckCheck aria-label="Gelesen" className="size-3.5 text-accent-ink" /> : <Check aria-label="Zugestellt" className="size-3.5" />)}
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
              {customerTyping[selected.id] && <p className="px-1 text-xs text-slate-500">{selected.customer.name} schreibt …</p>}
            </div>

            <div className="border-t border-slate-100 bg-white p-3 sm:px-6">
              {actionError && (
                <p role="alert" className="mb-2 text-xs font-medium text-red-600">
                  {actionError}
                </p>
              )}
              {presence !== "ONLINE" ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                  Sie sind offline – zum Antworten bitte online schalten.
                  <button type="button" onClick={() => void setPresence("ONLINE")} className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700">
                    Online schalten
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <label htmlFor="desk-input" className="sr-only">
                    Antwort
                  </label>
                  <textarea
                    id="desk-input"
                    value={drafts[selected.id] ?? ""}
                    onChange={(event) => onDraftChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    maxLength={CHAT_MESSAGE_MAX_LENGTH}
                    disabled={!canSend}
                    placeholder={selected.status === "RESOLVED" ? "Antworten öffnet den Chat wieder …" : "Antwort schreiben … (Enter sendet)"}
                    className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-surface px-3.5 py-2.5 text-sm text-primary outline-none placeholder:text-slate-400 focus:border-accent-ink focus:bg-white focus:ring-4 focus:ring-accent/20 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={!canSend || !(drafts[selected.id] ?? "").trim()}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors hover:bg-accent/90 disabled:opacity-40"
                  >
                    <Send aria-hidden="true" className="size-5" />
                    <span className="sr-only">Senden</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}
