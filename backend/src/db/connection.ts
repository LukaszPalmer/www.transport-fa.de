import mongoose from "mongoose";
import { env, isProduction } from "../config/env";
import { logger } from "../lib/logger";

mongoose.set("strictQuery", true);
// Indizes werden in Produktion per `db:sync-indexes` (Pre-Deploy) gepflegt, nicht beim Start.
mongoose.set("autoIndex", !isProduction);

let closing = false;

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on("disconnected", () => {
    if (!closing) logger.warn("MongoDB-Verbindung getrennt");
  });
  mongoose.connection.on("reconnected", () => logger.info("MongoDB-Verbindung wiederhergestellt"));
  mongoose.connection.on("error", (error) => logger.error({ err: error }, "MongoDB-Fehler"));

  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    appName: "fa-transport-api",
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
  });
  logger.info({ db: env.MONGODB_DB_NAME }, "MongoDB verbunden");
}

export async function disconnectDatabase(): Promise<void> {
  closing = true;
  await mongoose.disconnect();
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}
