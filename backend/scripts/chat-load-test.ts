/**
 * Lasttest für den Live-Chat (Socket.IO) gegen eine laufende API.
 * Legt temporäre Test-Kunden plus einen Test-Mitarbeiter an, verbindet alle gleichzeitig,
 * sendet Nachrichten in beide Richtungen, misst Antwortzeiten und räumt danach alles auf.
 *
 *   npm run chat:load-test -w @fa/backend -- [kunden=100] [nachrichten=5] [api=http://localhost:4000]
 *
 * Nur für Entwicklung/Staging – in Produktion verweigert das Skript den Start.
 */
import { randomUUID } from "node:crypto";
import { CHAT_EVENTS, type ChatAck, type ChatMessageView, type CustomerChatState } from "@fa/shared";
import { Types } from "mongoose";
import { io, type Socket } from "socket.io-client";
import { SESSION_COOKIE } from "../src/auth/cookies";
import { env, isProduction } from "../src/config/env";
import { connectDatabase, disconnectDatabase } from "../src/db/connection";
import { randomToken, sha256 } from "../src/lib/crypto";
import { ChatMessage, ChatSession, CustomerProfile, Session, StaffProfile, User } from "../src/models";

const [clientsArg, messagesArg, apiArg] = process.argv.slice(2);
const CLIENTS = Number(clientsArg ?? 100);
const MESSAGES = Number(messagesArg ?? 5);
const API = apiArg ?? `http://localhost:${env.PORT}`;
const ORIGIN = new URL(env.FRONTEND_URL).origin;
const RUN = `lt${Date.now().toString(36)}`;
const TIMEOUT_MS = 15_000;

interface TestUser {
  userId: Types.ObjectId;
  customerId?: Types.ObjectId;
  token: string;
}

/** Ein Mitarbeiter je 25 Chats – realistisch und unter dem Rate-Limit je Verbindung. */
const STAFF_COUNT = Math.max(1, Math.ceil(CLIENTS / 25));

async function createUsers(): Promise<{ customers: TestUser[]; staff: TestUser[] }> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const customers: TestUser[] = [];
  const users = Array.from({ length: CLIENTS }, (_, index) => ({
    _id: new Types.ObjectId(),
    email: `${RUN}-${index}@loadtest.invalid`,
    name: `Last Test ${index}`,
    emailVerifiedAt: new Date(),
  }));
  await User.insertMany(users);
  const profiles = users.map((user, index) => ({
    _id: new Types.ObjectId(),
    userId: user._id,
    customerNumber: `${RUN.toUpperCase()}-${index}`,
    firstName: "Last",
    lastName: `Test ${index}`,
    searchText: `${RUN} loadtest`,
  }));
  await CustomerProfile.insertMany(profiles);
  const sessions = users.map((user, index) => {
    const token = randomToken();
    customers.push({ userId: user._id, customerId: profiles[index]!._id, token });
    return { tokenHash: sha256(token), userId: user._id, role: "CUSTOMER", expiresAt };
  });
  await Session.insertMany(sessions);

  const staff: TestUser[] = [];
  for (let index = 0; index < STAFF_COUNT; index += 1) {
    const staffUser = await User.create({ email: `${RUN}-staff${index}@loadtest.invalid`, name: `Lasttest Team ${index}`, role: "ADMIN", emailVerifiedAt: new Date() });
    await StaffProfile.create({ userId: staffUser._id, displayName: `Lasttest-Team ${index}`, presence: "ONLINE" });
    const token = randomToken();
    await Session.create({ tokenHash: sha256(token), userId: staffUser._id, role: "ADMIN", mfaVerified: true, expiresAt });
    staff.push({ userId: staffUser._id, token });
  }

  return { customers, staff };
}

async function cleanup(): Promise<void> {
  const users = await User.find({ email: { $regex: `^${RUN}-` } }).select("_id").lean();
  const userIds = users.map((user) => user._id);
  const profiles = await CustomerProfile.find({ userId: { $in: userIds } }).select("_id").lean();
  const sessionIds = await ChatSession.find({ customerId: { $in: profiles.map((profile) => profile._id) } }).distinct("_id");
  await ChatMessage.deleteMany({ sessionId: { $in: sessionIds } });
  await ChatSession.deleteMany({ _id: { $in: sessionIds } });
  await Session.deleteMany({ userId: { $in: userIds } });
  await CustomerProfile.deleteMany({ userId: { $in: userIds } });
  await StaffProfile.deleteMany({ userId: { $in: userIds } });
  await User.deleteMany({ _id: { $in: userIds } });
}

function connect(token: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(API, {
      transports: ["websocket"],
      extraHeaders: { Cookie: `${SESSION_COOKIE}=${token}`, Origin: ORIGIN },
      reconnection: false,
      timeout: TIMEOUT_MS,
    });
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", (error) => reject(error));
  });
}

async function emit<T>(socket: Socket, event: string, payload: unknown = {}): Promise<{ data: T; ms: number }> {
  const started = performance.now();
  const response = (await socket.timeout(TIMEOUT_MS).emitWithAck(event, payload)) as ChatAck<T>;
  if (!response.ok) throw new Error(`${event}: ${response.error.code} ${response.error.message}`);
  return { data: response.data, ms: performance.now() - started };
}

