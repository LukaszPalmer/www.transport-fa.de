/**
 * IndexNow – meldet neue und geänderte Seiten sofort an Bing, Yandex, Seznam, Naver u. a.
 * (api.indexnow.org verteilt an alle teilnehmenden Suchmaschinen). Bing ist zugleich die Quelle
 * der ChatGPT-Suche und von Microsoft Copilot. Google nimmt nicht teil – dort wirkt die Sitemap.
 *
 *   npm run indexnow                    → Seiten, deren <lastmod> in der Sitemap max. 7 Tage alt ist
 *   npm run indexnow -- --all           → alle Seiten der Sitemap (z. B. einmalig nach dem Livegang)
 *   npm run indexnow -- <url> [<url>…]  → genau diese URLs
 *   --dry-run                           → nur anzeigen, nichts senden
 *   SITE_URL=https://…                  → andere Domain (Standard: https://www.transport-fa.de)
 *
 * Läuft automatisch nach jedem Produktions-Deploy (.github/workflows/indexnow.yml). Der Schlüssel ist
 * absichtlich öffentlich: Er liegt als public/<schlüssel>.txt auf der Website und beweist, dass die
 * Meldung von hier kommt. Neuer Schlüssel: Datei umbenennen und Inhalt anpassen (32 Hex-Zeichen).
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RECENT_DAYS = 7;
const site = (process.env.SITE_URL ?? "https://www.transport-fa.de").replace(/\/$/, "");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const all = args.includes("--all");
const explicit = args.filter((arg) => !arg.startsWith("--"));

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const keyFile = readdirSync(publicDir).find((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) throw new Error("Kein IndexNow-Schlüssel in public/ (Datei <32 Hex-Zeichen>.txt).");
const key = readFileSync(publicDir + keyFile, "utf8").trim();
const keyLocation = `${site}/${keyFile}`;

async function sitemapUrls() {
  const response = await fetch(`${site}/sitemap.xml`);
  if (!response.ok) throw new Error(`Sitemap nicht erreichbar: HTTP ${response.status}`);
  const xml = await response.text();
  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(([, entry]) => ({ loc: /<loc>(.*?)<\/loc>/.exec(entry)?.[1], lastmod: /<lastmod>(.*?)<\/lastmod>/.exec(entry)?.[1] }))
    .filter((entry) => entry.loc && (all || (entry.lastmod && Date.parse(entry.lastmod) >= cutoff)))
    .map((entry) => entry.loc);
}

const urls = explicit.length ? explicit : await sitemapUrls();
if (urls.length === 0) {
  console.log(`IndexNow: keine Seite in den letzten ${RECENT_DAYS} Tagen geändert – nichts zu melden (--all meldet alle).`);
  process.exit(0);
}
const foreign = urls.filter((url) => !url.startsWith(`${site}/`) && url !== site);
if (foreign.length) throw new Error(`Nur URLs von ${site} sind erlaubt: ${foreign.join(", ")}`);

console.log(`IndexNow: ${urls.length} URL(s)${dryRun ? " (Probelauf)" : ""}\n${urls.map((url) => `  ${url}`).join("\n")}`);
if (dryRun) process.exit(0);

// Ohne erreichbare Schlüsseldatei lehnt IndexNow ab (HTTP 403) – vorher prüfen, mit klarer Meldung.
const published = await fetch(keyLocation).then((response) => (response.ok ? response.text() : ""));
if (published.trim() !== key) throw new Error(`Schlüsseldatei ${keyLocation} ist (noch) nicht live – erst deployen.`);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation, urlList: urls }),
});
// 200 = angenommen, 202 = angenommen (Schlüssel wird noch geprüft); alles andere ist ein Fehler.
if (response.status !== 200 && response.status !== 202) {
  throw new Error(`IndexNow antwortet HTTP ${response.status}: ${await response.text()}`);
}
console.log(`IndexNow: gemeldet (HTTP ${response.status}).`);
