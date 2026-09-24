#!/usr/bin/env node
/**
 * Hero-Video-Pipeline
 * -------------------
 * Erzeugt aus einem Rohclip (z. B. 4K-Drohnenaufnahme) alle Assets, die die
 * Hero-Sektion erwartet – nahtlos loopend, ohne Audiospur, web-optimiert:
 *
 *   public/media/hero/hero-1080.webm   VP9,   1920×1080  (Desktop, bevorzugt)
 *   public/media/hero/hero-1080.mp4    H.264, 1920×1080  (Desktop, Fallback/Safari)
 *   public/media/hero/hero-720.webm    VP9,   1280×720   (Mobile, bevorzugt)
 *   public/media/hero/hero-720.mp4     H.264, 1280×720   (Mobile, Fallback)
 *   public/media/hero/poster.jpg       erstes Loop-Frame (LCP-Bild, via next/image)
 *
 * Nahtloser Loop: Der Clip-Anfang wird per Crossfade in das Clip-Ende geblendet.
 * Das letzte Frame entspricht damit exakt dem ersten – kein sichtbarer Sprung.
 *
 * Aufruf:
 *   npm run encode:hero -- <input.mp4> [--out hero] [--start 0] [--duration 5.2] [--crossfade 1]
 *
 * --out bestimmt den Zielordner unter public/media/ (z. B. "umzuege" für die
 * Leistungsseite). Dateinamen bleiben identisch, damit Inhalte nur den Ordner referenzieren.
 *
 * ffmpeg wird aus dem PATH verwendet oder über die Umgebungsvariable FFMPEG_PATH.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: "string", default: "hero" },
    start: { type: "string", default: "0" },
    duration: { type: "string", default: "8" },
    crossfade: { type: "string", default: "1" },
    fps: { type: "string", default: "24" },
  },
});

const input = positionals[0];
if (!input) {
  console.error("Usage: npm run encode:hero -- <input> [--start s] [--duration s] [--crossfade s]");
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(values.out)) {
  console.error("--out darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten.");
  process.exit(1);
}
const OUT_DIR = join(ROOT, "public", "media", values.out);

const start = Number(values.start);
const duration = Number(values.duration);
const crossfade = Number(values.crossfade);
if (!(duration > 2 * crossfade)) {
  console.error("--duration muss größer als 2 × --crossfade sein.");
  process.exit(1);
}

/** Filtergraph: Ausschnitt wählen → Crossfade-Loop → Zielauflösung. */
function loopFilter(width) {
  const loopLength = duration - crossfade;
  return [
    `[0:v]trim=start=${start}:duration=${duration},setpts=PTS-STARTPTS,fps=${values.fps},split[a][b]`,
    `[a]trim=start=${crossfade},setpts=PTS-STARTPTS[body]`,
    `[b]trim=duration=${crossfade},setpts=PTS-STARTPTS[head]`,
    `[body][head]xfade=transition=fade:duration=${crossfade}:offset=${loopLength - crossfade},` +
      `scale=${width}:-2:flags=lanczos,format=yuv420p[v]`,
  ].join(";");
}

// Qualität bewusst moderat: Das Video liegt unter einem ~65 % Navy-Overlay,
// Kompressionsartefakte sind dort unsichtbar – jedes KB zählt für die Ladezeit.
const variants = [
  { width: 1920, name: "hero-1080", x264Crf: 28, maxrate: "2400k", bufsize: "4800k", vp9Crf: 42 },
  { width: 1280, name: "hero-720", x264Crf: 29, maxrate: "1200k", bufsize: "2400k", vp9Crf: 43 },
];

function ffmpeg(args) {
  const result = spawnSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: "inherit",
  });
  if (result.error) {
    console.error(`ffmpeg konnte nicht gestartet werden (${FFMPEG}). FFMPEG_PATH setzen?`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function report(file) {
  const kb = Math.round(statSync(file).size / 1024);
  console.log(`  ✓ ${file.replace(ROOT, ".")}  ${kb} KB`);
}

mkdirSync(OUT_DIR, { recursive: true });
console.log(`Encoding ${input} (Start ${start}s, Dauer ${duration}s, Crossfade ${crossfade}s)`);

for (const v of variants) {
  const common = ["-i", input, "-filter_complex", loopFilter(v.width), "-map", "[v]", "-an"];

  const mp4 = join(OUT_DIR, `${v.name}.mp4`);
  ffmpeg([
    ...common,
    "-c:v", "libx264", "-preset", "slow", "-profile:v", "high",
    "-crf", String(v.x264Crf), "-maxrate", v.maxrate, "-bufsize", v.bufsize,
    "-g", String(Number(values.fps) * 2), "-movflags", "+faststart",
    mp4,
  ]);
  report(mp4);

  const webm = join(OUT_DIR, `${v.name}.webm`);
  ffmpeg([
    ...common,
    "-c:v", "libvpx-vp9", "-crf", String(v.vp9Crf), "-b:v", "0",
    "-deadline", "good", "-cpu-used", "2", "-row-mt", "1",
    "-g", String(Number(values.fps) * 2),
    webm,
  ]);
  report(webm);
}

// Poster = erstes Frame des fertigen Loops → nahtloser Übergang Bild → Video.
const poster = join(OUT_DIR, "poster.jpg");
ffmpeg(["-i", join(OUT_DIR, "hero-1080.mp4"), "-frames:v", "1", "-q:v", "3", poster]);
report(poster);

console.log("Fertig.");
