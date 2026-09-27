"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { LngLat, ShipmentLive, StopView } from "@fa/shared";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/client";
import { defineMessages, type Locale } from "@/i18n/config";
import { apiRequest } from "@/lib/api/client";
import { decodePolyline } from "@/lib/polyline";
import { formatDateTime } from "@/lib/portal-format";

const MAP_STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/positron";

/**
 * MapLibre ungebündelt aus public/maplibre/ laden (siehe scripts/copy-maplibre-worker.mjs):
 * Vom Bundler verpackt, bleibt die Kommunikation mit dem Karten-Worker hängen.
 */
const MAPLIBRE_URL = "/maplibre/maplibre-gl.mjs";
const loadMapLibre = () => import(/* webpackIgnore: true */ MAPLIBRE_URL) as Promise<typeof import("maplibre-gl")>;

const POLL_INTERVAL_MS = 20_000;
const ACCENT = "#38bdf8";
const NAVY = "#0b132b";

interface LiveTrackingMapProps {
  shipmentId: string;
  pickup: StopView;
  delivery: StopView;
  routePolyline?: string;
  initialLive: ShipmentLive;
}

function stopMarker(label: string, filled: boolean): HTMLElement {
  const element = document.createElement("div");
  element.setAttribute("aria-hidden", "true");
  element.style.cssText = `width:30px;height:30px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font:700 13px/1 system-ui,sans-serif;box-shadow:0 4px 12px rgb(11 19 43/.3);border:3px solid ${filled ? NAVY : ACCENT};background:${filled ? NAVY : "#fff"};color:${filled ? "#fff" : NAVY}`;
  element.textContent = label;
  return element;
}

function truckMarker(): HTMLElement {
  const element = document.createElement("div");
  element.setAttribute("aria-hidden", "true");
  element.innerHTML = `<span style="position:absolute;inset:-10px;border-radius:9999px;background:${ACCENT};opacity:.35;animation:fa-ping 2s cubic-bezier(0,0,.2,1) infinite"></span>
<span style="position:relative;display:flex;width:40px;height:40px;border-radius:9999px;background:${ACCENT};border:3px solid #fff;box-shadow:0 6px 18px rgb(11 19 43/.35);align-items:center;justify-content:center">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${NAVY}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></span>`;
  element.style.cssText = "position:relative;width:40px;height:40px";
  return element;
}

const messages = defineMessages({
  de: {
    justNow: "gerade eben",
    minutesAgo: (minutes: number) => `vor ${minutes} Min.`,
    hoursAgo: (hours: number) => `vor ${hours} Std.`,
    mapLabel: "Karte der Sendungsverfolgung",
    mapError: "Die Karte kann in diesem Browser nicht angezeigt werden. Alle Angaben zur Sendung finden Sie unten.",
    livePosition: "Live-Position",
    updated: (when: string) => `Aktualisiert ${when}`,
    updating: "Wird aktualisiert",
    arrival: (time: string) => ` · Ankunft ca. ${time}`,
    soon: "Der Fahrer ist unterwegs – die Position erscheint in Kürze.",
    notYet: "Die Live-Position erscheint, sobald der Fahrer zu Ihnen unterwegs ist.",
  },
  en: {
    justNow: "just now",
    minutesAgo: (minutes: number) => `${minutes} min ago`,
    hoursAgo: (hours: number) => `${hours} h ago`,
    mapLabel: "Shipment tracking map",
    mapError: "The map can't be displayed in this browser. You'll find all shipment details below.",
    livePosition: "Live position",
    updated: (when: string) => `Updated ${when}`,
    updating: "Updating",
    arrival: (time: string) => ` · Arrival approx. ${time}`,
    soon: "The driver is on the way – the position will appear shortly.",
    notYet: "The live position appears as soon as the driver is on the way to you.",
  },
});

function relativeTime(iso: string | undefined, now: number, locale: Locale): string | undefined {
  if (!iso) return undefined;
  const t = messages[locale];
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minutesAgo(minutes);
  return t.hoursAgo(Math.round(minutes / 60));
}

/**
 * Live-Karte der Sendungsverfolgung (MapLibre). Holt die LKW-Position regelmäßig
 * neu, solange die Sendung verfolgbar ist – pausiert im Hintergrund-Tab.
 */
