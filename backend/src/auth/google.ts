import { decodeIdToken, generateCodeVerifier, generateState, Google } from "arctic";
import { z } from "zod";
import { googleOAuth } from "../config/env";

/**
 * Google-Anmeldung (OAuth 2.0 Authorization Code Flow mit PKCE + State).
 * Das ID-Token kommt direkt vom Token-Endpunkt über TLS – eine eigene
 * Signaturprüfung ist dafür laut OpenID-Connect-Spezifikation nicht nötig.
 */
const google = googleOAuth ? new Google(googleOAuth.clientId, googleOAuth.clientSecret, googleOAuth.redirectUri) : null;

export const googleEnabled = google !== null;

const GoogleClaims = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.url().optional(),
});

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export function createGoogleAuthorization(): { url: URL; state: string; codeVerifier: string } {
  if (!google) throw new Error("Google-Anmeldung ist nicht konfiguriert");
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"]);
  url.searchParams.set("prompt", "select_account");
  return { url, state, codeVerifier };
}

export async function exchangeGoogleCode(code: string, codeVerifier: string): Promise<GoogleProfile> {
  if (!google) throw new Error("Google-Anmeldung ist nicht konfiguriert");
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const claims = GoogleClaims.parse(decodeIdToken(tokens.idToken()));

  const [fallbackFirst = "", ...rest] = (claims.name ?? "").trim().split(/\s+/);
  return {
    sub: claims.sub,
    email: claims.email.toLowerCase(),
    emailVerified: claims.email_verified,
    firstName: claims.given_name?.trim() || fallbackFirst || "Kunde",
    lastName: claims.family_name?.trim() || rest.join(" ") || "–",
    avatarUrl: claims.picture,
  };
}
