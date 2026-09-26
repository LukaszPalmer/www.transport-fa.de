# FA Transport – Plattform

Website, Kundenportal, Admin-Dashboard und API der FA Transport GmbH als npm-Workspaces-Monorepo.

```
FA Transport/
├─ frontend/   Next.js 16 (App Router) – Website, Kundenportal, Admin-Dashboard   → www.transport-fa.de
├─ backend/    Express 5 + Socket.io + MongoDB (Mongoose) – REST-API, Echtzeit, GPS → api.transport-fa.de
└─ shared/     Gemeinsame Domänen-Konstanten, Typen und API-Vertrag (@fa/shared)
```

## Architektur

```
Browser (Kunde / Admin) ──► frontend (Next.js) ──Server Components──► backend (intern, Railway-Netzwerk)
        │                                                                   ▲
        └──────── fetch + Socket.io (Cookie, CORS: nur eigenes Frontend) ───┤
Android-Fahrer-App (später) ──── HTTPS + Bearer-Token (GPS-Ingest) ─────────┘
                                                                            │
                                   MongoDB Atlas · Cloudflare R2 · Resend ◄─┘
```

- **Sitzungen:** serverseitig in MongoDB, Cookie `httpOnly` + `Secure` auf `transport-fa.de` (gilt für www und api).
- **Fehlerformat:** jede API-Fehlerantwort folgt `ApiErrorBody` aus `@fa/shared`.
- **Domänen-Enums** (Rollen, Status, Kategorien) kommen ausschließlich aus `@fa/shared`.

## Einrichtung

Voraussetzung: Node.js 24 (`.nvmrc`).

```bash
npm install                                   # installiert alle Workspaces
cp backend/.env.example backend/.env          # Werte eintragen (mind. MONGODB_URI)
cp frontend/.env.example frontend/.env.local
npm run dev                                   # API :4000 + Web :3000 parallel
```

| Befehl | Wirkung |
| --- | --- |
| `npm run dev` | Backend (`tsx watch`) und Frontend (`next dev`) gleichzeitig |
| `npm run dev:backend` / `dev:frontend` | nur ein Teil |
| `npm run build` | Produktions-Builds (Backend-Bundle nach `backend/dist`, Next.js-Build) |
| `npm run typecheck` · `npm run lint` | alle Workspaces |
| `npm run db:sync-indexes -w @fa/backend` | Collections anlegen und Indizes abgleichen |
| `npm run storage:check -w @fa/backend` | Cloudflare R2 testen (Schreiben, Lesen, Löschen, EU-Jurisdiktion) |
| `npm run admin -w @fa/backend -- anlegen <email> "<Name>"` | Administrator anlegen (Passwort wird einmalig angezeigt, 2FA bei der ersten Anmeldung unter `/admin/login`) |
| `npm run admin -w @fa/backend -- zuruecksetzen <email>` | Notfall: Passwort + 2FA eines Mitarbeiters zurücksetzen (z. B. Handy verloren) |
| `npm run chat:load-test -w @fa/backend -- 100 5` | Lasttest Live-Chat (100 Test-Kunden × 5 Nachrichten, räumt danach auf – nicht in Produktion) |

**Admin-Bereich** (`/admin`): Anmeldung nur mit Zwei-Faktor-Authentifizierung (Authenticator-App). Administratoren legen
unter „Team & Zugang" weitere Mitarbeiter an und vergeben Rechte einzeln (Kunden einsehen, Aufträge verwalten, Fahrer
zuweisen, Live-Chat, Dokumente, Zugangsdaten ändern). Produktion: `node dist/admin.js anlegen …` in der Railway-Shell.

## Backend-Struktur

```
backend/src/
├─ config/env.ts        Umgebungsvariablen (Zod, fail fast)
├─ db/                  Verbindung, Schema-Bausteine (GeoJSON, Adresse, Cent-Beträge)
├─ models/              16 Mongoose-Modelle (User, Session, CustomerProfile, Shipment, LocationLog …)
├─ http/                AppError, zentrale Fehlerbehandlung, Request-Logging
├─ storage/r2.ts        Cloudflare R2 (S3-API, EU-Endpoint), Key-Schema customers/<id>/…
├─ routes/              /health, /api/v1
├─ app.ts               Express-App (helmet, CORS, JSON, Cookies)
└─ server.ts            HTTP-Server, DB-Verbindung, Graceful Shutdown
```

## Deployment

Ein Git-Repository, zwei Plattformen. Beide bauen vom Repository-Hauptordner aus, weil `shared/` gebraucht wird.

| | Backend → **Railway** | Frontend → **Vercel** |
| --- | --- | --- |
| Konfiguration | Railway-Dashboard (Service → Settings, Werte unten) | `frontend/vercel.json` |
| Root Directory | leer lassen | `frontend` |
| Region | EU West (Amsterdam) | Functions: `fra1` (Frankfurt, per `vercel.json`) |
| Domain | `api.transport-fa.de` | `www.transport-fa.de` (+ Weiterleitung von `transport-fa.de`) |
| Variablen | Variables → Raw Editor (`NODE_ENV`/`PORT` setzt Railway) | Settings → Environment Variables |

**Railway-Service „@fa/backend" – Settings:**

| Feld | Wert |
| --- | --- |
| Custom Build Command | `npm run build -w @fa/backend` |
| Watch Paths | `/backend/**` · `/shared/**` · `/package.json` · `/package-lock.json` |
| Custom Start Command | `npm run start -w @fa/backend` |
| Pre-Deploy Step | `npm run db:sync-indexes:prod -w @fa/backend` (Collections & Indizes) |
| Healthcheck Path | `/health/ready` |
| Restart Policy | On Failure |

Railway baut nur neu, wenn sich `backend/`, `shared/` oder die Paketdateien ändern; Vercel überspringt
Deployments ohne Frontend-Änderungen automatisch.

Details zur Website (Inhalte, Hero-Videos, Bewertungen): [`frontend/README.md`](frontend/README.md).
