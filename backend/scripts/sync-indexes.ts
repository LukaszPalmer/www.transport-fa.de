/**
 * Legt fehlende Collections an und gleicht alle Indizes mit den Schemas ab.
 * Lokal: npm run db:sync-indexes · Railway: Pre-Deploy-Command (db:sync-indexes:prod)
 */
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../src/db/connection";
import { logger } from "../src/lib/logger";
import "../src/models";

await connectDatabase();

for (const model of Object.values(mongoose.models)) {
  await model.createCollection(); // Time-Series-Optionen greifen nur beim Anlegen
  const dropped = await model.syncIndexes();
  logger.info({ model: model.modelName, dropped }, "Indizes synchronisiert");
}

await disconnectDatabase();
