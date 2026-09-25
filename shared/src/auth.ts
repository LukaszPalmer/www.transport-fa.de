import { z } from "zod";
import type { CustomerType, Role } from "./domain";

/**
 * Anmeldung & Konto – Eingaben (Zod, identisch im Browser und in der API)
 * und Antwort-Typen der Auth-Endpunkte.
 */

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

/** Sitzungs-Cookie – Produktion mit __Secure-Präfix (nur über HTTPS, gilt für www + api). */
export function sessionCookieName(production: boolean): string {
  return production ? "__Secure-fa_session" : "fa_session";
}

const email = z
  .string({ error: "Bitte geben Sie Ihre E-Mail-Adresse ein." })
  .trim()
  .toLowerCase()
  .max(254, "Die E-Mail-Adresse ist zu lang.")
  .pipe(z.email("Bitte geben Sie eine gültige E-Mail-Adresse ein."));

const newPassword = z
  .string({ error: "Bitte wählen Sie ein Passwort." })
  .min(PASSWORD_MIN_LENGTH, `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`)
  .max(PASSWORD_MAX_LENGTH, `Höchstens ${PASSWORD_MAX_LENGTH} Zeichen.`);

const personName = (label: string) =>
  z.string({ error: `Bitte geben Sie Ihren ${label} ein.` }).trim().min(1, `Bitte geben Sie Ihren ${label} ein.`).max(100);

const token = z.string().min(20, "Der Link ist unvollständig.").max(200);

export const RegisterInput = z.object({
  firstName: personName("Vornamen"),
  lastName: personName("Nachnamen"),
  email,
  password: newPassword,
  acceptPrivacy: z.literal(true, { error: "Bitte stimmen Sie der Datenschutzerklärung zu." }),
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const LoginInput = z.object({
  email,
  password: z.string({ error: "Bitte geben Sie Ihr Passwort ein." }).min(1, "Bitte geben Sie Ihr Passwort ein.").max(PASSWORD_MAX_LENGTH),
  remember: z.boolean().default(true),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const ForgotPasswordInput = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInput>;

export const ResetPasswordInput = z.object({ token, password: newPassword });
export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;

export const VerifyEmailInput = z.object({ token });
export type VerifyEmailInput = z.infer<typeof VerifyEmailInput>;

// --- Antworten ----------------------------------------------------------------

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  avatarUrl?: string;
  /** false bei reinen Google-Konten – dann gibt es kein Passwort zu ändern. */
  hasPassword: boolean;
  createdAt: string;
}

export interface CustomerSummary {
  id: string;
  customerNumber: string;
  type: CustomerType;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface MeResponse {
  user: SessionUser;
  customer: CustomerSummary | null;
}

export interface AuthProvidersResponse {
  google: boolean;
}
