"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/client";
import { drawRouteMap, loadGoogleMaps } from "@/lib/google-maps";

interface TrackingPhoneProps {
  /** Statische Basiskarte (echte Geodaten, siehe scripts/build-app-map.mjs). */
  mapImage: string;
  mapAttribution: string;
  /** Server-gerenderte Route (SVG) über der statischen Karte. */
  routeLayer: ReactNode;
  /** Server-gerenderte App-Oberfläche (Statusleiste, Kopfzeile, Bottom-Sheet). */
  children: ReactNode;
  routeLatLng: Array<[number, number]>;
  progress: number;
  /** Ohne Key bleibt es bei der statischen Karte (kein Google-Aufruf). */
  googleMapsApiKey?: string;
}

const CONSENT_KEY = "fa-google-maps-consent";
const noopSubscribe = () => () => {};
const readConsent = () => {
  try {
    return localStorage.getItem(CONSENT_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Smartphone-Mockup der FA Tracking App.
 * Standard: statische Karte im Website-Design (0 Requests an Dritte).
 * Mit API-Key + Zustimmung: echte Google-Maps-Karte (Zwei-Klick-Lösung),
 * die Zustimmung wird lokal gemerkt.
 */
export function TrackingPhone({
  mapImage,
  mapAttribution,
  routeLayer,
  children,
  routeLatLng,
  progress,
  googleMapsApiKey,
}: TrackingPhoneProps) {
  const en = useLocale() === "en";
  const mapRef = useRef<HTMLDivElement>(null);
  const storedConsent = useSyncExternalStore(noopSubscribe, readConsent, () => false);
  const [clickedConsent, setClickedConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");
  const consent = Boolean(googleMapsApiKey) && (clickedConsent || storedConsent);

  useEffect(() => {
    if (!consent || !googleMapsApiKey || !mapRef.current) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    loadGoogleMaps(googleMapsApiKey)
      .then(() => drawRouteMap(mapRef.current!, routeLatLng, progress))
      .then((dispose) => {
        if (cancelled) return dispose();
        cleanup = dispose;
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [consent, googleMapsApiKey, routeLatLng, progress]);

  const acceptGoogleMaps = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch {
      // Ohne Speicher gilt die Zustimmung nur für diesen Seitenaufruf.
    }
    setClickedConsent(true);
  };

  const googleVisible = status === "ready";

  return (
    <div>
      {/* Gehäuse */}
      <div className="relative isolate rounded-[3.25rem] bg-[#0a0f1e] p-[11px] shadow-[0_70px_120px_-50px_rgb(11_19_43/0.7),0_30px_60px_-30px_rgb(11_19_43/0.45)] ring-1 ring-[#29324f]">
        <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] rounded-[3.1rem] ring-1 ring-white/10" />
        <span aria-hidden="true" className="absolute top-28 -left-[3px] h-8 w-[3px] rounded-l bg-[#1b2238]" />
        <span aria-hidden="true" className="absolute top-40 -left-[3px] h-14 w-[3px] rounded-l bg-[#1b2238]" />
        <span aria-hidden="true" className="absolute top-56 -left-[3px] h-14 w-[3px] rounded-l bg-[#1b2238]" />
        <span aria-hidden="true" className="absolute top-44 -right-[3px] h-20 w-[3px] rounded-r bg-[#1b2238]" />

        {/* Display */}
        <div className="relative aspect-[390/844] overflow-hidden rounded-[2.6rem] bg-[#101b35]">
          <Image src={mapImage} alt="" fill sizes="(min-width: 1280px) 340px, (min-width: 640px) 320px, 280px" className="object-cover" />
          <div className={cn("absolute inset-0 transition-opacity duration-700", googleVisible && "opacity-0")}>
            {routeLayer}
          </div>

          {/* Echte Google-Maps-Karte: nur Bereich über dem Bottom-Sheet, damit Logo & Hinweise sichtbar bleiben */}
          {consent && (
            <div
              ref={mapRef}
              className={cn(
                "absolute inset-x-0 top-0 bottom-[43%] transition-opacity duration-700",
                googleVisible ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {!googleVisible && (
            <p className="absolute bottom-[44%] left-3 z-10 mb-1 text-[7px] text-white/40">{mapAttribution}</p>
          )}

          {children}
        </div>
      </div>

      {googleMapsApiKey && !consent && (
        <p className="mx-auto mt-5 max-w-xs text-center text-xs leading-relaxed text-slate-500">
          {en ? "View the sample route on Google Maps? This transfers data to Google." : "Beispielroute auf Google Maps ansehen? Dabei werden Daten an Google übertragen."}{" "}
          <button
            type="button"
            onClick={acceptGoogleMaps}
            className="font-semibold text-accent-ink underline underline-offset-4"
          >
            {en ? "Load Google Maps" : "Google Maps laden"}
          </button>
        </p>
      )}
      {status === "error" && (
        <p className="mt-5 text-center text-xs text-slate-500">{en ? "Google Maps is currently unavailable." : "Google Maps ist gerade nicht erreichbar."}</p>
      )}
    </div>
  );
}
