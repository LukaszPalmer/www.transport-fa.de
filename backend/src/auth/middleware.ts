import { effectivePermissions, isStaffRole, type Permission, type PresenceState, type Role } from "@fa/shared";
import type { RequestHandler } from "express";
import type { Types } from "mongoose";
import { AppError } from "../http/errors";
import { StaffProfile } from "../models";
import { SESSION_COOKIE } from "./cookies";
import { resolveSession, type AuthContext } from "./sessions";

export interface StaffContext {
  profileId: Types.ObjectId;
  displayName: string;
  permissions: Permission[];
  presence: PresenceState;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Gesetzt, wenn ein gültiges Sitzungs-Cookie mitgeschickt wurde. */
      auth?: AuthContext;
      /** Gesetzt von requireStaff: Profil und effektive Rechte des Mitarbeiters. */
      staff?: StaffContext;
    }
  }
}

/** Liest das Sitzungs-Cookie – blockiert nie, setzt nur req.auth. */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string" && token) {
    req.auth = (await resolveSession(token)) ?? undefined;
  }
  next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.auth) throw AppError.unauthenticated();
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) throw AppError.unauthenticated();
    if (!roles.includes(req.auth.user.role)) throw AppError.forbidden();
    next();
  };
}

/** Portal-Daten erst nach bestätigter E-Mail-Adresse (Pflicht laut Anforderung). */
export const requireVerifiedEmail: RequestHandler = (req, _res, next) => {
  if (!req.auth) throw AppError.unauthenticated();
  if (!req.auth.user.emailVerified) throw AppError.forbidden("Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.");
  next();
};

/** Staff-Kontext laden (ohne 2FA-Prüfung) – für die 2FA-Einrichtung selbst. */
export async function loadStaffContext(userId: Types.ObjectId, role: Role): Promise<StaffContext | null> {
  const profile = await StaffProfile.findOne({ userId }).select("displayName permissions presence").lean();
  if (!profile) return null;
  return {
    profileId: profile._id,
    displayName: profile.displayName,
    permissions: effectivePermissions(role, profile.permissions),
    presence: profile.presence,
  };
}

/**
 * Admin-Bereich: nur ADMIN/EMPLOYEE mit bestätigtem zweiten Faktor in dieser Sitzung.
 * Ohne 2FA → 403 MFA_REQUIRED (das Frontend führt dann zur Code-Eingabe bzw. Einrichtung).
 */
export const requireStaff: RequestHandler = async (req, _res, next) => {
  if (!req.auth) throw AppError.unauthenticated();
  if (!isStaffRole(req.auth.user.role)) throw AppError.forbidden("Kein Zugang zum Admin-Bereich.");
  if (!req.auth.mfaVerified) throw new AppError(403, "MFA_REQUIRED", "Bitte bestätigen Sie die Anmeldung mit Ihrem Authenticator-Code.");
  const staff = await loadStaffContext(req.auth.user.id, req.auth.user.role);
  if (!staff) throw AppError.forbidden("Für dieses Konto ist kein Mitarbeiterprofil hinterlegt.");
  req.staff = staff;
  next();
};

/** Einzelnes Recht verlangen (ADMIN hat alle). Setzt requireStaff voraus. */
export function requirePermission(permission: Permission): RequestHandler {
  return (req, _res, next) => {
    if (!req.staff?.permissions.includes(permission)) throw AppError.forbidden("Dafür fehlt Ihnen die Berechtigung.");
    next();
  };
}

/** Mindestens eines der Rechte – z. B. Auftragsliste für Disposition und Kundenbetreuung. */
export function requireAnyPermission(...permissions: Permission[]): RequestHandler {
  return (req, _res, next) => {
    if (!permissions.some((permission) => req.staff?.permissions.includes(permission))) {
      throw AppError.forbidden("Dafür fehlt Ihnen die Berechtigung.");
    }
    next();
  };
}

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.auth?.user.role !== "ADMIN") throw AppError.forbidden("Nur für Administratoren.");
  next();
};
