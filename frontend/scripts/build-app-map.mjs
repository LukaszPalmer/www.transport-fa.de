#!/usr/bin/env node
/**
 * Karten-Generator für die Tracking-App-Sektion
 * ---------------------------------------------
 * Erzeugt aus echten Geodaten eine statische Karte im Design der Website:
 *   - Route:   OSRM (OpenStreetMap-Routing) zwischen Start und Ziel
 *   - Karte:   OpenFreeMap-Vektorkacheln (Straßen, Wasser, Parks, Stadtteile)
 *
 * Ausgabe:
 *   public/media/app/route-map.png        Basiskarte @2x (next/image liefert AVIF/WebP, ~30 KB)
 *   src/content/app-map.generated.ts      Route (SVG-Pfad + Koordinaten), Beschriftungen
 *
 * Die Koordinaten passen exakt zum App-Screen (390 × 844). Dieselbe Route
 * zeichnet die echte Google-Maps-Karte, sobald ein API-Key hinterlegt ist.
 *
 * Aufruf:  npm run build:app-map
 * Daten:   © OpenStreetMap-Mitwirkende (ODbL), © OpenMapTiles
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const USER_AGENT = "FA-Transport-Website/1.0 (build-app-map)";

/* ---------------------------------------------------------------- Konfiguration */
const ROUTE = {
  origin: { lat: 53.523, lng: 10.02 }, // Hamburg-Veddel (Logistikstandort)
  destination: { lat: 53.576, lng: 9.953 }, // Hamburg-Eimsbüttel
};
const CANVAS = { width: 390, height: 844 };
/** Bereich des Screens, in den die Route eingepasst wird (über dem Bottom-Sheet). */
const ROUTE_FRAME = { x0: 60, y0: 196, x1: 330, y1: 432 };
const ZOOM = 13;

const STYLE = {
  land: "#101b35",
  water: "#08142b",
  park: "#0f2233",
  roads: {
    minor: { color: "#16223e", width: 0.8 },
    tertiary: { color: "#1b2a4a", width: 1.2 },
    secondary: { color: "#213256", width: 1.7 },
    primary: { color: "#283b64", width: 2.3 },
    trunk: { color: "#2e4373", width: 2.8 },
    motorway: { color: "#344b81", width: 3.3 },
  },
};

/* ---------------------------------------------------------------- Projektion */
const mercX = (lng) => (lng + 180) / 360;
const mercY = (lat) => {
  const rad = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2;
};

