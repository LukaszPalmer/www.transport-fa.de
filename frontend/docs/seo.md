# SEO, GEO und Barrierefreiheit

Stand: 23.10.2026 · Gilt für die öffentliche Website (`src/app/[lang]/(site)`). Kundenportal und Admin tragen `noindex`.

## Was wo umgesetzt ist

| Thema | Datei | Kurz |
| --- | --- | --- |
| Metadaten jeder Seite | `src/lib/seo.ts` → `pageMetadata()` | Title (Marke nur, wenn ≤ 60 Zeichen), Description (> 160 wird am Wortende gekürzt), Canonical, hreflang, Open Graph, X-Card – immer vollständig |
| Globale Metadaten | `src/app/[lang]/layout.tsx` | `max-snippet:-1`, `max-image-preview:large`, Geo-Meta-Tags, Verifizierung (Env) |
| Sprach-URLs | `src/proxy.ts`, `src/i18n/config.ts` | Deutsch ohne Präfix, Englisch unter `/en/…`; beide indexierbar, `x-default` = Deutsch |
| Interne Links | `src/components/ui/SmartLink.tsx` → `LocaleLink` | Interne Links folgen automatisch der Seitensprache |
| Strukturierte Daten | `src/lib/structured-data.ts` | Verknüpfter JSON-LD-Graph (siehe unten) |
| Sitemap | `src/app/sitemap.ts` | Beide Sprachen, hreflang je Eintrag, Bilder, `lastmod` nur bei bekanntem Datum |
| robots.txt | `src/app/robots.ts`, `src/lib/crawlers.ts` | Suchmaschinen und KI-Crawler einzeln geregelt |
| KI-Texte | `src/app/llms.txt/`, `src/app/llms-full.txt/`, `src/lib/llms.ts` | Übersicht bzw. alle Inhalte als Markdown |
| Logo, Icons | `src/app/logo.png/`, `src/app/apple-icon.tsx`, `src/app/manifest.ts` | PNG-Logo für Google, iOS-Icon, Manifest |
| IndexNow | `public/<schlüssel>.txt`, `scripts/indexnow.mjs`, `.github/workflows/indexnow.yml` | Meldet Änderungen nach jedem Produktions-Deploy |
| Prüfungen | `scripts/seo-audit.mjs`, `lighthouserc.json`, `.github/workflows/seo-quality.yml` | Deploy-Blocker bei SEO-/A11y-Fehlern |
| Crawl-Protokoll | `src/proxy.ts` | Jeder Crawler-Zugriff als Log-Zeile `"event":"crawler"` |
| Web Vitals (RUM) | `src/components/analytics/WebVitals.tsx`, `src/app/api/vitals/` | Aus; mit `NEXT_PUBLIC_WEB_VITALS=on` |
| A11y-Regeln | `eslint.config.mjs` (`fa/a11y`) | Alt-Texte (auch `next/image`), Links/Überschriften mit Inhalt, gültiges ARIA – als Fehler |

## Neue Seite anlegen – Checkliste

