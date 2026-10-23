import { z } from "zod";

/**
 * Empfänger der Web-Vitals-Beacons (components/analytics/WebVitals.tsx). Schreibt je Messwert eine
 * JSON-Zeile ins Log – in Vercel unter Logs filtern nach `"event":"web-vital"` (Auswertung je Seite:
 * Anteil „poor" bei LCP, INP, CLS). Speichert nichts, gibt keine Daten weiter.
 */
const Metric = z.object({
  name: z.enum(["CLS", "FCP", "FID", "INP", "LCP", "TTFB"]),
  value: z.number().nonnegative().max(600_000),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  path: z.string().max(200).regex(/^\/[^?#]*$/),
  navigationType: z.string().max(30).optional(),
});

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_WEB_VITALS !== "on") return new Response(null, { status: 404 });

  const text = await request.text();
  if (text.length > 1_000) return new Response(null, { status: 413 });

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const metric = Metric.safeParse(payload);
  if (!metric.success) return new Response(null, { status: 400 });

  console.info(JSON.stringify({ event: "web-vital", ...metric.data }));
  return new Response(null, { status: 204 });
}
