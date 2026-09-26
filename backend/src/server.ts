import { createServer } from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./db/connection";
import { logger } from "./lib/logger";
import { attachRealtime, publishSessions } from "./realtime/server";
import { resumePendingDeletions } from "./services/account-deletion";
import { autoCloseInactiveChats } from "./services/chat";
import "./models"; // alle Modelle registrieren (legt u. a. die Time-Series-Collection an)

const SHUTDOWN_TIMEOUT_MS = 10_000;
const HOUR = 60 * 60 * 1000;

async function main(): Promise<void> {
  await connectDatabase();

  // Eigener HTTP-Server, damit Socket.io (Chat, Presence, Live-GPS) denselben Port nutzt.
  const server = createServer(createApp());
  const io = attachRealtime(server);
  server.listen(env.PORT, () => logger.info(`API bereit auf http://localhost:${env.PORT}`));

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, "Fahre herunter …");
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
    // Trennt alle Sockets und schließt danach den HTTP-Server.
    void io.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  // Stündliche Hintergrundjobs – zusätzlich einmal direkt beim Start.
  const hourly = () => {
    void resumePendingDeletions(); // abgebrochene Kontolöschungen nachholen
    autoCloseInactiveChats() // inaktive Chats beenden → 24-Stunden-Löschfrist beginnt
      .then(publishSessions)
      .catch((error: unknown) => logger.error({ err: error }, "Chat-Aufräumjob fehlgeschlagen"));
  };
  hourly();
  setInterval(hourly, HOUR).unref();

  process.once("SIGTERM", shutdown); // Railway beim Redeploy
  process.once("SIGINT", shutdown);
}

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unbehandelte Promise-Ablehnung");
  process.exit(1);
});

main().catch((error: unknown) => {
  logger.fatal({ err: error }, "Start fehlgeschlagen");
  process.exit(1);
});
