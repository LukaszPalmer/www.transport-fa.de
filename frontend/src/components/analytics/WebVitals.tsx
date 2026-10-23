"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Real User Monitoring der Core Web Vitals (LCP, INP, CLS sowie FCP, TTFB): je Messwert ein kleiner,
 * anonymer Beacon an /api/vitals – Name, Wert, Bewertung, Seitenpfad. Keine Cookies, keine Kennungen.
 * Aktiv nur mit NEXT_PUBLIC_WEB_VITALS=on (vorher die Datenschutzerklärung ergänzen, siehe .env.example).
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: window.location.pathname,
      navigationType: metric.navigationType,
    });
    if (!navigator.sendBeacon?.("/api/vitals", body)) {
      fetch("/api/vitals", { method: "POST", body, keepalive: true }).catch(() => undefined);
    }
  });
  return null;
}