1. `generateMetadata` mit `pageMetadata({ path, locale, title, description, image? })`. `path` immer ohne Sprachpräfix.
2. Title ohne Marke, Hauptbegriff + Ort vorn (max. 45 Zeichen, dann passt „ | FA Transport" dazu). Description 120–160 Zeichen, mit Nutzen und Handlungsaufforderung.
3. Genau eine `<h1>` mit Leistung und Ort; Überschriften ohne Sprünge (h2 → h3, nicht h2 → h4).
4. JSON-LD: `webPageJsonLd({ …, breadcrumbs })` – bei Leistungen und Beiträgen die vorhandenen Builder nutzen.
5. In `src/app/sitemap.ts` eintragen (beide Sprachen entstehen automatisch).
6. Englische Fassung im selben Inhaltsmodul pflegen – jede deutsche Seite braucht ihr englisches Gegenstück, sonst zeigt hreflang ins Leere (das Audit meldet das).
7. Bilder: aussagekräftiges `alt` (was ist zu sehen), dekorative Bilder `alt=""`.
8. `npm run build && npm run start`, dann `npm run seo:audit` – muss mit 0 Fehlern enden.

Leistung geändert? `updatedAt` in `src/content/services.ts` und `en/services.ts` setzen – das ist `lastmod` in der Sitemap und `dateModified` im JSON-LD, und IndexNow meldet die Seite beim nächsten Deploy.

## Strukturierte Daten (JSON-LD)

Jede Seite liefert zwei Blöcke: das Website-Layout den Unternehmensgraphen (`MovingCompany` mit Adresse, Geo, Öffnungszeiten, Einzugsgebiet mit Wikidata-IDs, Handelsregister, USt-IdNr., Google-Profil als `sameAs`/`hasMap`; Logo; Geschäftsführer; `WebSite`), die Seite ihre eigenen Knoten (`WebPage`/`ContactPage`/`CollectionPage`, `BreadcrumbList`, `Service` mit Leistungskatalog, `FAQPage`, `BlogPosting` mit lizenziertem `ImageObject`). Alle Knoten haben feste `@id`s und verweisen aufeinander.

Bewusst nicht enthalten:

- **AggregateRating/Review** – Google ignoriert Bewertungs-Markup des eigenen Unternehmens (Self-serving Reviews). Sterne in der Suche kommen über das Google-Unternehmensprofil.
- **Urheberangaben bei den Hero-Videos** – die Herkunft ist nicht dokumentiert (siehe offene Punkte).

Hinweis FAQ: Google zeigt FAQ-Rich-Results seit 2023 nur noch für Behörden- und Gesundheitsseiten. Das Markup bleibt trotzdem sinnvoll – Bing und KI-Suchen werten es aus, und jede Frage hat einen eigenen Anker (`#faq-…`), der die Antwort aufklappt.

## Sprachen und URLs

- Deutsch: `/kontakt` (Standard, `x-default`). Englisch: `/en/kontakt`. Slugs sind in beiden Sprachen gleich.
- `/de/…` leitet auf die URL ohne Präfix um. Großbuchstaben und Schrägstrich am Ende leiten mit 308 auf die kanonische URL um.
- Wer Englisch gewählt hat (Cookie `fa_lang=en`), wird von deutschen URLs auf `/en/…` geleitet. Crawler senden kein Cookie und sehen die deutsche Fassung.
- Das Kundenportal hat keine Sprach-URLs: `/en/kundenportal…` setzt das Cookie und leitet auf `/kundenportal…`.

## KI-Suchen (GEO)

- `robots.txt` erlaubt Suchmaschinen, KI-Suchen (OAI-SearchBot, PerplexityBot, Claude-SearchBot), KI-Assistenten (ChatGPT-User u. a.) und KI-Training (GPTBot, ClaudeBot, Google-Extended …). Training abschalten: `AI_TRAINING_ALLOWED = false` in `src/lib/crawlers.ts`.
- `/llms.txt`: Firmendaten, Leistungen, Ratgeber, englische Seiten. `/llms-full.txt`: alle Leistungen mit Umfang, Ablauf und FAQ sowie alle Ratgeber im Volltext.
- Ratgeber-Texte folgen dem Muster: Kernaussage im ersten Absatz, „Das Wichtigste in Kürze", Zwischenüberschriften als echte Fragen, Zahlen als Tabelle, FAQ am Ende (siehe `src/content/blog.ts`).

## Indexierung

1. **Google Search Console**: Domain-Property `transport-fa.de` per DNS-TXT bei IONOS bestätigen, Sitemap `https://www.transport-fa.de/sitemap.xml` einreichen. Alternativ Meta-Tag über `GOOGLE_SITE_VERIFICATION`.
2. **Bing Webmaster Tools**: Website aus der Search Console importieren (ein Klick) oder `BING_SITE_VERIFICATION`. Bing speist auch ChatGPT-Suche und Copilot.
3. **IndexNow** läuft nach jedem Produktions-Deploy automatisch (nur Seiten, deren `lastmod` max. 7 Tage alt ist). Einmalig nach dem Livegang alle Seiten melden: GitHub → Actions → IndexNow → Run workflow → „Alle Seiten", oder lokal `npm run indexnow -w @fa/frontend -- --all`.
4. **Google Indexing API** ist bewusst nicht angebunden: Google erlaubt sie nur für Stellenanzeigen (`JobPosting`) und Livestreams. Für normale Seiten wirken Sitemap und Search Console.

## Prüfen und überwachen

- `npm run seo:audit -w @fa/frontend [-- <url>]` – alle Sitemap-Seiten: Status, Title/Description, Canonical, hreflang (wechselseitig), Open Graph inkl. Bild, eine H1, Überschriftenfolge, Alt-Texte, JSON-LD (Typen und Verweise), interne Links, robots.txt, llms-Dateien, Umleitungen, IndexNow-Schlüssel. Auch gegen die Live-Website nutzbar.
- CI (`seo-quality.yml`): Lint, Typen, Build, Audit und Lighthouse (SEO ≥ 95, Barrierefreiheit ≥ 95, Best Practices ≥ 90, CLS ≤ 0,1 als Fehler; Performance als Warnung). Berichte als Artefakt „lighthouse".
- Crawl-Budget: In Vercel → Logs nach `"event":"crawler"` filtern; das Feld `category` trennt `search`, `ai-search`, `ai-assistant`, `ai-training`. Erkennung per User-Agent (ohne DNS-Prüfung).
- Web Vitals: Echte Felddaten zeigt die Search Console (Bericht „Core Web Vitals"), sobald genug Besucher da sind. Eigenes RUM: `NEXT_PUBLIC_WEB_VITALS=on`, Logs nach `"event":"web-vital"` filtern. **Vorher** in die Datenschutzerklärung (Abschnitt 3, beide Sprachen) aufnehmen, z. B.: „Um die Ladezeiten zu verbessern, misst die Website anonym, wie schnell Seiten laden und reagieren (Core Web Vitals). Übertragen werden ohne Cookies nur Messwert, Bewertung und aufgerufener Seitenpfad; die Verarbeitung erfolgt wie jeder Seitenaufruf bei unserem Hosting-Anbieter (Art. 6 Abs. 1 lit. f DSGVO), die Logdaten werden nach spätestens 30 Tagen gelöscht." – rechtlich prüfen lassen.

## Bewusst nicht umgesetzt

- **Stadt-Landingpages** (`/umzug-neuss` usw.) ohne eigenen Inhalt gelten bei Google als Doorway-Pages. Erst anlegen, wenn es je Ort echte, eigene Inhalte gibt (Projekte, Fotos, Bewertungen aus dem Ort). Bis dahin tragen Leistungsseiten, FAQ und JSON-LD das Einzugsgebiet.
- **Einbettbare Widgets für Backlinks** – Links in verteilten Widgets nennt Google ausdrücklich als Link-Spam.
- **Geo-Routing, ISR/On-Demand-Revalidation** – ein Standort, Inhalte liegen im Code und werden beim Deploy statisch erzeugt. Nur die Google-Bewertungen werden alle 6 Stunden neu geladen.
- **WCAG 2.1 AAA flächendeckend** – das W3C selbst empfiehlt AAA nicht als Ziel für ganze Websites. Ziel ist AA; Lighthouse-Barrierefreiheit liegt bei 100.

## Offene Punkte außerhalb des Codes

- **Google-Unternehmensprofil**: Hauptkategorie „Versanddienstleister" → „Umzugsunternehmen", weitere Kategorien z. B. Entrümpelungsdienst, Transportunternehmen. Leistungen, Einzugsgebiet, Öffnungszeiten und Fotos pflegen. Das ist der stärkste Einzelfaktor für die lokale Kartenansicht.
- **Echte Kundenbewertungen** auf Google sammeln (Kurzlink `/bewerten` auf Rechnung und per SMS nach jedem Auftrag). Interne Bewertungen (Inhaber, Familie) löschen lassen.
- **Einheitliche Firmendaten (NAP)** in Verzeichnissen: Gelbe Seiten, Das Örtliche, 11880, Apple Business Connect, Bing Places, IHK. Das MyHammer-Profil läuft noch als „FA Transporte & Dienstleistungen" in Neuss – angleichen oder löschen.
- **Social-Media-Profile** anlegen und in `src/content/company.ts` eintragen (erscheinen dann automatisch im JSON-LD).
- **Eigene Fotos und Videos** von Team, Fahrzeugen und Einsätzen. Die Hero-Videos wirken wie Stockmaterial (u. a. US-Highway, US-Lkw), das Impressum nennt sie „eigenes Material" – Herkunft klären und Angabe korrigieren.
- **Zahlen belegen**: „10 Jahre Erfahrung", „99,8 % Termintreue 2025", Flottenangaben – nur stehen lassen, was nachweisbar ist (UWG, und Vertrauen bei Google und KI-Suchen).
