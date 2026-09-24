import { createServer } from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./db/connection";
import { logger } from "./lib/logger";
import "./models"; // alle Modelle registrieren (legt u. a. die Time-Series-Collection an)

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
  await connectDatabase();

  // Eigener HTTP-Server, damit Socket.io (Chat, Presence, Live-GPS) denselben Port nutzt.
  const server = createServer(createApp());
  server.listen(env.PORT, () => logger.info(`API bereit auf http://localhost:${env.PORT}`));

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, "Fahre herunter …");
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
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