/* ---------------------------------------------------------------- Hilfsfunktionen */
async function fetchOk(url, init) {
  const response = await fetch(url, { ...init, headers: { "User-Agent": USER_AGENT, ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

/** Douglas-Peucker-Vereinfachung (Toleranz in Pixeln). */
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const sq = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let index = 0;
    const [ax, ay] = points[first];
    const [bx, by] = points[last];
    const dx = bx - ax;
    const dy = by - ay;
    const len = dx * dx + dy * dy || 1;
    for (let i = first + 1; i < last; i++) {
      const [px, py] = points[i];
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
      const ex = ax + t * dx - px;
      const ey = ay + t * dy - py;
      const dist = ex * ex + ey * ey;
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }
    if (maxDist > sq) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const r1 = (n) => Math.round(n * 10) / 10;
const toPath = (points, close = false) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)} ${r1(y)}`).join("") + (close ? "Z" : "");

const inCanvas = (points, margin = 30) =>
  points.some(([x, y]) => x > -margin && x < CANVAS.width + margin && y > -margin && y < CANVAS.height + margin);

/* ---------------------------------------------------------------- 1. Route */
const { origin, destination } = ROUTE;
const osrmUrl =
  `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
  "?overview=full&geometries=geojson";
const osrm = await (await fetchOk(osrmUrl)).json();
const routeLngLat = osrm.routes[0].geometry.coordinates;
console.log(`Route: ${(osrm.routes[0].distance / 1000).toFixed(1)} km, ${routeLngLat.length} Punkte`);

// Projektion so wählen, dass die Route exakt in ROUTE_FRAME passt.
const worldRoute = routeLngLat.map(([lng, lat]) => [mercX(lng), mercY(lat)]);
const minX = Math.min(...worldRoute.map((p) => p[0]));
const maxX = Math.max(...worldRoute.map((p) => p[0]));
const minY = Math.min(...worldRoute.map((p) => p[1]));
const maxY = Math.max(...worldRoute.map((p) => p[1]));
const frameW = ROUTE_FRAME.x1 - ROUTE_FRAME.x0;
const frameH = ROUTE_FRAME.y1 - ROUTE_FRAME.y0;
const scale = Math.min(frameW / (maxX - minX), frameH / (maxY - minY));
const offsetX = (ROUTE_FRAME.x0 + ROUTE_FRAME.x1) / 2 - ((minX + maxX) / 2) * scale;
const offsetY = (ROUTE_FRAME.y0 + ROUTE_FRAME.y1) / 2 - ((minY + maxY) / 2) * scale;
const project = ([wx, wy]) => [wx * scale + offsetX, wy * scale + offsetY];

const routeCanvas = simplify(worldRoute.map(project), 0.3);
const metersPerPixel = (40075016 * Math.cos((origin.lat * Math.PI) / 180)) / scale;
console.log(`Maßstab: ${(1000 / metersPerPixel).toFixed(1)} px/km`);

/* ---------------------------------------------------------------- 2. Kacheln */
const tileJson = await (await fetchOk("https://tiles.openfreemap.org/planet")).json();
const tileTemplate = tileJson.tiles[0];
const unproject = (x, y) => [(x - offsetX) / scale, (y - offsetY) / scale];
const [wx0, wy0] = unproject(-20, -20);
const [wx1, wy1] = unproject(CANVAS.width + 20, CANVAS.height * 0.62);
const n = 2 ** ZOOM;
const tiles = [];
for (let tx = Math.floor(wx0 * n); tx <= Math.floor(wx1 * n); tx++) {
  for (let ty = Math.floor(wy0 * n); ty <= Math.floor(wy1 * n); ty++) tiles.push([tx, ty]);
}
console.log(`Kacheln: ${tiles.length} (z${ZOOM})`);

const layers = { water: [], park: [], roads: Object.fromEntries(Object.keys(STYLE.roads).map((k) => [k, []])), labels: [] };

const roadClass = (cls) =>
  ({ motorway: "motorway", trunk: "trunk", primary: "primary", secondary: "secondary", tertiary: "tertiary", minor: "minor" })[cls];

async function processTile([tx, ty]) {
  const url = tileTemplate.replace("{z}", ZOOM).replace("{x}", tx).replace("{y}", ty);
  const buffer = new Uint8Array(await (await fetchOk(url)).arrayBuffer());
  const tile = new VectorTile(new PbfReader(buffer));
  const toCanvas = (extent) => (pt) => project([(tx + pt.x / extent) / n, (ty + pt.y / extent) / n]);

  const each = (name, fn) => {
    const layer = tile.layers[name];
    if (!layer) return;
    const conv = toCanvas(layer.extent);
    for (let i = 0; i < layer.length; i++) {
      const feature = layer.feature(i);
      fn(feature, feature.loadGeometry().map((ring) => ring.map(conv)));
    }
  };

  each("water", (_, rings) => rings.forEach((ring) => inCanvas(ring) && layers.water.push(toPath(simplify(ring, 0.7), true))));
  each("park", (_, rings) => rings.forEach((ring) => inCanvas(ring) && layers.park.push(toPath(simplify(ring, 0.8), true))));
  each("landcover", (feature, rings) => {
    if (!["wood", "grass"].includes(feature.properties.class)) return;
    rings.forEach((ring) => inCanvas(ring) && layers.park.push(toPath(simplify(ring, 0.8), true)));
  });
  each("transportation", (feature, lines) => {
    const cls = roadClass(feature.properties.class);
    if (!cls || feature.properties.brunnel === "tunnel") return;
    lines.forEach((line) => inCanvas(line) && layers.roads[cls].push(toPath(simplify(line, cls === "minor" ? 0.7 : 0.5))));
  });
  each("place", (feature, points) => {
    const { class: cls } = feature.properties;
    const name = feature.properties["name:de"] || feature.properties.name;
    if (!name || !["suburb", "quarter"].includes(cls)) return;
    const [x, y] = points[0][0];
    layers.labels.push({ text: name, x: r1(x), y: r1(y), kind: "district" });
  });
  each("water_name", (feature, points) => {
    const name = feature.properties["name:de"] || feature.properties.name;
    if (!name || feature.type !== 1) return;
    const [x, y] = points[0][0];
    layers.labels.push({ text: name, x: r1(x), y: r1(y), kind: "water" });
  });
}

for (let i = 0; i < tiles.length; i += 6) {
  await Promise.all(tiles.slice(i, i + 6).map(processTile));
}

/* ---------------------------------------------------------------- 3. Karte rendern */
const roadGroups = Object.entries(STYLE.roads)
  .map(([cls, { color, width }]) =>
    layers.roads[cls].length
      ? `<path d="${layers.roads[cls].join("")}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
      : "",
  )
  .join("");

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" width="${CANVAS.width}" height="${CANVAS.height}">` +
  `<rect width="100%" height="100%" fill="${STYLE.land}"/>` +
  `<path d="${layers.park.join("")}" fill="${STYLE.park}" fill-rule="nonzero"/>` +
  `<path d="${layers.water.join("")}" fill="${STYLE.water}" fill-rule="nonzero"/>` +
  roadGroups +
  `</svg>`;

// Als PNG @2x rastern: Das Vektor-SVG wäre ~450 KB groß, das Raster liefert
// next/image als AVIF/WebP in passender Breite aus (~30 KB).
const pngFile = join(ROOT, "public", "media", "app", "route-map.png");
mkdirSync(dirname(pngFile), { recursive: true });
const png = await sharp(Buffer.from(svg), { density: 144 })
  .resize(CANVAS.width * 2, CANVAS.height * 2)
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toBuffer();
writeFileSync(pngFile, png);
console.log(`✓ ${pngFile.replace(ROOT, ".")} (${Math.round(png.length / 1024)} KB, Quelle für AVIF/WebP)`);

/* ---------------------------------------------------------------- 4. Daten-Modul */
// Beschriftungen: nur im sichtbaren Kartenbereich, dedupliziert, mit Mindestabstand.
const seen = new Set();
const labels = [];
for (const label of layers.labels.sort((a, b) => (a.kind === "water" ? -1 : 1) - (b.kind === "water" ? -1 : 1))) {
  if (seen.has(label.text) || label.x < 24 || label.x > 366 || label.y < 150 || label.y > 452) continue;
  if (labels.some((other) => Math.hypot(other.x - label.x, other.y - label.y) < 62)) continue;
  seen.add(label.text);
  labels.push(label);
}

const routeLatLng = simplify(routeLngLat.map(([lng, lat]) => [lng, lat]), 0.00008).map(([lng, lat]) => [
  Math.round(lat * 1e5) / 1e5,
  Math.round(lng * 1e5) / 1e5,
]);

const moduleSource = `// Generiert von scripts/build-app-map.mjs – nicht manuell bearbeiten.
// Kartendaten: © OpenStreetMap-Mitwirkende (ODbL), © OpenMapTiles. Routing: OSRM.

export const appMap = {
  image: "/media/app/route-map.png",
  width: ${CANVAS.width},
  height: ${CANVAS.height},
  route: {
    path: "${toPath(routeCanvas)}",
    origin: { x: ${r1(routeCanvas[0][0])}, y: ${r1(routeCanvas[0][1])} },
    destination: { x: ${r1(routeCanvas.at(-1)[0])}, y: ${r1(routeCanvas.at(-1)[1])} },
    /** Koordinaten [lat, lng] für die Google-Maps-Polyline. */
    latLng: ${JSON.stringify(routeLatLng)} as Array<[number, number]>,
  },
  labels: ${JSON.stringify(labels, null, 2).replace(/\n/g, "\n  ")} as Array<{ text: string; x: number; y: number; kind: "district" | "water" }>,
  attribution: "© OpenStreetMap-Mitwirkende",
};
`;
const moduleFile = join(ROOT, "src", "content", "app-map.generated.ts");
writeFileSync(moduleFile, moduleSource);
console.log(`✓ ${moduleFile.replace(ROOT, ".")} (${routeCanvas.length} Routenpunkte, ${labels.length} Beschriftungen)`);
