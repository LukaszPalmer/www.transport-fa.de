# FA Transport – Website & Kundenportal

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4. Anmeldung und Daten kommen von der API in `../backend`.
Alle Marketing-Seiten werden statisch vorgerendert; nur das Kundenportal rendert dynamisch.

```bash
npm install
cp .env.example .env.local   # lokal genügen die Vorgaben (API auf localhost:4000)
npm run dev                  # http://localhost:3000
npm run build && npm start   # Production
npm run lint && npm run typecheck
```

## Seiten

| Route | Inhalt |
| --- | --- |
| `/` | Startseite (Drohnen-Hero, Leistungen, Flotte, Über uns, Bewertungen, Karriere, Kontakt) |
| `/leistungen/umzuege` · `/entruempelungen` · `/haushaltsaufloesungen` · `/transport-logistik` | Leistungsseiten mit eigenem Video-Hero (ein Template, Inhalte aus `src/content/services.ts`) |
| `/kontakt` | Kontakt- & Angebotsformular (`?leistung=umzuege` wählt die Leistung vor) |
| `/karriere` | Stellen aller Bereiche mit Filter + Bewerbungsformular inkl. Lebenslauf-Upload |
| `/kundenportal` (+ `/konto`) | Dashboard und Kundenkonto (nur angemeldet, sonst Weiterleitung zur Anmeldung) |
| `/kundenportal/anmelden` · `/registrieren` · `/passwort-vergessen` · `/passwort-zuruecksetzen` · `/email-bestaetigen` | Anmeldung (E-Mail/Passwort, Google), Registrierung, Passwort-Reset, E-Mail-Bestätigung |
| `/bewerten` | Kurzlink für Bewertungsanfragen (Google / MyHammer), nicht indexiert |

## Struktur

```
src/
├─ app/
│  ├─ (site)/            Website-Seiten (Layout mit Header/Footer)
│  ├─ (portal)/          Kundenportal (fokussiertes Layout, noindex)
│  ├─ actions/           Server Actions: Kontakt, Bewerbung
├─ content/              ALLE Texte & Daten (company, services, careers, reviews, contact, home, navigation)
├─ components/
│  ├─ forms/             Formular-Kit (Felder, Auswahlkarten, Upload) + Kontakt-/Bewerbungsformular
│  ├─ portal/            Anmelde-Layout und -Formulare
│  ├─ sections/          Seitensektionen (PageHero, StatsBar, OfferingGrid, FAQ, Reviews …)
│  ├─ layout/            Header (Dropdown), Mobilmenü, Footer
│  └─ ui/                Primitives (Button, SmartLink, Icon-Registry …)
└─ lib/                  api (Client/Server), session (DAL), portal-format, mail, form-guard, structured-data
```

Neue Leistung hinzufügen: Eintrag in `src/content/services.ts` + Video per Skript (siehe unten).
Dropdown, Startseite, Kontaktformular, Sitemap und JSON-LD übernehmen sie automatisch.

## Formulare & E-Mail

- Validierung serverseitig mit zod, Spam-Schutz ohne Captcha (Honeypot, Mindest-Ausfüllzeit, Rate-Limit pro IP).
- Versand per SMTP (`SMTP_*`, `MAIL_FROM`, `MAIL_TO_CONTACT`, `MAIL_TO_CAREERS`). Kunden/Bewerber erhalten eine Eingangsbestätigung.
- Lebensläufe (PDF/Word/Bild, max. 5 MB) werden auf Format **und** Dateisignatur geprüft und nur als Mail-Anhang
  weitergeleitet – nie auf dem Server gespeichert.
- Ohne `SMTP_HOST` werden Mails in der Entwicklung in der Konsole ausgegeben; in Produktion ist das ein Fehler.

## Kundenportal

- **Anmeldung über die Backend-API** (`backend/`): E-Mail/Passwort (Argon2id), Google-Login, E-Mail-Bestätigung,
  Passwort-Reset, Rate-Limiting, Kontosperre nach Fehlversuchen. Die Sitzung liegt in einem httpOnly-Cookie der API.
- **Server Components** lesen Daten über `lib/api/server.ts` (reicht das Cookie an die API weiter), Formulare im
  Browser über `lib/api/client.ts`. Zugriffsprüfung zentral in `lib/session.ts` (`requireCustomer`).
- Der Google-Button zeigt „wird in Kürze freigeschaltet“, solange im Backend kein Google-Client konfiguriert ist.

## Bewertungen (Google & MyHammer)

Es werden ausschließlich echte Bewertungen angezeigt (gefälschte Bewertungen sind nach UWG unzulässig).
Solange keine vorliegen, zeigt die Sektion einen Einladungs-Zustand mit Links zu beiden Plattformen.

1. In `src/content/reviews.ts` Google-Place-ID (`writeReviewUrl`) und MyHammer-Profil-URL eintragen.
2. Nach jedem Auftrag den Kurzlink **/bewerten** senden (SMS, E-Mail-Signatur, QR-Code auf der Rechnung).
3. Neue Bewertungen unverändert in `reviews` eintragen; über `service` erscheinen sie auf der passenden Leistungsseite.
   Eine Durchschnittsnote wird erst ab 5 Bewertungen angezeigt.

## Hero-Videos

```bash
npm run encode:hero -- rohclip.mp4 --out umzuege --start 0 --duration 8 --crossfade 1
```

Erzeugt `public/media/<out>/hero-{1080,720}.{webm,mp4}` + `poster.jpg` als nahtlosen Loop (ffmpeg im PATH oder `FFMPEG_PATH`).
Aktuelle Clips: Pexels-Lizenz – Startseite 8457857, Umzüge 7463960, Entrümpelungen 7464099,
Haushaltsauflösungen 4553292, Transport 5598972, Karriere 4284181. Empfehlung: durch eigene Aufnahmen ersetzen.

## Tracking-App-Sektion (Startseite, Umzüge, Transport & Logistik)

- Karte im App-Mockup aus echten Geodaten (OSRM-Route, OpenStreetMap-Vektorkacheln), neu erzeugen mit
  `npm run build:app-map` (Start/Ziel in `scripts/build-app-map.mjs`).
- Echte **Google-Maps**-Karte: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` setzen (nur „Maps JavaScript API“ aktivieren,
  Key auf die Domain beschränken). Google lädt erst nach Klick auf „Google Maps laden“ (DSGVO), die Zustimmung wird lokal gespeichert.
- Store-Links in `src/content/app.ts` eintragen. Badges und Plattform-Logos in `public/brands/` sind unveränderte Originale.

## Vor dem Livegang

- [ ] Firmendaten, Kennzahlen, Zertifikate, Stellen und FAQ-Antworten fachlich prüfen (`src/content/*`)
- [ ] Impressum & Datenschutzerklärung rechtlich prüfen lassen
- [ ] `.env`: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`, SMTP-Zugang, Empfänger-Adressen
- [ ] Google-Place-ID und MyHammer-Profil in `reviews.ts`
