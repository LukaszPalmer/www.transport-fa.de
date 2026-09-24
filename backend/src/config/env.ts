import { existsSync } from "node:fs";
import { z } from "zod";

/**
 * Umgebungsvariablen – beim Start einmal validiert (fail fast).
 * Lokal aus backend/.env, auf Railway aus den Service-Variablen.
 * Neue Integrationen (R2, Resend, Google …) ergänzen ihr Schema hier,
 * sobald das jeweilige Modul gebaut wird.
 */
if (process.env.NODE_ENV !== "production" && existsSync(".env")) {
  process.loadEnvFile(".env");
}

const csv = z
  .string()
  .optional()
  .transform((value) => (value ? value.split(",").map((item) => item.trim()).filter(Boolean) : []));

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  /** Öffentliche Frontend-URL: Links in E-Mails, erlaubter CORS-Origin. */
  FRONTEND_URL: z.url().default("http://localhost:3000"),
  /** Öffentliche API-URL: OAuth-Callback und Links auf die API. */
  API_PUBLIC_URL: z.url().default("http://localhost:4000"),
  /** Zusätzliche erlaubte Origins (kommagetrennt), z. B. Staging. */
  CORS_ORIGINS: csv,
  /** Cookie-Domain für www + api (Produktion: transport-fa.de). Lokal leer lassen. */
  COOKIE_DOMAIN: z.string().optional(),

  MONGODB_URI: z
    .string({ error: "MONGODB_URI fehlt – Verbindungs-URI aus MongoDB Atlas in backend/.env eintragen." })
    .regex(/^mongodb(\+srv)?:\/\//, "MONGODB_URI muss mit mongodb:// oder mongodb+srv:// beginnen"),
  MONGODB_DB_NAME: z.string().min(1).default("fa-transport"),

  R2_ACCOUNT_ID: z
    .string({ error: "R2_ACCOUNT_ID fehlt – Cloudflare → R2 → Account Details." })
    .regex(/^[a-f0-9]{32}$/, "R2_ACCOUNT_ID muss die 32-stellige Cloudflare Account ID sein"),
  R2_ACCESS_KEY_ID: z.string({ error: "R2_ACCESS_KEY_ID fehlt – aus dem R2-API-Token." }).min(1),
  R2_SECRET_ACCESS_KEY: z.string({ error: "R2_SECRET_ACCESS_KEY fehlt – aus dem R2-API-Token." }).min(1),
  R2_BUCKET: z.string().min(3).default("fa-transport-documents"),
  /** Bucket-Jurisdiktion bestimmt den Endpoint – "eu" hält alle Daten in der EU. */
  R2_JURISDICTION: z.enum(["eu", "default"]).default("eu"),

  /** Optional: ohne beide Werte ist die Google-Anmeldung deaktiviert. */
  GOOGLE_CLIENT_ID: z.string().endsWith(".apps.googleusercontent.com", "GOOGLE_CLIENT_ID sieht nicht nach einer Google-Client-ID aus").optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  // Leere Zeilen wie `KEY=` gelten als nicht gesetzt → Defaults bzw. klare Fehlermeldung greifen.
  const defined = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));
  const parsed = EnvSchema.safeParse(defined);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`).join("\n");
    console.error(`\n✖ Ungültige Umgebungsvariablen:\n${issues}\n`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
export const isProduction = env.NODE_ENV === "production";

/** Google-Anmeldung – nur aktiv, wenn Client-ID und Schlüssel gesetzt sind. */
export const googleOAuth =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: new URL("/api/v1/auth/google/callback", env.API_PUBLIC_URL).toString(),
      }
    : null;

/** Alle Origins, die mit Cookies auf die API zugreifen dürfen. */
export const allowedOrigins = [...new Set([new URL(env.FRONTEND_URL).origin, ...env.CORS_ORIGINS])];
