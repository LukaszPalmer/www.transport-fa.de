import "server-only";
import type { CreateLeadInput } from "@fa/shared";

/**
 * Anfrage aus dem Kontaktformular zusätzlich ins CRM (Admin → Anfragen) übernehmen.
 * Best Effort: Die E-Mail an das Büro ist der verbindliche Weg – scheitert die API, geht nichts verloren.
 */
const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function forwardLead(lead: CreateLeadInput): Promise<string | undefined> {
  const token = process.env.LEAD_INGEST_TOKEN;
  if (!token && process.env.NODE_ENV === "production") {
    console.warn("LEAD_INGEST_TOKEN fehlt – Anfrage nur per E-Mail zugestellt.");
    return undefined;
  }
  try {
    const response = await fetch(`${API_URL}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { "x-lead-token": token } : {}) },
      body: JSON.stringify(lead),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`Anfrage konnte nicht ins CRM übernommen werden (HTTP ${response.status}).`);
      return undefined;
    }
    return ((await response.json()) as { number?: string }).number;
  } catch (error) {
    console.error("Anfrage konnte nicht ins CRM übernommen werden:", error);
    return undefined;
  }
}
