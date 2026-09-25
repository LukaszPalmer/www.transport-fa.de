import type { Request } from "express";
import type { Types } from "mongoose";
import { AuditLog, type IAuditLog } from "../models";
import { logger } from "./logger";

type AuditDetails = Partial<Pick<IAuditLog, "actorRole" | "targetType" | "targetId" | "customerId" | "meta">> & {
  actorId?: Types.ObjectId;
};

/**
 * Protokolliert Sicherheits- und Admin-Ereignisse. Fehler beim Protokollieren
 * dürfen die eigentliche Aktion nie abbrechen.
 */
export function audit(req: Request, action: string, details: AuditDetails = {}): void {
  const actorId = details.actorId ?? req.auth?.user.id;
  AuditLog.create({
    action,
    actorId,
    actorRole: req.auth?.user.role,
    ip: req.ip,
    ...details,
  }).catch((error: unknown) => logger.error({ err: error, action }, "Audit-Eintrag fehlgeschlagen"));
}
