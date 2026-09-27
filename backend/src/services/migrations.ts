import { LEGACY_SERVICE_SLUGS, type ServiceSlug } from "@fa/shared";
import { logger } from "../lib/logger";
import { Shipment } from "../models";

/**
 * Kleine, idempotente Datenanpassungen beim Start – z. B. umbenannte Leistungen
 * („Transport & Logistik" heißt jetzt „Transport", Slug transport-logistik → transport).
 */
export async function runStartupMigrations(): Promise<void> {
  for (const [from, to] of Object.entries(LEGACY_SERVICE_SLUGS)) {
    const { modifiedCount } = await Shipment.updateMany({ service: from as ServiceSlug }, { $set: { service: to } }); // Altwert, den das Enum nicht mehr kennt
    if (modifiedCount > 0) logger.info({ from, to, modifiedCount }, "Aufträge auf neuen Leistungs-Slug umgestellt");
  }
}
