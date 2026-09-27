import { timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { env, isProduction } from "../config/env";
import { AppError } from "../http/errors";
import { logger } from "../lib/logger";
import { createLead } from "../services/leads";

/**
 * /api/v1/leads – Eingang vom Kontaktformular der Website. Die Server Action (Next.js) prüft
 * Spam und Rate-Limit und liefert die Anfrage hier serverseitig mit einem gemeinsamen Token ein;
 * aus dem Browser ist der Endpunkt nicht nutzbar.
 */
export const leadsRouter = Router();

function tokenMatches(given: string | undefined, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

leadsRouter.post("/", async (req, res) => {
  const expected = env.LEAD_INGEST_TOKEN;
  if (expected) {
    if (!tokenMatches(req.get("x-lead-token"), expected)) throw AppError.forbidden();
  } else if (isProduction) {
    throw new AppError(503, "INTERNAL", "Anfragen-Eingang ist nicht konfiguriert (LEAD_INGEST_TOKEN).");
  }
  const lead = await createLead({ ...req.body, source: "WEBSITE" });
  logger.info({ number: lead.number, topic: lead.topic }, "Neue Anfrage über die Website");
  res.status(201).json({ number: lead.number });
});
