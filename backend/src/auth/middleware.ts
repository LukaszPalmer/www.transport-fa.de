import type { Role } from "@fa/shared";
import type { RequestHandler } from "express";
import { AppError } from "../http/errors";
import { SESSION_COOKIE } from "./cookies";
import { resolveSession, type AuthContext } from "./sessions";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Gesetzt, wenn ein gültiges Sitzungs-Cookie mitgeschickt wurde. */
      auth?: AuthContext;
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
