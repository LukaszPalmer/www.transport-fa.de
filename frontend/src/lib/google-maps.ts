/**
 * Google Maps (JavaScript API) für den Tracking-App-Screen.
 *
 * - Wird erst nach aktiver Zustimmung geladen (DSGVO: IP-Übertragung an Google).
 * - Route ist vorberechnet (scripts/build-app-map.mjs) → nur „Maps JavaScript
 *   API“ nötig, kein Directions-/Routes-Kontingent.
 * - Kartenstil entspricht den Farben der Website (Navy/Ice Blue).
 */

/** Kartenstil im Website-Design (entspricht der statischen Karte). */
export const brandMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#101b35" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a9bbd" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b132b" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#b4c2dc" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", stylers: [{ visibility: "on" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0f2233" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1b2a4a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#16223e" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#213256" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2e4373" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#344b81" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#08142b" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d5a80" }] },
];

const CALLBACK = "__faGoogleMapsReady";
let loader: Promise<void> | undefined;

/** Lädt die Maps JavaScript API einmalig (async Bootstrap mit importLibrary). */
export function loadGoogleMaps(apiKey: string): Promise<void> {
  // Laut Typdefinition immer vorhanden – zur Laufzeit erst nach dem Laden des Skripts.
  const loaded = (window as { google?: { maps?: { importLibrary?: unknown } } }).google?.maps?.importLibrary;
  if (typeof loaded === "function") return Promise.resolve();

  loader ??= new Promise<void>((resolve, reject) => {
    (window as unknown as Record<string, () => void>)[CALLBACK] = () => resolve();
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      loading: "async",
      language: "de",
      region: "DE",
      callback: CALLBACK,
    });
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => {
      loader = undefined;
      reject(new Error("Google Maps konnte nicht geladen werden."));
    };
    document.head.append(script);
  });

  return loader;
}

/**
 * Zeichnet die Tour: gefahrener Abschnitt (kräftig), Reststrecke (transparent),
 * Startpunkt, Fahrzeug und Ziel. Gibt eine Aufräumfunktion zurück.
 */
export async function drawRouteMap(
  element: HTMLElement,
  latLng: Array<[number, number]>,
  progress: number,
): Promise<() => void> {
  const [{ Map, Polyline }, { LatLngBounds, SymbolPath }] = (await Promise.all([
    google.maps.importLibrary("maps"),
    google.maps.importLibrary("core"),
  ])) as [google.maps.MapsLibrary, google.maps.CoreLibrary];

  const path = latLng.map(([lat, lng]) => ({ lat, lng }));
  const split = Math.max(2, Math.round(path.length * progress));

  const map = new Map(element, {
    disableDefaultUI: true,
    gestureHandling: "none",
    keyboardShortcuts: false,
    clickableIcons: false,
    isFractionalZoomEnabled: true,
    backgroundColor: "#101b35",
    styles: brandMapStyle,
  });

  const bounds = new LatLngBounds();
  path.forEach((point) => bounds.extend(point));
  // Oben Platz für die App-Kopfzeile lassen.
  map.fitBounds(bounds, { top: 118, bottom: 28, left: 36, right: 36 });

  const circle = (fill: string, stroke: string, scale: number): google.maps.Symbol => ({
    path: SymbolPath.CIRCLE,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: stroke,
    strokeWeight: 3,
    scale,
  });
  const destinationPin: google.maps.Symbol = {
    path: "M0 0C-2-8-9-11-9-18a9 9 0 1 1 18 0c0 7-7 10-9 18z",
    fillColor: "#ffffff",
    fillOpacity: 1,
    strokeColor: "#0b132b",
    strokeWeight: 2,
    scale: 1.3,
  };

  const lines = [
    new Polyline({ map, path, strokeColor: "#38bdf8", strokeOpacity: 0.18, strokeWeight: 14, zIndex: 0 }),
    new Polyline({ map, path, strokeColor: "#0b132b", strokeOpacity: 0.9, strokeWeight: 9, zIndex: 1 }),
    new Polyline({
      map,
      path: path.slice(split - 1),
      strokeColor: "#38bdf8",
      strokeOpacity: 0.45,
      strokeWeight: 5,
      zIndex: 2,
      icons: [{ icon: destinationPin, offset: "100%" }],
    }),
    new Polyline({
      map,
      path: path.slice(0, split),
      strokeColor: "#38bdf8",
      strokeOpacity: 1,
      strokeWeight: 5,
      zIndex: 3,
      icons: [
        { icon: circle("#0b132b", "#38bdf8", 6), offset: "0%" },
        { icon: circle("#38bdf8", "#ffffff", 9), offset: "100%" },
      ],
    }),
  ];

  return () => lines.forEach((line) => line.setMap(null));
}
