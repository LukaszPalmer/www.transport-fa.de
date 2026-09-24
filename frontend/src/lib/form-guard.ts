import "server-only";
import { headers } from "next/headers";

/**
 * Spam- und Missbrauchsschutz für öffentliche Formulare – ohne Captcha
 * (kein Tracking, keine Einwilligung nötig):
 * 1. Honeypot-Feld, das Menschen nicht sehen
 * 2. Mindest-Ausfüllzeit (Bots senden sofort ab)
 * 3. Rate-Limit pro IP (In-Memory; bei mehreren Instanzen Redis o. Ä. nutzen)
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MIN_FILL_MS = 2500;
const hits = new Map<string, number[]>();

export const HONEYPOT_FIELD = "website";
export const STARTED_AT_FIELD = "startedAt";

export type GuardResult = "ok" | "spam" | "rate-limited";

export async function guardSubmission(formData: FormData, scope: string): Promise<GuardResult> {
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") return "spam";

  const startedAt = Number(formData.get(STARTED_AT_FIELD));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) return "spam";

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return "rate-limited";
  recent.push(now);
  hits.set(key, recent);
  return "ok";
}
