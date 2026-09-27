import { z } from "zod";
import { LOCALES, type CustomerType, type Role } from "./domain";

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

export const EmailSchema = z
  .string({ error: "Bitte geben Sie Ihre E-Mail-Adresse ein." })
  .trim()
  .toLowerCase()
  .max(254, "Die E-Mail-Adresse ist zu lang.")
  .pipe(z.email("Bitte geben Sie eine gültige E-Mail-Adresse ein."));
const email = EmailSchema;

export const NewPasswordSchema = z
  .string({ error: "Bitte wählen Sie ein Passwort." })
  .min(PASSWORD_MIN_LENGTH, `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`)
  .max(PASSWORD_MAX_LENGTH, `Höchstens ${PASSWORD_MAX_LENGTH} Zeichen.`);
const newPassword = NewPasswordSchema;

export const personName = (label: string) =>
  z.string({ error: `Bitte geben Sie Ihren ${label} ein.` }).trim().min(1, `Bitte geben Sie Ihren ${label} ein.`).max(100);

/** „E-Mail bereits vergeben" – identisch in API (409) und Formular. */
export const EMAIL_TAKEN_MESSAGE = "E-Mail-Adresse wird bereits verwendet.";

/**
 * Telefonnummer international normalisieren: „+49 170 1234567", „0049 170-1234567"
 * → „+491701234567" (E.164). Ohne Ländervorwahl ungültig.
 */
export function normalizePhone(input: string): string {
  const compact = input.trim().replace(/[\s\-/().]/g, "");
  return compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
}

export const PhoneSchema = z
  .string({ error: "Bitte geben Sie eine Telefonnummer ein." })
  .transform(normalizePhone)
  .pipe(z.string().regex(/^\+[1-9]\d{6,14}$/, "Bitte mit internationaler Vorwahl angeben, z. B. +49 170 1234567."));

/** Länder der Adressauswahl (ISO 3166-1 alpha-2) – Namen liefert Intl.DisplayNames in der Sprache der Seite. */
export const COUNTRY_CODES = [
  "DE", "AT", "BE", "BG", "CH", "CY", "CZ", "DK", "EE", "ES", "FI", "FR", "GB", "GR", "HR", "HU", "IE", "IS",
  "IT", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK",
] as const;

/**
 * Anschrift des Kunden (Rechnungsadresse) – Pflicht bei Registrierung und im Profil,
 * damit das Büro jederzeit Rechnungen, Aufträge und Belege ausstellen kann.
 */
export const AddressInput = z
  .object({
    line1: z
      .string({ error: "Bitte geben Sie Straße und Hausnummer ein." })
      .trim()
      .min(3, "Bitte geben Sie Straße und Hausnummer ein.")
      .max(200, "Höchstens 200 Zeichen."),
    line2: z.string().trim().max(200, "Höchstens 200 Zeichen.").optional().transform((value) => value || undefined),
    postalCode: z.string({ error: "Bitte geben Sie die PLZ ein." }).trim().min(3, "Bitte geben Sie die PLZ ein.").max(12, "Höchstens 12 Zeichen."),
    city: z.string({ error: "Bitte geben Sie den Ort ein." }).trim().min(2, "Bitte geben Sie den Ort ein.").max(100, "Höchstens 100 Zeichen."),
    countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Bitte wählen Sie ein Land.").default("DE"),
  }, { error: "Bitte geben Sie Ihre Anschrift ein." })
  .refine((address) => address.countryCode !== "DE" || /^\d{5}$/.test(address.postalCode), {
    path: ["postalCode"],
    message: "Bitte geben Sie eine gültige PLZ ein (5 Ziffern).",
  });
export type AddressInput = z.input<typeof AddressInput>;
export type PostalAddress = z.output<typeof AddressInput>;

const token = z.string().min(20, "Der Link ist unvollständig.").max(200);

export const RegisterInput = z.object({
  firstName: personName("Vornamen"),
  lastName: personName("Nachnamen"),
  companyName: z.string().trim().max(200, "Höchstens 200 Zeichen.").optional().transform((value) => value || undefined),
  billingAddress: AddressInput,
  email,
  password: newPassword,
  acceptPrivacy: z.literal(true, { error: "Bitte stimmen Sie der Datenschutzerklärung zu." }),
  /** Sprache der Website bei der Registrierung – für E-Mails an den Kunden. */
  locale: z.enum(LOCALES).optional(),
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
  /** false bei Google-Konten ohne Adresse – das Portal fordert sie dann an. */
  hasBillingAddress: boolean;
}

export interface MeResponse {
  user: SessionUser;
  customer: CustomerSummary | null;
}

export interface AuthProvidersResponse {
  google: boolean;
}
