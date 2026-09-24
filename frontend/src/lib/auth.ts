import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { NodeSqliteDialect } from "@better-auth/kysely-adapter/node-sqlite-dialect";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { nextCookies } from "better-auth/next-js";
import { company } from "@/content/company";
import { sendMail } from "./mail";

/**
 * Kundenportal-Authentifizierung (Better Auth).
 *
 * - E-Mail + Passwort (scrypt-Hashing, Mindestlänge 10)
 * - Google-Anmeldung, sobald GOOGLE_CLIENT_ID/SECRET gesetzt sind
 * - Passwort-Reset & E-Mail-Bestätigung per Mail (lib/mail.ts)
 * - Sitzungen als httpOnly-Cookies, Rate-Limiting & CSRF-Schutz integriert
 *
 * Datenbank: SQLite über das in Node 24 eingebaute `node:sqlite` (kein
 * natives Modul nötig). Für serverlose Hosts (Vercel etc.) stattdessen
 * Postgres übergeben: `database: new Pool({ connectionString })`.
 */
const databaseFile = process.env.AUTH_DATABASE_PATH || path.join(process.cwd(), ".data", "auth.sqlite");
mkdirSync(path.dirname(databaseFile), { recursive: true });

export const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: `${company.name} Kundenportal`,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // Dialekt explizit übergeben: Die automatische Erkennung von `node:sqlite`
  // nutzt einen dynamischen Import, den der Next.js-Bundler nicht auflösen kann.
  database: { dialect: new NodeSqliteDialect({ database: new DatabaseSync(databaseFile) }), type: "sqlite" },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: `Passwort zurücksetzen – ${company.name} Kundenportal`,
        text:
          `Hallo ${user.name},\n\nSie haben das Zurücksetzen Ihres Passworts angefordert. ` +
          `Der folgende Link ist 60 Minuten gültig:\n\n${url}\n\n` +
          `Falls Sie das nicht waren, können Sie diese E-Mail ignorieren – Ihr Passwort bleibt unverändert.\n\n` +
          `Ihr Team von ${company.legalName}`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: `Bitte bestätigen Sie Ihre E-Mail-Adresse – ${company.name}`,
        text:
          `Hallo ${user.name},\n\nwillkommen im Kundenportal von ${company.name}! ` +
          `Bitte bestätigen Sie Ihre E-Mail-Adresse über diesen Link:\n\n${url}\n\n` +
          `Ihr Team von ${company.legalName}`,
      });
    },
  },

  socialProviders: googleAuthEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          prompt: "select_account",
        },
      }
    : undefined,

  session: {
    expiresIn: 60 * 60 * 24 * 14, // 14 Tage
    updateAge: 60 * 60 * 24, // Verlängerung höchstens 1× täglich
  },

  // Muss das letzte Plugin sein: setzt Cookies auch aus Server Actions.
  plugins: [nextCookies()],
});

let schemaReady: Promise<void> | undefined;

/**
 * Legt fehlende Tabellen/Spalten beim ersten Zugriff an (idempotent).
 * In Produktion alternativ vorab per `npx @better-auth/cli migrate`.
 */
export function ensureAuthSchema(): Promise<void> {
  schemaReady ??= getMigrations(auth.options).then(({ runMigrations }) => runMigrations());
  return schemaReady;
}
