import type { RequestHandler } from "express";
import { allowedOrigins } from "../config/env";
import { SESSION_COOKIE } from "../auth/cookies";
import { AppError } from "./errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF-Schutz zusätzlich zu SameSite=Lax: Ändernde Anfragen mit Sitzungs-Cookie
 * müssen vom eigenen Frontend kommen (Origin-Header). Anfragen ohne Cookie
 * (z. B. künftige Fahrer-App mit Bearer-Token) sind davon nicht betroffen.
 */
export const originCheck: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method) || !req.cookies?.[SESSION_COOKIE]) return next();

  const origin = req.get("origin");
  if (!origin || !allowedOrigins.includes(origin)) {
    throw AppError.forbidden("Anfrage von einer nicht erlaubten Herkunft.");
  }
  next();
};