export function LiveTrackingMap({ shipmentId, pickup, delivery, routePolyline, initialLive }: LiveTrackingMapProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = messages[locale];
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const truckRef = useRef<Marker | null>(null);
  const [live, setLive] = useState(initialLive);
  const [now, setNow] = useState(() => Date.now());
  const [mapError, setMapError] = useState(false);

  // Karte einmalig aufbauen
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const maplibre = await loadMapLibre();
      if (cancelled) return;

      let map: MapLibreMap;
      try {
        map = new maplibre.Map({
          container,
          style: MAP_STYLE,
          center: initialLive.position ?? pickup.location ?? [10.45, 51.16],
          zoom: 6,
          attributionControl: { compact: true },
          cooperativeGestures: true,
        });
      } catch {
        setMapError(true); // z. B. WebGL nicht verfügbar
        return;
      }
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      const bounds = new maplibre.LngLatBounds();
      const routePoints = routePolyline ? decodePolyline(routePolyline) : [];
      routePoints.forEach((point) => bounds.extend(point));

      if (pickup.location) {
        new maplibre.Marker({ element: stopMarker("A", true) }).setLngLat(pickup.location).addTo(map);
        bounds.extend(pickup.location);
      }
      if (delivery.location) {
        new maplibre.Marker({ element: stopMarker("B", false) }).setLngLat(delivery.location).addTo(map);
        bounds.extend(delivery.location);
      }
      if (initialLive.position) {
        truckRef.current = new maplibre.Marker({ element: truckMarker() }).setLngLat(initialLive.position).addTo(map);
        bounds.extend(initialLive.position);
      }

      map.on("load", () => {
        if (routePoints.length > 1) {
          map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routePoints } } });
          map.addLayer({ id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 9 } });
          map.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ACCENT, "line-width": 5 } });
        }
        if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 0 });
      });
      // Einzelne Kachelfehler nicht eskalieren – in der Entwicklung aber sichtbar machen.
      map.on("error", (event) => {
        if (process.env.NODE_ENV !== "production") console.warn("[Karte]", event.error?.message ?? event);
      });
    })().catch(() => setMapError(true));

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      truckRef.current = null;
    };
    // Karte nur beim ersten Rendern aufbauen – Live-Updates laufen separat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position regelmäßig abfragen, solange verfolgbar (pausiert im Hintergrund-Tab)
  useEffect(() => {
    if (!live.trackable) return;
    let timer: ReturnType<typeof setInterval> | undefined;

    const poll = async () => {
      try {
        const next = await apiRequest<ShipmentLive>(`/portal/shipments/${shipmentId}/live`);
        setLive(next);
        if (next.position) moveTruck(next.position);
        if (next.status !== live.status) router.refresh(); // Status gewechselt → Seite neu laden
      } catch {
        // Netzwerkfehler still ignorieren – nächster Versuch folgt
      }
    };
    const moveTruck = (position: LngLat) => {
      if (truckRef.current) truckRef.current.setLngLat(position);
      else if (mapRef.current) {
        void loadMapLibre().then(({ Marker }) => {
          if (mapRef.current) truckRef.current = new Marker({ element: truckMarker() }).setLngLat(position).addTo(mapRef.current);
        });
      }
    };
    const start = () => {
      clearInterval(timer);
      timer = setInterval(poll, POLL_INTERVAL_MS);
    };
    const onVisibility = () => {
      if (document.hidden) clearInterval(timer);
      else {
        void poll();
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [live.trackable, live.status, shipmentId, router]);

  // „vor x Min." aktuell halten
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, []);

  const updated = relativeTime(live.positionAt, now, locale);

  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-slate-100 shadow-card ring-1 ring-primary/5">
      <style>{`@keyframes fa-ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
      <div ref={containerRef} className="h-[380px] w-full sm:h-[460px]" role="region" aria-label={t.mapLabel} />

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-600">
          {t.mapError}
        </div>
      )}

      <div className="pointer-events-none absolute top-4 left-4 max-w-[70%] rounded-2xl bg-white/95 px-4 py-3 shadow-card ring-1 ring-primary/5 backdrop-blur">
        {live.trackable && live.position ? (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              {t.livePosition}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {updated ? t.updated(updated) : t.updating}
              {live.etaAt && t.arrival(formatDateTime(live.etaAt, locale))}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-600">
            {live.trackable ? t.soon : t.notYet}
          </p>
        )}
      </div>
    </div>
  );
}
