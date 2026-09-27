import { z } from "zod";
import { AddressInput, EmailSchema, NewPasswordSchema, PhoneSchema, personName, type PostalAddress } from "./auth";
import { LOCALES, NOTIFICATION_TOPICS, type Locale, type NotificationPreferences } from "./domain";

/** Kunden-Einstellungen: Profil, Zugangsdaten, Benachrichtigungen. */

export const UpdateProfileInput = z.object({
  firstName: personName("Vornamen"),
  lastName: personName("Nachnamen"),
  companyName: z.string().trim().max(200).optional().transform((value) => value || undefined),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .pipe(PhoneSchema.optional()),
  billingAddress: AddressInput,
});
export type UpdateProfileInput = z.input<typeof UpdateProfileInput>;

export const ChangePasswordInput = z
  .object({
    currentPassword: z.string({ error: "Bitte geben Sie Ihr aktuelles Passwort ein." }).min(1, "Bitte geben Sie Ihr aktuelles Passwort ein."),
    newPassword: NewPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"], message: "Die Passwörter stimmen nicht überein." })
  .refine((value) => value.newPassword !== value.currentPassword, { path: ["newPassword"], message: "Das neue Passwort muss sich vom bisherigen unterscheiden." });
export type ChangePasswordInput = z.input<typeof ChangePasswordInput>;

export const ChangeEmailInput = z.object({
  email: EmailSchema,
  /** Pflicht bei Konten mit Passwort; Google-Konten bestätigen per frischer Anmeldung. */
  currentPassword: z.string().max(128).optional(),
});
export type ChangeEmailInput = z.input<typeof ChangeEmailInput>;

export const NotificationPreferencesInput = z.object(
  Object.fromEntries(NOTIFICATION_TOPICS.map((topic) => [topic, z.boolean()])) as Record<(typeof NOTIFICATION_TOPICS)[number], z.ZodBoolean>,
);

/** Sprache des Kundenkontos – bestimmt die Sprache der E-Mails (vom Sprachumschalter gesetzt). */
export const UpdateLocaleInput = z.object({ locale: z.enum(LOCALES) });
export type UpdateLocaleInput = z.infer<typeof UpdateLocaleInput>;

export interface AccountSettings {
  profile: {
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
    billingAddress?: PostalAddress;
    email: string;
    customerNumber: string;
  };
  notifications: NotificationPreferences;
  locale: Locale;
  hasPassword: boolean;
  googleLinked: boolean;
  emailVerified: boolean;
  passwordChangedAt?: string;
}
