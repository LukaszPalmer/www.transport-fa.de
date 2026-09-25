import { sessionCookieName } from "@fa/shared";
import type { CookieOptions, Response } from "express";
import { env, isProduction } from "../config/env";

/**
 * Sitzungs-Cookie: httpOnly (kein Zugriff per JavaScript), Secure in Produktion,
 * SameSite=Lax (Schutz vor Cross-Site-Anfragen). Mit COOKIE_DOMAIN gilt es für
 * www und api gleichermaßen – lokal teilen sich localhost:3000 und :4000 den Host.
 */
export const SESSION_COOKIE = sessionCookieName(isProduction);

const sessionCookieBase: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  domain: env.COOKIE_DOMAIN || undefined,
};

/** maxAge weglassen = Browser-Sitzung („Angemeldet bleiben" nicht gewählt). */
export function setSessionCookie(res: Response, token: string, maxAgeMs?: number): void {
  res.cookie(SESSION_COOKIE, token, maxAgeMs ? { ...sessionCookieBase, maxAge: maxAgeMs } : sessionCookieBase);
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, sessionCookieBase);
}

/** Kurzlebige Cookies für den Google-Login (State, PKCE-Verifier, Rücksprungziel). */
export const OAUTH_COOKIE_PATH = "/api/v1/auth/google";

const oauthCookieBase: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax", // muss beim Rücksprung von Google (Top-Level-GET) mitgesendet werden
  path: OAUTH_COOKIE_PATH,
  maxAge: 10 * 60 * 1000,
};

export function setOAuthCookie(res: Response, name: string, value: string): void {
  res.cookie(name, value, oauthCookieBase);
}

export function clearOAuthCookie(res: Response, name: string): void {
  res.clearCookie(name, { ...oauthCookieBase, maxAge: undefined });
}
