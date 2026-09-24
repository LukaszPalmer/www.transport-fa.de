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
| Konfiguration | `backend/railway.json` | `frontend/vercel.json` |
| Root Directory | leer lassen | `frontend` |
| Einstellung | Railway Config File: `/backend/railway.json` | „Include files outside the root directory" aktiv (Standard) |
| Region | EU West (Amsterdam) | Functions: `fra1` (Frankfurt, per `vercel.json`) |
| Vor jedem Deploy | `db:sync-indexes:prod` (Collections & Indizes) | – |
| Health-Check | `/health/ready` | – |
| Domain | `api.transport-fa.de` | `www.transport-fa.de` (+ Weiterleitung von `transport-fa.de`) |
| Variablen | Railway → Variables → Raw Editor (`NODE_ENV`/`PORT` setzt Railway) | Vercel → Settings → Environment Variables |

Railway baut nur neu, wenn sich `backend/`, `shared/` oder die Paketdateien ändern; Vercel überspringt
Deployments ohne Frontend-Änderungen automatisch.

Details zur Website (Inhalte, Hero-Videos, Bewertungen): [`frontend/README.md`](frontend/README.md).