function percentile(values: number[], p: number): string {
  const sorted = [...values].sort((a, b) => a - b);
  return (sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] ?? 0).toFixed(1);
}

async function main(): Promise<void> {
  if (isProduction) throw new Error("Lasttest nicht in Produktion ausführen.");
  await connectDatabase();
  console.log(`\nChat-Lasttest: ${CLIENTS} Kunden × ${MESSAGES} Nachrichten, ${STAFF_COUNT} Mitarbeiter, gegen ${API}\n`);

  const errors: string[] = [];
  const sockets: Socket[] = [];
  try {
    const { customers, staff } = await createUsers();

    // Mitarbeiter-Konsolen
    const desks = await Promise.all(staff.map((member) => connect(member.token)));
    sockets.push(...desks);
    await Promise.all(desks.map((desk) => emit(desk, CHAT_EVENTS.presenceSet, { presence: "ONLINE" })));
    const deskReceived = new Set<string>();
    desks[0]!.on(CHAT_EVENTS.message, (message: ChatMessageView) => {
      if (message.senderRole === "CUSTOMER") deskReceived.add(message.clientMessageId);
    });

    // Alle Kunden gleichzeitig verbinden
    let started = performance.now();
    const results = await Promise.allSettled(customers.map((customer) => connect(customer.token)));
    const connectMs = performance.now() - started;
    const customerSockets = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    for (const result of results) if (result.status === "rejected") errors.push(`Verbindung: ${String(result.reason)}`);
    sockets.push(...customerSockets);
    console.log(`Verbunden:        ${customerSockets.length}/${CLIENTS} in ${connectMs.toFixed(0)} ms`);

    const replies = new Map<Socket, number>();
    for (const socket of customerSockets) {
      replies.set(socket, 0);
      socket.on(CHAT_EVENTS.message, (message: ChatMessageView) => {
        if (message.senderRole === "ADMIN") replies.set(socket, (replies.get(socket) ?? 0) + 1);
      });
    }

    // Jeder Kunde: Chat laden, dann Nachrichten nacheinander senden (parallel über alle Kunden)
    const sendLatencies: number[] = [];
    const sessionIds = new Set<string>();
    started = performance.now();
    await Promise.all(
      customerSockets.map(async (socket, index) => {
        try {
          await emit<CustomerChatState>(socket, CHAT_EVENTS.customerInit);
          for (let n = 0; n < MESSAGES; n += 1) {
            const { data, ms } = await emit<{ session: { id: string } }>(socket, CHAT_EVENTS.customerSend, {
              clientMessageId: randomUUID(),
              body: `Lasttest ${index}/${n}: Wann kommt meine Lieferung?`,
            });
            sendLatencies.push(ms);
            sessionIds.add(data.session.id);
          }
        } catch (error) {
          errors.push(String(error));
        }
      }),
    );
    const sendMs = performance.now() - started;
    const total = customerSockets.length * MESSAGES;
    console.log(`Gesendet:         ${sendLatencies.length}/${total} in ${sendMs.toFixed(0)} ms (${((sendLatencies.length / sendMs) * 1000).toFixed(0)} Nachr./s)`);
    console.log(`Antwortzeit (Ack) p50 ${percentile(sendLatencies, 50)} ms · p95 ${percentile(sendLatencies, 95)} ms · p99 ${percentile(sendLatencies, 99)} ms`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Konsole erhalten: ${deskReceived.size}/${total}`);
    console.log(`Chats angelegt:   ${sessionIds.size} (erwartet ${customerSockets.length} – einer je Kunde)`);

    // Das Team antwortet in jedem Chat (Chats reihum verteilt)
    const replyLatencies: number[] = [];
    await Promise.all(
      [...sessionIds].map(async (sessionId, index) => {
        try {
          const desk = desks[index % desks.length]!;
          const { ms } = await emit(desk, CHAT_EVENTS.deskSend, { sessionId, clientMessageId: randomUUID(), body: "Ihr Fahrer ist unterwegs." });
          replyLatencies.push(ms);
        } catch (error) {
          errors.push(String(error));
        }
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const customersWithReply = [...replies.values()].filter((count) => count > 0).length;
    console.log(`Antworten:        ${replyLatencies.length}/${sessionIds.size} gesendet · p95 ${percentile(replyLatencies, 95)} ms · bei ${customersWithReply} Kunden angekommen`);

    const ok =
      errors.length === 0 &&
      customerSockets.length === CLIENTS &&
      sendLatencies.length === total &&
      deskReceived.size === total &&
      sessionIds.size === customerSockets.length &&
      customersWithReply === customerSockets.length;
    console.log(`\n${ok ? "✓ Bestanden" : "✗ Fehler"}${errors.length ? ` – ${errors.length} Fehler, z. B. ${errors.slice(0, 3).join(" | ")}` : ""}\n`);
    if (!ok) process.exitCode = 1;
  } finally {
    for (const socket of sockets) socket.disconnect();
    await cleanup();
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
