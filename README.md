# Webseitenverlag Deutschland Deutschland

SaaS-MVP für eine Webseiten-Agentur. Kunden erhalten eine professionelle HTML-Website auf einer Subdomain/Domain ihrer Wahl, gehostet auf Cloudflare Pages. Über ein Dashboard mit KI-Chatbot (Claude) können Kunden ihre Website einfach anpassen — Texte, Farben, Sektionen — ohne Programmierkenntnisse. Änderungen werden über das Backend live deployed.

## Stack

- **Frontend/Backend:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Datenbank & Auth:** Supabase (Postgres + Auth + RLS)
- **KI-Chatbot:** Anthropic Claude API (claude-sonnet-4-5)
- **Hosting der Kunden-Websites:** Cloudflare Pages (Direct Upload API)
- **Deployment des Dashboards:** Vercel

## Setup

### 1. Repository klonen & Dependencies installieren

```bash
git clone <repo-url>
cd webseitenverlag-deutschland
npm install
```

### 2. Supabase-Projekt erstellen

1. Erstelle ein neues Projekt auf [supabase.com](https://supabase.com)
2. Gehe zu **Project Settings → API** und notiere:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) — nur für das Seed-Script

### 3. Datenbank-Migration ausführen

1. Öffne dein Supabase-Projekt im Dashboard
2. Gehe zu **SQL Editor**
3. Kopiere den Inhalt von `supabase/migrations/001_initial.sql`
4. Führe das SQL aus

Dies erstellt die Tabellen `customers`, `sites`, `config_versions` und `chat_messages` mit Row Level Security Policies.

### 4. Environment Variables einrichten

```bash
cp .env.local.example .env.local
```

Fülle die Werte aus:

| Variable | Beschreibung | Wo zu finden |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (nur Seed) | Supabase Dashboard → Settings → API |
| `ANTHROPIC_API_KEY` | Anthropic API Key | [console.anthropic.com](https://console.anthropic.com) |

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Erste Test-Site anlegen

### Option A: Über das UI

1. Öffne [http://localhost:3000/register](http://localhost:3000/register)
2. Erstelle ein Konto (E-Mail + Passwort + Firmenname)
3. Klicke auf "Neue Webseite" im Dashboard
4. Nutze den KI-Chat oder den manuellen Editor, um Änderungen vorzunehmen

### Option B: Über das Seed-Script

```bash
npx tsx scripts/seed-test-data.ts test@example.com passwort123
```

Das Script erstellt einen User, ein Kundenprofil und eine Test-Site mit Beispieldaten. Danach kannst du dich unter [http://localhost:3000/login](http://localhost:3000/login) anmelden.

**Voraussetzung:** `SUPABASE_SERVICE_ROLE_KEY` muss in `.env.local` gesetzt sein.

## Cloudflare-Deployment testen

1. Erstelle einen [Cloudflare-Account](https://cloudflare.com)
2. Erstelle einen API-Token unter **My Profile → API Tokens → Create Token**
   - Template: "Cloudflare Pages — Edit"
   - Oder Custom mit Permission: `Account > Cloudflare Pages > Edit`
3. Notiere die Account-ID (auf der Hauptseite des Dashboards)
4. Trage `cloudflare_account_id` und `cloudflare_api_token` in der `customers`-Tabelle für deinen Test-User ein (über Supabase Table Editor)
5. Klicke im Editor auf "Veröffentlichen" — die Website wird auf Cloudflare Pages deployed

## Architektur

```
┌──────────────────────────────────────────────────────────┐
│                    Vercel (Dashboard)                     │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────────────┐ │
│  │ Next.js  │  │ API      │  │ Server Components       │ │
│  │ App      │→ │ Routes   │→ │ + Client Components     │ │
│  │ Router   │  │          │  │                         │ │
│  └─────────┘  └──────────┘  └─────────────────────────┘ │
│       │            │                                     │
│       │     ┌──────┴──────┐                              │
│       │     │             │                              │
│       ▼     ▼             ▼                              │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │  Supabase   │  │  Claude API │                       │
│  │  (Auth+DB)  │  │  (Chatbot)  │                       │
│  └─────────────┘  └─────────────┘                       │
│                                                          │
│  Publish-Flow:                                           │
│  draft_config → Template Renderer → HTML                 │
│                                      │                   │
│                                      ▼                   │
│                            ┌─────────────────┐           │
│                            │ Cloudflare Pages │           │
│                            │ (Direct Upload)  │           │
│                            └─────────────────┘           │
│                                      │                   │
│                                      ▼                   │
│                            https://site.pages.dev        │
└──────────────────────────────────────────────────────────┘
```

### Datenfluss

1. **User erstellt Site** → Default-Config wird in `sites.config` und `sites.draft_config` gespeichert
2. **User chattet mit KI** → Claude analysiert die Anfrage, gibt Config-Changes zurück → `draft_config` wird aktualisiert
3. **User bearbeitet manuell** → Formularänderungen werden per Auto-Save (1s debounce) in `draft_config` gespeichert
4. **User veröffentlicht** → `draft_config` wird durch den Template-Renderer zu HTML, auf Cloudflare Pages deployed, und nach `config` kopiert
5. **Rollback** → Alte Version aus `config_versions` wird geladen und optional re-deployed

## Projektstruktur

```
app/
  (auth)/login/                    — Anmeldeseite
  (auth)/register/                 — Registrierungsseite
  dashboard/                       — Dashboard (Seitenübersicht)
  dashboard/[siteId]/              — Website-Editor (Chat + Manuell + Verlauf)
  api/sites/                       — GET: Sites auflisten, POST: Site erstellen
  api/sites/[siteId]/              — GET: Site-Daten, PATCH: Draft-Config updaten
  api/sites/[siteId]/preview/      — GET: HTML-Vorschau aus draft_config
  api/sites/[siteId]/publish/      — POST: Auf Cloudflare Pages deployen
  api/sites/[siteId]/chat/         — POST: KI-Chat (Claude)
  api/sites/[siteId]/rollback/     — POST: Auf alte Version zurücksetzen
  api/auth/callback/               — Supabase Auth Callback
lib/
  supabase/                        — Supabase Client/Server/Middleware
  claude.ts                        — Claude API Integration
  cloudflare.ts                    — Cloudflare Pages Deploy
  template-renderer.ts             — HTML-Template Rendering
  config-utils.ts                  — Config Merge/Compare Utilities
  defaults.ts                      — Default Site-Konfiguration
  api-helpers.ts                   — Auth-Helpers für API-Routes
components/
  site-editor.tsx                  — Haupteditor mit 3 Tabs
  create-site-button.tsx           — Modal zum Erstellen neuer Sites
  logout-button.tsx                — Logout-Button
types/
  index.ts                         — TypeScript Types
scripts/
  seed-test-data.ts                — Test-Daten erstellen
supabase/migrations/
  001_initial.sql                  — Datenbank-Schema + RLS Policies
```

## Designentscheidungen

- **Kein Multi-Template-Support:** Das MVP hat ein festes Business-Template. Templates können später als separate HTML/Config-Paare implementiert werden.
- **Config als JSON:** Statt einer normalisierten DB-Struktur wird die Website-Konfiguration als JSONB gespeichert. Das ist flexibler für MVP-Iterationen.
- **Claude mit XML-Tags:** Der Chatbot gibt Config-Changes in `<config_changes>`-Tags zurück. Das ist robuster als reines JSON-Parsing und erlaubt natürlichsprachliche Antworten + strukturierte Daten.
- **Draft/Live-Config-Split:** Änderungen landen erst in `draft_config`. Erst bei "Veröffentlichen" wird deployed und `config` aktualisiert. Das vermeidet unbeabsichtigte Live-Änderungen.
- **Cloudflare Direct Upload:** Statt CI/CD wird die HTML-Datei direkt über die Cloudflare API hochgeladen. Einfacher für ein MVP, da kein Git-Repo pro Kunde nötig ist.
- **Auto-Save mit Debounce:** Manuelle Änderungen werden nach 1 Sekunde Inaktivität automatisch gespeichert, um Datenverlust zu vermeiden.
- **Cloudflare-Token in der DB:** Aktuell werden Cloudflare-Tokens pro Kunde in der DB gespeichert. In Production sollten diese verschlüsselt werden (z.B. mit Supabase Vault).

## Bekannte Limitationen

- **Kein Multi-Template-Support:** Aktuell nur ein Business-Template. Weitere Templates (Restaurant, Portfolio, etc.) sind geplant.
- **Kein Bild-Upload:** Bilder können noch nicht hochgeladen werden. Logos und Bilder müssen als URL referenziert werden.
- **Kein Custom CSS/JS:** Kunden können kein eigenes CSS oder JavaScript hinzufügen.
- **Keine Echtzeit-Vorschau:** Die Vorschau wird per iframe neu geladen, nicht in Echtzeit aktualisiert (kein WebSocket).
- **Cloudflare-Token unverschlüsselt:** In Production sollten API-Tokens mit Supabase Vault oder ähnlichem verschlüsselt werden.
- **Kein Responsive-Editing:** Der Editor ist für Desktop optimiert.
- **Keine Subdomain-Verwaltung:** Custom Domains müssen manuell in Cloudflare konfiguriert werden.

## Vercel Deployment

```bash
vercel
```

Environment Variables im Vercel Dashboard oder via CLI konfigurieren:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add ANTHROPIC_API_KEY
```

**Wichtig:** `SUPABASE_SERVICE_ROLE_KEY` wird nur lokal für das Seed-Script benötigt und sollte NICHT auf Vercel deployed werden.
