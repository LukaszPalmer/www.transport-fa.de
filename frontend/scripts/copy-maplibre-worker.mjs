/**
 * Stellt MapLibre ungebündelt unter public/maplibre/ bereit (vor dev & build).
 * Gebündelt (Turbopack) bleibt die Verbindung zwischen Karte und Web-Worker
 * hängen – Stil und Kacheln werden dann nie fertig. Die Originaldateien aus
 * dem Paket funktionieren zuverlässig und werden per webpackIgnore-Import geladen.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(dirname(createRequire(import.meta.url).resolve("maplibre-gl/package.json")), "dist");
const target = join(root, "public", "maplibre");
mkdirSync(target, { recursive: true });
for (const file of ["maplibre-gl.mjs", "maplibre-gl-shared.mjs", "maplibre-gl-worker.mjs"]) copyFileSync(join(dist, file), join(target, file));
console.log("MapLibre → public/maplibre/");
