/**
 * SEO-, GEO- und Barrierefreiheits-Audit aller Seiten der Sitemap – lokal gegen `next start` oder gegen
 * die Live-Website. Exit-Code 1 bei Fehlern (Deploy-Blocker in der CI), Warnungen nur zur Info.
 *
 *   npm run seo:audit                                  → http://localhost:3000 (vorher build + start)
 *   npm run seo:audit -- https://www.transport-fa.de   → Live-Website
 *   SITE_URL=https://…                                 → Domain in Canonical/Sitemap (Standard: www.transport-fa.de)
 *
 * Je Seite: Status 200 ohne Umleitung · <html lang> · Title und Description (Länge) · Canonical = eigene URL ·
 * kein noindex · hreflang de/en/x-default (wechselseitig) · Open Graph + X-Card mit erreichbarem Bild ·
 * genau eine H1, keine übersprungenen Überschriftenebenen · alt an jedem <img> · JSON-LD gültig, erwartete
 * Typen vorhanden, alle @id-Verweise auflösbar · interne Links ohne Fehler, englische Seiten verlinken englisch.
 * Global: robots.txt, Sitemap (Bilder erreichbar), llms.txt, llms-full.txt, Kleinschreibung und Schrägstrich
 * am Ende werden umgeleitet, IndexNow-Schlüssel ist erreichbar.
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = (process.argv.slice(2).find((arg) => /^https?:\/\//.test(arg)) ?? "http://localhost:3000").replace(/\/$/, "");
const site = (process.env.SITE_URL ?? "https://www.transport-fa.de").replace(/\/$/, "");
const local = (url) => (url.startsWith(site) ? base + url.slice(site.length) : url.startsWith("/") ? base + url : url);

const TITLE = { min: 20, max: 60, hardMax: 70 };
const DESCRIPTION = { min: 110, max: 160, hardMax: 170 };

const problems = [];
const error = (where, message) => problems.push({ level: "error", where, message });
const warn = (where, message) => problems.push({ level: "warn", where, message });

// --- HTML-Hilfen (bewusst ohne Abhängigkeiten) ------------------------------------------------

const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map(([, raw]) => {
    const attributes = {};
    for (const [, key, dq, sq, bare] of raw.matchAll(/([^\s=<>"'/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attributes[key.toLowerCase()] = decode(dq ?? sq ?? bare ?? "");
    }
    return attributes;
  });
}

const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const cache = new Map();
function get(url, { follow = false } = {}) {
  const key = `${follow}:${url}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(url, { redirect: follow ? "follow" : "manual", headers: { "User-Agent": "fa-seo-audit/1.0" } }).then(async (response) => ({
        status: response.status,
        location: response.headers.get("location"),
        type: response.headers.get("content-type") ?? "",
        body: response.headers.get("content-type")?.startsWith("image/") ? "" : await response.text(),
      })),
    );
  }
  return cache.get(key);
}

async function pool(items, size, task) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => { while (queue.length) await task(queue.shift()); }));
}

// --- JSON-LD ---------------------------------------------------------------------------------------

function collectNodes(value, nodes = [], refs = []) {
  if (Array.isArray(value)) value.forEach((item) => collectNodes(item, nodes, refs));
  else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === "@id") refs.push(value["@id"]);
    else if (value["@type"] || value["@id"]) nodes.push(value);
    for (const [key, child] of Object.entries(value)) if (key !== "@context") collectNodes(child, nodes, refs);
  }
  return { nodes, refs };
}

const typesOf = (nodes) => new Set(nodes.flatMap((node) => [node["@type"]].flat().filter(Boolean)));

function expectedTypes(path) {
  const page = path.replace(/^\/en(?=\/|$)/, "") || "/";
  const common = ["MovingCompany", "WebSite"];
  if (page === "/") return [...common, "WebPage"];
  if (page.startsWith("/leistungen/")) return [...common, "WebPage", "Service", "FAQPage", "BreadcrumbList"];
  if (page === "/blog") return [...common, "CollectionPage", "Blog", "BreadcrumbList"];
  if (page.startsWith("/blog/")) return [...common, "WebPage", "BlogPosting", "BreadcrumbList"];
  if (page === "/kontakt") return [...common, "ContactPage", "BreadcrumbList"];
  return common;
}

// --- Seiten ----------------------------------------------------------------------------------------

const pages = new Map(); // URL → { alternates }
const internalLinks = new Map(); // Pfad → erste Fundstelle
const images = new Set();

async function auditPage(url) {
  const where = url.replace(site, "") || "/";
  const response = await get(local(url));
  if (response.status !== 200) {
    error(where, `HTTP ${response.status}${response.location ? ` → ${response.location}` : ""} (erwartet 200 ohne Umleitung)`);
    return;
  }
  const html = response.body;
  const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, raw]) => raw);
  const markup = html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const head = markup.slice(0, markup.indexOf("</head>"));
  const body = markup.slice(markup.indexOf("</head>"));
  const locale = /^\/en(\/|$)/.test(where) ? "en" : "de";

  const lang = tags(markup, "html")[0]?.lang;
  if (lang !== locale) error(where, `<html lang="${lang}"> – erwartet "${locale}"`);

  const titles = [...head.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map(([, value]) => decode(value).trim());
  if (titles.length !== 1) error(where, `${titles.length} <title>-Elemente (erwartet 1)`);
  const title = titles[0] ?? "";
  if (!title || title.length > TITLE.hardMax) error(where, `Title ${title.length} Zeichen: „${title}"`);
  else if (title.length > TITLE.max || title.length < TITLE.min) warn(where, `Title ${title.length} Zeichen (Ziel ${TITLE.min}–${TITLE.max}): „${title}"`);

  const meta = tags(head, "meta");
  const metaValue = (key, value) => meta.find((tag) => tag[key] === value)?.content;
  const description = metaValue("name", "description") ?? "";
  if (!description || description.length > DESCRIPTION.hardMax) error(where, `Description ${description.length} Zeichen`);
  else if (description.length > DESCRIPTION.max || description.length < DESCRIPTION.min)
    warn(where, `Description ${description.length} Zeichen (Ziel ${DESCRIPTION.min}–${DESCRIPTION.max})`);

  const robots = `${metaValue("name", "robots") ?? ""} ${metaValue("name", "googlebot") ?? ""}`;
  if (/noindex/i.test(robots)) error(where, `noindex auf einer Seite der Sitemap (${robots.trim()})`);
  if (!/max-image-preview:large/.test(robots)) warn(where, "googlebot ohne max-image-preview:large");

  const links = tags(head, "link");
  const canonical = links.find((tag) => tag.rel === "canonical")?.href;
  if (canonical !== url) error(where, `Canonical ${canonical ?? "fehlt"} – erwartet ${url}`);

  const alternates = Object.fromEntries(links.filter((tag) => tag.rel === "alternate" && tag.hreflang).map((tag) => [tag.hreflang, tag.href]));
  for (const hreflang of ["de", "en", "x-default"]) if (!alternates[hreflang]) error(where, `hreflang="${hreflang}" fehlt`);
  if (alternates[locale] !== url) error(where, `hreflang="${locale}" zeigt nicht auf die Seite selbst (${alternates[locale]})`);
  pages.set(url, { alternates });

  const og = (property) => metaValue("property", property);
  for (const property of ["og:title", "og:description", "og:image", "og:url", "og:site_name", "og:locale", "og:type"]) {
    if (!og(property)) error(where, `${property} fehlt`);
  }
  if (og("og:url") && og("og:url") !== url) error(where, `og:url ${og("og:url")} ≠ ${url}`);
  if (og("og:locale") !== (locale === "en" ? "en_GB" : "de_DE")) error(where, `og:locale ${og("og:locale")}`);
  if (!og("og:image:alt")) warn(where, "og:image:alt fehlt");
  if (metaValue("name", "twitter:card") !== "summary_large_image") error(where, "twitter:card ≠ summary_large_image");
  if (og("og:image")) images.add(og("og:image"));

  const headings = [...body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(([, level, inner]) => ({ level: Number(level), text: text(inner) }));
  const h1 = headings.filter((heading) => heading.level === 1);
  if (h1.length !== 1) error(where, `${h1.length} <h1> (erwartet genau 1)`);
  if (h1[0] && !h1[0].text) error(where, "<h1> ohne Text");
  headings.reduce((previous, heading) => {
    if (heading.level > previous + 1) error(where, `Überschrift springt von h${previous} auf h${heading.level}: „${heading.text}"`);
    return heading.level;
  }, 1);
  for (const heading of headings) if (!heading.text) error(where, `leere <h${heading.level}>`);

  for (const img of tags(body, "img")) if (!("alt" in img)) error(where, `<img src="${img.src}"> ohne alt`);

  const graphs = [];
  for (const raw of jsonLd) {
    try {
      graphs.push(JSON.parse(raw));
    } catch {
      error(where, `JSON-LD ist kein gültiges JSON: ${raw.slice(0, 80)}…`);
    }
  }
  const { nodes, refs } = collectNodes(graphs);
  const types = typesOf(nodes);
  for (const type of expectedTypes(where)) if (!types.has(type)) error(where, `JSON-LD ohne ${type}`);
  const ids = new Set(nodes.map((node) => node["@id"]).filter(Boolean));
  for (const ref of new Set(refs)) if (!ids.has(ref)) error(where, `JSON-LD-Verweis ohne Ziel: ${ref}`);

  for (const anchor of tags(body, "a")) {
    const href = anchor.href ?? "";
    if (!href || /^(#|mailto:|tel:)/.test(href) || (/^https?:/.test(href) && !href.startsWith(site))) continue;
    const path = href.replace(site, "").split("#")[0] || "/";
    if (/^\/(en\/)?kundenportal/.test(path)) continue; // Portal: Anmeldung nötig, Umleitung gewollt
    // Sprachumschalter (hreflang) zeigt absichtlich auf die andere Sprache.
    if (locale === "en" && !anchor.hreflang && !/^\/en(\/|$|\?)/.test(path) && !/\.[a-z]+$/.test(path)) {
      error(where, `deutscher Link auf englischer Seite: ${href}`);
    }
    if (!internalLinks.has(path)) internalLinks.set(path, where);
  }
}

// --- Ablauf ----------------------------------------------------------------------------------------

const sitemap = await get(`${base}/sitemap.xml`);
if (sitemap.status !== 200) {
  console.error(`Sitemap nicht erreichbar (HTTP ${sitemap.status}) – läuft der Server unter ${base}?`);
  process.exit(1);
}
const entries = [...sitemap.body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, entry]) => ({
  loc: /<loc>(.*?)<\/loc>/.exec(entry)?.[1],
  alternates: Object.fromEntries([...entry.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(([, hreflang, href]) => [hreflang, href])),
  images: [...entry.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map(([, src]) => src),
}));
const urls = entries.map((entry) => entry.loc);
if (new Set(urls).size !== urls.length) error("sitemap.xml", "doppelte URLs");
for (const entry of entries) {
  if (!entry.alternates.de || !entry.alternates.en || !entry.alternates["x-default"]) error("sitemap.xml", `${entry.loc}: hreflang-Verweise unvollständig`);
  entry.images.forEach((src) => images.add(src));
}

await pool(urls, 4, auditPage);

// hreflang wechselseitig: Wenn A auf B verweist, muss B auf A verweisen.
for (const [url, { alternates }] of pages) {
  for (const [hreflang, target] of Object.entries(alternates)) {
    if (hreflang === "x-default" || target === url) continue;
    const back = pages.get(target);
    if (!back) error(url.replace(site, "") || "/", `hreflang="${hreflang}" → ${target} ist nicht in der Sitemap`);
    else if (!Object.values(back.alternates).includes(url)) error(url.replace(site, "") || "/", `hreflang nicht wechselseitig mit ${target}`);
  }
}

await pool([...internalLinks.keys()], 6, async (path) => {
  const response = await get(local(path));
  const where = internalLinks.get(path);
  if (response.status >= 400) error(where, `Link ${path} → HTTP ${response.status}`);
  else if (response.status >= 300) warn(where, `Link ${path} leitet um (${response.status} → ${response.location})`);
});

await pool([...images], 6, async (src) => {
  const response = await get(local(src), { follow: true });
  if (response.status !== 200 || !response.type.startsWith("image/")) error("Bilder", `${src} → HTTP ${response.status} ${response.type}`);
});

const robots = await get(`${base}/robots.txt`);
if (robots.status !== 200) error("robots.txt", `HTTP ${robots.status}`);
else {
  if (!robots.body.includes(`Sitemap: ${site}/sitemap.xml`)) error("robots.txt", "Sitemap-Verweis fehlt");
  const starGroup = /User-Agent: \*\n([\s\S]*?)(\n\n|$)/i.exec(robots.body)?.[1] ?? "";
  if (/^Disallow: \/$/m.test(starGroup)) error("robots.txt", "User-Agent * ist komplett gesperrt");
  for (const bot of ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "GPTBot", "ClaudeBot", "Google-Extended"]) {
    if (!new RegExp(`User-Agent: ${bot}\\b`, "i").test(robots.body)) warn("robots.txt", `${bot} nicht ausdrücklich geregelt`);
  }
}

for (const file of ["/llms.txt", "/llms-full.txt"]) {
  const response = await get(base + file);
  if (response.status !== 200 || !response.type.startsWith("text/plain") || !response.body.startsWith("# ")) {
    error(file, `HTTP ${response.status} ${response.type} – erwartet Markdown als text/plain`);
  }
}

for (const [from, to] of [
  ["/Kontakt", "/kontakt"],
  ["/leistungen/umzuege/", "/leistungen/umzuege"],
]) {
  const response = await get(base + from);
  const target = response.location?.replace(base, "").replace(site, "");
  if (response.status !== 308 || target !== to) error("Umleitungen", `${from} → HTTP ${response.status} ${response.location ?? ""} (erwartet 308 → ${to})`);
}

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const keyFile = readdirSync(publicDir).find((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) warn("IndexNow", "kein Schlüssel in public/");
else {
  const response = await get(`${base}/${keyFile}`);
  if (response.status !== 200 || response.body.trim() !== readFileSync(publicDir + keyFile, "utf8").trim()) {
    error("IndexNow", `/${keyFile} → HTTP ${response.status}`);
  }
}

// --- Bericht ----------------------------------------------------------------------------------------

const errors = problems.filter((problem) => problem.level === "error");
const warnings = problems.filter((problem) => problem.level === "warn");
const byPlace = Map.groupBy(problems, (problem) => problem.where);
for (const [where, list] of byPlace) {
  console.log(`\n${where}`);
  for (const problem of list) console.log(`  ${problem.level === "error" ? "✖" : "⚠"} ${problem.message}`);
}
console.log(
  `\nSEO-Audit ${base}: ${urls.length} Seiten, ${internalLinks.size} interne Links, ${images.size} Bilder geprüft – ` +
    `${errors.length} Fehler, ${warnings.length} Warnungen.`,
);
process.exit(errors.length ? 1 : 0);
