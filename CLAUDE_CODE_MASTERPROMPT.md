# MASTERPROMPT – Umbau zur Zero-Fulfillment-Website-Maschine

> **An Claude Code:** Arbeite dieses Dokument vollständig und selbstständig ab, Phase für Phase,
> in der angegebenen Reihenfolge. Falls `ARCHITEKTUR.md` im Repo liegt, ist sie Detail-Referenz –
> bei Widerspruch gilt **dieses** Dokument. Stelle keine Rückfragen außer bei den in Abschnitt 0
> definierten Stop-Bedingungen. Triff pragmatische MVP-Entscheidungen und dokumentiere sie.

---

## 0. Arbeitsregeln (zuerst lesen, dann bauen)

1. **Git-Sicherheitsnetz:** Prüfe `git status`. Uncommittete Änderungen → committen
   (`wip: stand vor mission-v2`). Dann Branch `refactor/mission-v2` erstellen. **Niemals auf
   main arbeiten.** Atomare Commits pro Aufgabe, Conventional-Commit-Messages.
2. **Fortschritts-Log:** Lege `PROGRESS.md` an. Nach jedem Arbeitsblock: was getan, was
   entschieden, was offen. Lege `WARTELISTE.md` an für alles, was einen Menschen braucht
   (API-Keys, Anwalt, DNS, Stripe-Live-Daten).
3. **Selbsttest-Pflicht nach jeder Phase:** Build + Typecheck + Lint + vorhandene Tests müssen
   grün sein (`npm`/`pnpm`/`yarn` – erkenne den Paketmanager am Lockfile). Rot = erst fixen,
   dann weiter.
4. **Stop-Bedingungen (nur dann anhalten und fragen):**
   - Eine Migration würde produktive Daten destruktiv verändern (DROP/verlustbehaftetes ALTER).
   - Es werden Live-Zahlungsdaten/Live-Stripe-Keys benötigt (Testmode geht immer).
   - Ein Ordner sieht aus wie ein zweites, unabhängiges Produktivsystem.
   Fehlende API-Keys sind **kein** Stop: Stub bauen, `.env.example` ergänzen, in
   `WARTELISTE.md` eintragen, weiterarbeiten.
5. **Lösch-Regel:** Nie kommentarlos löschen. Verschiebe Aussortiertes nach `/_legacy/`
   (Importe entfernen, Build muss ohne laufen). Endgültiges Löschen macht der Mensch später.
6. **Datenbank-Regel:** Nur additive Migrationen. Umbenennen = neue Spalte + Backfill + alte
   Spalte als deprecated markieren. Vor jeder Migration: Schema-Dump als Backup ins Repo
   (`/backups/`).
7. **Konfiguration statt Hardcode:** Preise, Laufzeiten, Limits, Feature-Gates leben in
   Config/DB/Stripe – nie in Komponenten.
8. **Inkrementeller Betrieb:** Dieses Dokument wird über mehrere Sessions abgearbeitet.
   Session-Ablauf immer gleich: `PROGRESS.md` lesen → nächste offene Phase ausführen → DoD
   prüfen → committen → `PROGRESS.md` fortschreiben → sauber stoppen. Der Mensch startet
   jede Session mit: „Lies CLAUDE_CODE_MASTERPROMPT.md und PROGRESS.md und führe die
   nächste offene Phase aus."

---

## 1. Die Mission (das baust du)

Eine **Maschine ohne manuelles Fulfillment**, DACH, B2B (lokale Unternehmen):

```
Ads → eigene Marketing-Landingpage → Lead-Eintragung (direkt in die DB)
  → Setter qualifiziert (Telefon) → Termin am Folgetag
  → [1 KLICK im Ops-Dashboard] Demo-Website wird generiert (Scrape ODER Vorlagen-Bibliothek)
  → Zoom-Closing: Demo zeigen → [1 KLICK] Stripe-Zahlungslink senden → Kunde zahlt im Call
  → automatische Freischaltung + Zugang per E-Mail (Magic Link)
  → Fertigstellungs-Wizard (inkl. Domain + Upsell #1: SEO-Plan) → [1 KLICK] „fertigstellen"
  → Kick-off Tag 1–3 (automatisiert oder Call): Upsell #2 GBP / #3 Google Ads
  → Kunde pflegt Seite im Chat-Editor, weitere Upsells per Klick, Verträge stapeln MRR
  → Abrechnung, Mahnung, Sperrung, Laufzeiten & Kündigungsfristen: vollautomatisch
```

**Ein Produkt, ein Repo, ein Deployment.** Die bisher separate Marketing-Landingpage zieht in
dieses Monorepo ein (Phase B): geteiltes Design-System, Leads ohne Webhook-Umweg,
Conversion-Feedback an die Ad-Plattformen aus einer Hand. Host-Routing:

| Host | Inhalt |
|---|---|
| `PRODUKTDOMAIN.de` (+ www) | Marketing-Landingpage (Ads-Ziel, Lead-Formular) |
| `PRODUKTDOMAIN.de/admin` | Ops-Dashboard (Team) |
| `app.PRODUKTDOMAIN.de` | Kundenportal |
| `*.PRODUKTDOMAIN.de` | Demo- & Kundenseiten |
| Kundendomains | Live-Kundenseiten |

**Nordstern-Metriken (daran misst sich jede Entscheidung):**
- Demo-Erfolgsquote ≥ 95 % ohne Handarbeit (inkl. Fallbacks), Dauer < 3 Min.
- Lighthouse Mobile auf Kundenseiten: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 90.
- Zeit Zahlung → Kunde eingeloggt: < 2 Min., ohne menschliches Zutun.
- 0 manuelle Schritte zwischen Zahlung und fertiger Website (Kunde macht den Wizard selbst).
- Jeder Upsell der Leiter (10.4) ist ohne Menschen **kauf- UND auslieferbar**; Calls sind
  Beschleuniger, nie Voraussetzung.
- Lead- und Purchase-Events fließen server-seitig zurück an Meta/Google – sinkende
  Lead-Kosten sind Teil der Maschine, nicht Zufall.

---

## 2. Qualitäts-Standard: „Kein Slop" (nicht verhandelbar, technisch erzwungen)

Jede generierte Website muss sich anfühlen wie von einer teuren Agentur. Das wird nicht durch
„besseres Prompten" erreicht, sondern durch **kuratierte Vorlagen + harte Gates**:

### 2.1 Performance-Gates (CI-Pflicht, Abschnitt 12)
- LCP < 2,5 s, CLS < 0,05, komplett ohne Layout-Sprünge.
- JS-Budget: Basis-Templates ≤ 30 KB gzip; Templates mit Signature-Momenten ≤ 80 KB gzip
  gesamt (Signature-Skripte lazy nach LCP laden). Animationen via CSS-Transforms/Opacity,
  CSS Scroll-Driven Animations mit IntersectionObserver/rAF-Fallback, kein Framework im
  Kundenoutput. Video-Header: ≤ 3 MB, stummer Loop, Poster-Bild als LCP-Element.
- Bilder: AVIF/WebP mit srcset, explizite width/height, lazy unterhalb des Folds, Hero
  preloaded. Bild-Optimierungspipeline beim Upload (Sharp) – Originale nie ausliefern.
- Fonts: **self-hosted** woff2 (max. 2 Familien, subset, `font-display: swap`, preload).
  **Google-Fonts-CDN, Tailwind-CDN oder sonstige Fremd-CDNs im Kundenoutput sind verboten**
  (Performance + DSGVO-Abmahnrisiko). Findest du sie in bestehenden Templates → rausbauen.
- Karten: statisches Kartenbild oder Zwei-Klick-Lösung. Kein direkt ladendes Maps-iframe.

### 2.2 Storytelling-Skelett (jede Vorlage folgt dieser Conversion-Dramaturgie)
1. **Hero:** lokaler Hook (Stadt/Stadtteil im H1), klares Nutzenversprechen, Trust-Badges,
   EIN primärer CTA (Click-to-Call mobil / Anfrage-Formular), starkes Bild.
2. **Social-Proof-Leiste:** Sterne, Anzahl Kunden/Projekte, Jahre am Markt.
3. **Problem/Empathie:** 2–3 Sätze, die den Schmerz des Zielkunden spiegeln.
4. **Leistungen:** 3–6 Karten mit Icons, nutzenorientiert formuliert.
5. **Ablauf der Zusammenarbeit (Pflicht-Sektion bei allen Dienstleistungs-Branchen):**
   3–5 Schritte von der Anfrage bis zum Ergebnis – senkt die Anfrage-Hürde und beantwortet
   „Wie läuft das ab?" vorweg. Die Library hält zwei Varianten: statische Schritt-Karten
   und den **interaktiven Stepper** (klickbare Timeline mit Fortschrittslinie, ein Schritt
   im Fokus, Auto-Advance bis zur ersten Interaktion; Referenz: `flagship_reinigung.html`,
   Sektion `#ablauf`). Bei Gastro/Einzelhandel entfällt die Sektion oder wird zu
   „Ihr Besuch".
6. **Ergebnisse/Galerie** (Vorher/Nachher wo branchentypisch).
7. **Bewertungen:** 2–3 Zitate.
8. **Über uns:** Gesicht + regionale Verwurzelung.
9. **FAQ:** 4–6 Einwände vorwegnehmen.
10. **Finaler CTA + Kontakt:** Formular, Telefon, Öffnungszeiten, Karte.

Technisch dazu: `LocalBusiness`-JSON-LD, OG-Tags, Meta-Title/Description mit Stadt,
Sitemap, Canonical, saubere Heading-Hierarchie.

### 2.3 Copy-Regeln für die Generierung
- Slots mit Zeichenlimits füllen, nie freien Fließtext-Dump. Sie-Form (per Branche schaltbar).
- Lokalität aktiv einweben: Stadt, Stadtteile, Einzugsgebiet, regionale Referenzen.
- **Floskel-Blacklist** (Output wird dagegen geprüft, Treffer = Regenerieren): „in der heutigen
  digitalen Welt", „Tauchen Sie ein", „nahtlos", „Willkommen auf unserer Webseite",
  „maßgeschneiderte Lösungen", „Ihr zuverlässiger Partner für", „hochwertig und professionell".
- Konkrete Zahlen und Fakten aus dem Business-Profil verwenden, nie erfinden. Fehlende Fakten
  → Slot mit neutraler Alternative, niemals halluzinierte Auszeichnungen/Zertifikate.

### 2.4 Animations-Regeln & Signature-Sections
Basis überall: Scroll-Reveal (staggered), Zähler, Hover-Micro-Interactions, dezente
Hero-Einblendung. Dazu je Branche 1–2 fest gebaute **Signature-Sections** – der Wow-Moment
ist Template-Engineering (einmal gebaut, parametrisiert), niemals freie KI-Magie:
- Reinigung: **Scroll-Clean-Reveal** (identische Szene dreckig→sauber, Wipe/Maske an den
  Scroll-Fortschritt gekoppelt) + Vorher/Nachher-Drag-Slider.
- Dach/Bau/Handwerk: Video-Loop-Header (Drohnen-Ästhetik), Projekt-Galerie mit Hover-Zoom,
  Zahlen-Counter.
- Beauty/Praxis: ruhiger Video-Header, Ergebnis-Karussell, weiche Licht-Akzente.
- Gastro: Ambiente-Video-Loop, Menü-Showcase, Galerie-Marquee.
Technik: nur transform/opacity, Canvas-Frame-Scrub sparsam als Growth-Moment, alles lazy
nach LCP, `prefers-reduced-motion` respektieren, kein Scroll-Jacking, CLS bleibt < 0,05.

---

## 3. Ziel-Stack & Anpassungsregeln

**Der bestehende Stack gewinnt, solange er die Mission trägt.** Erst erkennen, dann entscheiden:

| Ziel | Regel |
|---|---|
| Next.js (App Router) + TS + Tailwind | Vorhandenes Next.js behalten; Pages-Router nur migrieren, wenn er aktiv stört |
| Postgres als einzige Wahrheit | Supabase vorhanden → nutzen. Prisma+Postgres vorhanden → auch ok. **SQLite in Produktion → migrieren.** Zwei parallele Datenhaltungen → auf eine konsolidieren |
| Auth: Magic Link (Kunden), Rollen (Team) | Vorhandene Auth-Lösung behalten, Rollen ergänzen |
| Jobs: Inngest (oder vorhandene Queue) | Scrape/Generierung/Mails laufen NIE im Request |
| Stripe: Checkout, Subscriptions, Webhooks, Customer Portal | **Ersetzt** DocuSign/Qonto/GoCardless/Easybill-Reste |
| Resend (Mails), Sentry + Slack-Webhooks | ergänzen falls fehlt |
| **Rendering: multi-tenant aus DB als Rückgrat** | EIN Deployment. Host-Header → Site aus DB → Render mit Cache. **Render-Grundlage sind ausschließlich die beiden Flagships** (Design-System der Branchen-Fabrik); Alt-Templates werden ersetzt, nicht portiert. Bestehender Cloudflare-Deploy-Code wird zur `customer_cloudflare`-Zielumgebung konsolidiert (eine Pipeline, zwei Ziele) statt wildwüchsig je Kunde |
| Scraping: Firecrawl + Google Places | vorhandene Scraper-Ansätze dahinter konsolidieren |
| **Marketing-Landingpage im selben Repo** | Route-Group `(marketing)` auf der Apex-Domain; das separate Landingpage-Projekt wird eingezogen und stillgelegt (Phase B) |
| **Hosting-Ziel pro Site (`deploy_target`)** | `multi_tenant` (unsere Infra – ALLE Demos laufen hier, denn vor der Zahlung existiert kein Kunden-Account) und `customer_cloudflare` (Pages-Projekt im Cloudflare-Account des Kunden; Standard nach Kauf via `DEFAULT_DEPLOY_TARGET`). Anbindung ausschließlich per **scoped Custom-API-Token** (nie Global API Key), geführter Schritt nach der Zahlung, Token verschlüsselt at rest, Scope-Verifizierung vor Speicherung. Token ungültig/widerrufen → automatischer Fallback auf `multi_tenant` |
| Domain-Registrierung | Neue Domains per Reseller-API (z. B. INWX/Openprovider) **im Namen des Kunden**; bei `customer_cloudflare` wandert DNS in dessen Zone (Nameserver-Setup automatisiert) |
| Server-side Tracking | Meta Conversions API + Google Enhanced Conversions: Lead-Event (Formular) und Purchase-Event (Stripe-Webhook) |
| KI-Asset-Erzeugung | Higgsfield API (Bilder + Video-Loops; alternativ fal.ai) befüllt die `asset_bank`; Kosten je Asset loggen. Nur menschlich freigegebene Assets gehen in Demos/Live |

---

## 4. PHASE A – Inventur & Audit (nichts bauen, nur verstehen)

1. Erfasse: Framework/Version, Paketmanager, DB + ORM, Auth, vorhandene Routen/API-Endpoints,
   Templates, Jobs/Crons, externe Services (grep nach `docusign|qonto|easybill|gocardless|
   cloudflare|stripe|resend|sendgrid|prisma|supabase`), ENV-Variablen, tote Dateien
   (nicht importiert), doppelte Wahrheiten (mehrere Kundentabellen/-listen).
2. Schreibe **`AUDIT.md`** mit drei Listen und Begründung je Eintrag:
   - **KEEP** – trägt die Mission (Mapping auf Abschnitt der Zielarchitektur).
   - **REFACTOR** – richtige Idee, falsche Form (was konkret ändern).
   - **KILL → /_legacy/** – siehe Kill-Kriterien.
3. **Kill-Kriterien (automatisch KILL):** Angebots-PDF/DocuSign-Signaturflow, Qonto/Easybill/
   GoCardless-Integrationen, zweite/dritte Datenwahrheit, ungenutzte Routen/Komponenten
   (kein Import, kein Traffic-Hinweis), Fremd-CDNs in Kunden-Templates, hartkodierte
   Preise/Texte, „Experimente"-Ordner ohne Verwendung, **sämtliche Alt-Vorlagen/Templates
   des früheren Generators** (vorher brauchbare Ideen, Sektions-Konzepte und gute
   Copy-Zeilen in `LEGACY_NOTIZEN.md` sichern – die Vorlagen selbst werden durch die
   Flagship-Zerlegung ersetzt, nicht überarbeitet). **Ausnahme:** bestehender
   Cloudflare-Pages-Deploy-Code ist REFACTOR, nicht KILL – er wird zur
   `customer_cloudflare`-Pipeline konsolidiert.
4. Erst wenn `AUDIT.md` committed ist → Phase B.

**DoD:** `AUDIT.md` vollständig, Stack-Steckbrief oben drin, jede Datei des Repos einer Liste
zugeordnet (Ordner-Ebene reicht bei klaren Fällen).

## 5. PHASE B – Aufräumen & Zusammenziehen

1. KILL-Liste nach `/_legacy/` verschieben, Importe kappen, Build grün halten.
2. REFACTOR-Liste umsetzen, sofern < 30 Min pro Punkt; größere Punkte als TODO in die
   jeweilige Bauphase unten einsortieren.
3. **Landingpage einziehen:** Das separate Landingpage-Projekt als Route-Group `(marketing)`
   importieren (liegt es nicht im Workspace → Pfad in `WARTELISTE.md` anfordern und Phase mit
   Platzhalter-Landingpage fortsetzen). Komponenten/Assets übernehmen, aufs gemeinsame
   Design-System heben. Lead-Formular schreibt per Server Action **direkt** in `leads` –
   kein Webhook-Umweg – inkl. UTM-/Kampagnen-Feldern; Danke-Seite mit Terminhinweis.
   Meta-CAPI-Lead-Event server-seitig (nur mit Consent; Consent-Banner existiert NUR auf der
   Marketing-Domain). Altes Projekt: Redirect + README „stillgelegt, lebt im Monorepo".
4. **Host-Routing-Middleware:** Tabelle aus Abschnitt 1 implementieren; Auth-Cookies je
   Bereich sauber scopen (Team vs. Kunde vs. öffentlich).
5. Eine `README.md`-Sektion „Architektur ab V2" mit Missions-Diagramm und Host-Tabelle.

**DoD:** Build/Typecheck/Lint grün ohne `/_legacy/`; Landingpage rendert aus dem Monorepo und
ein Test-Submit erzeugt einen Lead mit UTM-Daten in der DB; `PROGRESS.md` aktualisiert.

## 6. Datenmodell (Ziel; additiv migrieren, Vorhandenes mappen)

Kern (falls schon ähnlich vorhanden: angleichen statt doppeln):
`leads`, `scrape_jobs`, `business_profiles`, `sites` (mit `content jsonb`, `draft_content`,
`status demo|live|suspended`, `slug`, `custom_domain`, `demo_geprueft bool`, `plan`),
`site_versions`, `customers`, `subscriptions` (mit `payment_settled bool`), `checkout_links`,
`upsell_orders`, `chat_messages`, `processed_webhook_events` (Stripe-Idempotenz), `audit_log`,
`form_submissions`.

**Neu in diesem Umbau:**

```sql
-- Vorlagen-Bibliothek (das Herz der Maschine)
create table section_library (
  id uuid primary key default gen_random_uuid(),
  section_type text not null,       -- hero|social_proof|problem|leistungen|prozess|galerie|bewertungen|ueber_uns|faq|cta_kontakt
  variant_key text unique not null, -- z. B. 'hero_split_bold_v2'
  branchen text[] not null,         -- ['dachdecker','shk'] oder ['*']
  style_tags text[] not null,       -- ['premium','clean','warm','bold']
  html_template text not null,      -- mit {{slots}}, scoped CSS inline/extrahiert
  copy_slots jsonb not null,        -- {headline:{max:60,hinweis:'lokaler Hook'},...}
  asset_slots jsonb,                -- {hero_img:{tags:['handwerk','team']}}
  perf_budget jsonb,                -- {js_kb:0,img_count:2}
  quality_status text default 'draft',  -- draft|approved  (nur approved wird ausgespielt)
  created_at timestamptz default now()
);

create table library_pages (        -- kuratierte Komplett-Kompositionen ("geile Beispiele")
  id uuid primary key default gen_random_uuid(),
  name text, branche text not null, style_tag text,
  section_variant_keys text[] not null,   -- geordnete Liste
  preview_slug text,                       -- interne Demo unter preview-*.DOMAIN
  quality_status text default 'draft'
);

create table asset_bank (                 -- kuratierte Bild- & Video-Bank (ersetzt stock_assets)
  id uuid primary key default gen_random_uuid(),
  storage_path text not null, medium text not null,      -- image|video
  branchen text[] not null, style_tags text[],
  szene_typ text,                         -- hero|vorher|nachher|detail|team|galerie|video_loop
  pair_id uuid,                           -- verknüpft Vorher/Nachher derselben Szene
  quelle text not null,                   -- ai_higgsfield|ai_fal|stock|kunde
  gen_prompt text, gen_seed text,         -- Reproduzierbarkeit bei KI-Assets
  lizenz text, credit text, breite int, hoehe int,
  quality_status text default 'draft'     -- nur 'approved' wird ausgespielt (Mensch prüft!)
);

-- Vertragslogik (alles konfigurierbar!) – EIN Vertrag je Produkt/Abo-Position:
-- Hauptprodukt Standard 24/24/3, SEO-Plan z. B. 12/12/3, GBP-Pflege 6/6/1 …
-- Verträge stapeln sich pro Kunde = MRR-Stapelung mit produktgenauen Laufzeiten.
create table contracts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  product_key text not null,                -- 'website_starter'|'seo_plan'|'gbp_pflege'|'ads_starter'|...
  stripe_subscription_id text, stripe_subscription_item_id text,
  start_at timestamptz not null,
  mindestlaufzeit_monate int not null default 24,
  verlaengerung_monate int not null default 24,
  kuendigungsfrist_monate int not null default 3,
  laufzeitende timestamptz not null,        -- rollt bei Verlängerung vor
  gekuendigt_am timestamptz, wirksam_zum timestamptz,
  status text not null default 'laufend'    -- laufend|gekuendigt|beendet
);

-- Ergänzungen an Bestandstabellen:
-- sites:     domain_status text default 'keine'   -- keine|dns_wartet|aktiv
--            domain_registrar_ref text            -- Bestellreferenz bei Registrierung im Kundennamen
--            deploy_target text default 'multi_tenant'   -- multi_tenant|customer_cloudflare
--            cf_pages_project text, deploy_status text, last_deploy_at timestamptz
-- customers: cf_account_id text,
--            cf_token_encrypted text              -- scoped Custom-Token, verschlüsselt (Sealed Box);
--                                                 -- NIE loggen, NIE ins Frontend, Scope bei Annahme verifizieren
-- leads:     utm jsonb                            -- Kampagnen-Attribution von der Landingpage

-- Warteschlange für die wenigen bewusst manuellen Handgriffe (z. B. GBP-Ersteinrichtung durch VA):
create table manual_tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid, site_id uuid,
  task_key text not null,                   -- 'gbp_setup'|'cf_reconnect'|'custom'|...
  payload jsonb, status text default 'offen',    -- offen|in_arbeit|erledigt
  assigned_to text, created_at timestamptz default now(), done_at timestamptz
);
-- Admin-Ansicht /admin/worklist + Slack #worklist bei neuem Task. Ein Upsell mit
-- fulfillment='va_manual' erzeugt beim Kauf automatisch einen manual_task – Verkauf bleibt 1 Klick.
```

**RLS/Autorisierung:** Kunden sehen ausschließlich eigene Datensätze; `/admin` nur mit Team-Rolle.

## 7. PHASE C – Vorlagen-Bibliothek, Asset-Werk & Seeding (vor der Pipeline!)

> **Detail-Ausführung:** Liegt `BRANCHEN_FABRIK_PROMPT.md` im Repo, gilt sie als
> verbindliche Vertiefung dieser Phase (Higgsfield-API als Asset-Motor, Demo-Assets
> immer frisch generiert, `/anfrage`-Vorqualifizierungs-Unterseite als Standard,
> 16 Start-Branchen + Auto-Seeding neuer Branchen mit Mensch-Freigabe-Gate). Bei
> Widerspruch gewinnt die Branchen-Fabrik.

**Prinzip: Wir befüllen kuratierte Vorlagen mit Daten – wir lassen die KI keine Seiten
erfinden.** Der Wow-Faktor (Signature-Sections, Video-Header, Vorher/Nachher) ist fest im
Template verbaut; KI liefert nur Copy-Slots und ausgewählte Assets.

1. **Renderer anbinden:** Section-Templates rendern `content`-JSON (Slots), zusammengesetzt
   nach `library_pages`-Komposition. Grundlage sind **ausschließlich die aus den beiden
   Flagships extrahierten Section-Templates** (F2 der Branchen-Fabrik). Alt-Templates
   werden nicht überführt – sie liegen in `/_legacy/`, ihre brauchbaren Ideen in
   `LEGACY_NOTIZEN.md`.
2. **Flagship-first statt Fließband:** Je Branche EINE Flagship-Demo von Hand bauen und
   iterieren, bis der Mensch sie explizit freigibt (**Geschmacks-Gate** – ohne diese Freigabe
   wird nichts parametrisiert). Danach **Stresstest vor der Parametrisierung:** dieselbe
   Flagship mit 3 abweichenden Datensätzen rendern (sehr langer Firmenname, 3 statt 8
   Leistungen, andere Stadt, keine Bewertungen) – erst wenn alle 3 sauber aussehen, wird in
   Library-Varianten zerlegt und eine zweite Stil-Richtung abgeleitet. Start-Branchen in
   dieser Reihenfolge: `reinigung` (**die bestehende ReiniFix-Demo neu bauen = direkter
   Alt-gegen-Neu-Beweis**), `dachdecker_shk`, `kosmetik_beauty`, `gastro_restaurant`.
3. **Asset-Werk befüllen (`asset_bank`):** je Branche 30–50 Assets vorab generieren
   (Higgsfield/fal.ai), menschlich kuratieren – nur `approved` wird je ausgespielt:
   - Hero-Szenen, Detail-Shots, Galerie-Material im einheitlichen Look pro Branche
     (fester Style-Prompt-Baukasten; Prompt + Seed speichern).
   - **Vorher/Nachher-Paare** (Reinigung: Küche, Bad, Fenster, Teppich, Baustelle …):
     sauberes Bild generieren → per Bild-Editing-Modell kontrolliert „verschmutzen".
     Degradation garantiert dieselbe Szene – die Gegenrichtung funktioniert nicht
     zuverlässig. `pair_id` verknüpft beide.
   - Je Branche 5–10 **Video-Loops** (5–8 s, z. B. Seedance/Kling via Higgsfield) für
     Growth-Header; nur abgenommene Loops landen in der Bank.
   - Keine Menschen-Nahaufnahmen mit Uncanny-Risiko, keine erkennbaren Marken/Logos in
     KI-Bildern; Lizenz/Quelle je Asset dokumentiert. **Keine Assets von fremden
     „Vorbild-Websites" kopieren – Inspiration ja, 1:1 nein.**
4. Alle Kompositionen mit Signature-Section (2.4), Animations-Snippet, JSON-LD, Formular,
   Impressum/Datenschutz-Sektionen; Copy-Slots mit Beispieltexten in Agentur-Qualität
   (Few-Shots für die Pipeline).
5. **Admin-Library-UI** (`/admin/library`): Varianten-Preview mit Dummy-Daten,
   `draft→approved`, Kompositions-Builder, Asset-Bank-Browser mit Freigabe-Workflow. Button
   **„Als Vorlage übernehmen"** an jeder Kunden-Site → kopiert (anonymisiert) in die
   Bibliothek – so wächst die „riesen Datenbank" als Schwungrad.

**DoD:** 4 Flagships vom Menschen freigegeben (Geschmacks-Gate in `PROGRESS.md`
dokumentiert) + je eine abgeleitete Zweitvariante = 8 approved Kompositionen unter
Preview-Slugs; Reinigung enthält Scroll-Clean-Reveal + Vorher/Nachher-Slider mit echten
Paar-Assets; Lighthouse Mobile ≥ 90/95/90 auf allen; Budgets aus 2.1 eingehalten; keine
Fremd-CDNs.

## 8. PHASE D – Generierungs-Pipeline v2 (One-Click-Demo)

Button am Lead → Job mit Status-Streaming ins Dashboard:

1. **Datenbeschaffung mit Fallback-Kette:** Firecrawl-Scrape der Prospect-Website (Timeout 60 s,
   1 Retry) → wenn leer/kaputt: Google Places (Name, Adresse, Öffnungszeiten, Kategorie,
   Bewertungen, Fotos-Metadaten NICHT übernehmen) → wenn auch leer: Dashboard zeigt
   2-Minuten-Formular (Branche, Ort, 3 Leistungen, Telefon). **Kein Pfad endet ohne Demo.**
2. **Normalisieren** zu `business_profiles.data` (Fakten! Originaltexte nur intern als Quelle).
3. **Komposition wählen:** Matching Branche→`library_pages` (Fallback `['*']`-Varianten),
   Stil-Rotation oder Setter-Auswahl (Dropdown „premium/clean" beim Klick).
4. **Slots befüllen:** Claude (claude-sonnet-4-6) füllt ausschließlich `copy_slots` als JSON –
   validiert (Zod: Pflichtslots, Zeichenlimits, Floskel-Blacklist, Stadt muss in Hero + Title
   vorkommen). Max. 2 Retries mit Fehler-Feedback, sonst Job failed + Slack `#errors`.
5. **Assets:** aus der `asset_bank` nach Branche+Stil (nur `approved`); optional 1–3
   Custom-Assets live generieren (z. B. Hero mit Stadt-Bezug oder ein individuelles
   Vorher/Nachher-Paar; Budget ≤ 0,50 €/Demo, Timeout 90 s, Fallback = Bank).
   **Original-Fotos des Prospects:** Der Scraper lädt alle Bilder der Alt-Website in einen
   internen Quarantäne-Bucket (`asset_bank.quelle='prospect_quarantaene'` – wird niemals
   automatisch öffentlich ausgeliefert). Standard in der Demo: KI-/Bank-Assets, Logo-Slot
   als Typo-Logo (Rechte liegen oft bei Fotograf oder Alt-Agentur). Am Lead gibt es einen
   Schalter **„Original-Fotos in Demo verwenden"** (Config `DEMO_ORIGINAL_FOTOS`, default
   aus) mit sichtbarem Risiko-Hinweis – das ist immer eine bewusste Entscheidung des
   Menschen pro Lead, nie Automatik. Der Setter aktiviert ihn z. B. bei offensichtlich
   selbst geschossenen Handy-Fotos; „unsere echten Fotos auf der neuen Seite" ist im
   Closing ein starkes Argument.
6. **Konsistenz-Validator (hartes Gate nach dem Rendern):**
   - **Orts-Konsistenz:** jede Orts-Erwähnung stammt aus der Stadt-Variable; Scan des
     gerenderten Outputs gegen eine Städte-Blockliste (Top-200 DE minus Kundenstadt) –
     ein „München" auf einer Berliner Demo ist ein Fail.
   - Keine rohen HTML-Entities (`&uuml;` u. ä.), keine leeren Bild-Slots, keine toten
     `#`-Links, keine Widersprüche (verspricht die Sektion „Festpreise", müssen Preise
     gesetzt sein – sonst Sektion automatisch umformulieren oder ausblenden).
   - **Bewertungen niemals erfinden:** Reviews nur aus echten Places-Daten (Anzahl,
     Schnitt, Zitate sofern vorhanden); ohne echte Daten wird die Sektion ausgeblendet –
     erfundene „Google-Bewertungen" sind auf Live-Seiten abmahnfähig (UWG).
   Validator-Fail = Job-Retry mit Fehlerbericht, danach `failed` – niemals `demo_bereit`.
7. **Site anlegen:** `slug.DOMAIN`, `status='demo'`, `noindex`, dezentes Demo-Badge,
   Kosten des Laufs loggen (Tokens+Scrape+Assets in Cent).
8. **Mensch-Gate:** Checkbox **„Demo geprüft"** (30-Sekunden-Blick) schaltet Lead auf
   `demo_bereit`. Dashboard-Hinweis: „Demo direkt nach Qualifizierung generieren, nicht vor
   dem Termin."

**DoD:** Golden-Set-Lauf (Abschnitt 12): 10 Testfirmen → ≥ 9 brauchbare Demos < 3 Min ohne
Eingriff, davon mind. 3 über Places-Fallback und 1 über Manuell-Formular.

## 9. PHASE E – Checkout, Vertrag, Provisioning

1. **Zahlungslink-Button** am Lead: Paketwahl → Stripe Checkout Session (`mode=subscription`,
   Setup-Fee als One-time-Item, `card`+`sepa_debit`, `locale=de`, `customer_email` vorbefüllt,
   `metadata {lead_id, site_id, plan}`, 24 h gültig). **Vertragstransparenz im Checkout:**
   Consent-Checkbox + Custom-Text zeigt Laufzeit/Verlängerung/Frist im Klartext (aus Config).
   Versand per Resend-Mail + kopierbare URL fürs Zoom-Fenster. **Derselbe Mechanismus
   existiert auch am Kunden** (nicht nur am Lead) – damit schließt der Closer Upsells im
   Kick-off-Call mit einem Klick.
2. **Webhooks** (`processed_webhook_events`-Idempotenz, Handler als Upserts, Reihenfolge egal):
   - `checkout.session.completed` → Customer + Auth-User, Site `demo→live` (noindex bleibt bis
     Wizard fertig), `contracts`-Zeile **je gekauftem Produkt** aus Config, Magic-Link-Mail,
     Lead `gewonnen`, Realtime-Badge „BEZAHLT ✅" im Dashboard, Slack `#money`,
     Purchase-Event (Wert = Setup + Plan) server-seitig an Meta CAPI / Google.
   - `invoice.paid` → `payment_settled=true`.
   - `invoice.payment_failed` → Dunning-Sequenz Tag 0/3/7, `past_due`.
   - 14 Tage past_due → Site `suspended` (Wartungsseite), Reaktivierung durch Zahlung.
3. **SEPA-Realität:** Freischaltung sofort bei `completed`, Settlement kommt Tage später –
   platzt es, greift Dunning/Suspend automatisch. Kein manueller Schritt.
4. **Kündigungslogik (je Vertrag; Hauptprodukt Standard 24/24/3):** Stripe Customer Portal
   ohne Selbst-Kündigung konfigurieren. Eigener Portal-Flow „Vertrag kündigen" pro
   `contracts`-Eintrag: berechnet das früheste Wirksamdatum (Laufzeitende, wenn Frist gewahrt;
   sonst Ende der Folgeperiode), zeigt es an, bestätigt per Mail, setzt die Kündigung zum
   Stichtag in Stripe um (ganzes Abo via `cancel_at`, einzelne Upsell-Position via geplanter
   Item-Entfernung). Cron rollt `laufzeitende` bei Nicht-Kündigung um `verlaengerung_monate`
   vor. Alle drei Werte sind Config – **falls der Anwalt z. B. 12 Monate
   Verlängerung vorgibt, ist das eine Zeilenänderung.** Optionaler Flag
   `RENEWAL_REMINDER_MAIL` (default off).

**DoD:** Stripe-Testmode-Durchlauf Karte + SEPA: Zahlung → Site live → Login-Mail → Badge im
Dashboard; Kündigungs-Flow zeigt korrektes Wirksamdatum für 3 Beispielszenarien (früh, in der
Frist, zu spät); fehlgeschlagene Testzahlung führt automatisch zu Mahnmail + Suspend.

## 10. PHASE F – Kundenportal: Wizard, Chat-Editor, Pakete & Upsell-Maschine

### 10.1 Fertigstellungs-Wizard (Demo → finale Website, „1 Klick")
Nach erstem Login geführter Flow (Blocker-Banner bis erledigt):
1. Impressums-/Pflichtangaben (Formular, validiert) → generiert Impressum + Datenschutz.
2. **Fotos & Logo:** Logo-Upload (optional; sonst Typo-Logo) + eigene Fotos (Sharp-Pipeline).
   **Foto-Übernahme von der Alt-Website:** Grid aller Fotos aus dem Quarantäne-Bucket →
   Kunde wählt aus und bestätigt per Checkbox, dass er die Nutzungsrechte besitzt (inkl.
   Rechten abgebildeter Personen; Freistellungsklausel in den AGB → Anwalt,
   `WARTELISTE.md`). Erst nach Bestätigung: Import, WebP-Optimierung, Slot-Zuordnung per
   Klick. Ohne Bestätigung bleiben die KI-Assets aktiv.
3. Fakten-Check: Leistungen/Öffnungszeiten/Telefon bestätigen oder korrigieren.
4. **Domain & Hosting (Cloudflare-Connect):** Wunschdomain-Suche + automatische Registrierung
   **im Namen des Kunden** via Reseller-API, oder geführte Verbindung einer Bestandsdomain.
   Danach der geführte Cloudflare-Schritt – **Reihenfolge fix: erst Zahlung, dann Connect**
   (im selben Call per Screenshare oder später allein im Wizard): Account anlegen →
   **Custom-API-Token mit minimalem Scope** erstellen (Schritt-für-Schritt mit Screenshots
   und vorbereitetem Token-Template; niemals der Global API Key) → Token einfügen → System
   verifiziert Scope, verschlüsselt, legt Pages-Projekt an, deployt, setzt DNS. Scheitert
   oder vertagt der Kunde den Schritt: Site läuft nahtlos auf `multi_tenant` weiter, Wizard
   erinnert später – **die Maschine blockiert nie.**
5. **Sichtbarkeits-Schritt = Upsell #1 (SEO-Plan):** Nutzen in 3 Punkten, Preis + eigene
   Laufzeit transparent sichtbar, 1-Klick-Buchung über gespeicherte Zahlungsmethode –
   überspringbar, keine Dark Patterns (Intransparenz erzeugt Chargebacks).
6. **Button „Website fertigstellen":** ersetzt Stock- durch Kundenbilder wo hochgeladen,
   entfernt Demo-Reste, setzt `noindex` ab, reicht Sitemap ein, läuft automatische QA
   (tote Links, fehlende Alts, Formular-Testsubmit, Lighthouse-Quickcheck) → live-final.
   Fehler in der QA → verständliche Hinweise, kein Silent-Fail.

### 10.2 Chat-Editor (streng geführt)
- Tools: `get_site_content`, `propose_patch(operations[])` mit ausschließlich strukturierten
  Ops (`update_text`, `swap_image_from_pool_or_upload`, `set_theme_preset`,
  `add_section_from_library`, `reorder`, `toggle`). **Kein rohes HTML/CSS, nie.** Zod-Validierung
  jedes Patches, Draft → Preview → expliziter „Veröffentlichen"-Klick → `site_versions`
  (1-Klick-Rollback).
- Verkaufspsychologische Leitplanken im System-Prompt: Hero-Struktur, primärer CTA und
  Kontakt sind nicht löschbar; bei konversionsschädlichen Wünschen kurz begründen + Alternative
  anbieten. Farben/Fonts nur aus Presets. Rate-Limit 50 Nachrichten/Tag/Kunde.

### 10.3 Pakete & Feature-Gates (`config/plans.ts`, gemappt auf Stripe Products)

Pakete differenzieren über **Volumen + Inklusiv-Level**, nicht über Upsell-Features – die
10.5-Produkte sind in keinem Paket fest enthalten (Kannibalisierungs-Schutz):

| | STARTER | BUSINESS ⭐ | GROWTH |
|---|---|---|---|
| Seiten | Onepager | bis 5 Unterseiten | bis 10 Unterseiten |
| KI-Editor, Domain, Hosting, DSGVO, Formular + Inbox | ✓ | ✓ | ✓ |
| Lokal-SEO-Setup (Stadt-Keywords, Schema.org, GBP-Verknüpfung) | – | ✓ | ✓ |
| Terminbuchung | – | – | ✓ |
| **Visual-Level** | Premium-Statik + Micro-Animationen | Signature-Section + Vorher/Nachher | Video-Header + Scroll-Story |
| Upsell-Credits (frei wählbar aus 10.5) | 0 | 1 | 2 |

(Preise/Setup-Fees ausschließlich in Stripe pflegen; Tabelle = Feature-Wahrheit im Code.
Upsell-Credits als Config-Flag `plan.included_upsell_credits` – im Portal einlösbar,
erzeugen einen `contracts`-Eintrag mit Laufzeit = Hauptvertrag.)

**Demo-Level-Regel:** Demos rendern standardmäßig auf Business-Level; ein Umschalter
(`?level=growth`, auch als Button im Ops-Dashboard) zeigt live im Call den Growth-Look
(Video-Header an/aus) – das Upgrade wird gezeigt statt erklärt. Kauft der Kunde Starter,
rendert die Live-Site auf Starter-Level.

### 10.4 Upsell-Leiter (`config/upsells.ts` – Touchpoint, Modell, Fulfillment je Produkt)

**Prinzip: Verkauft wird von Menschen (Closer im Call) oder per Selbstbuchung im Portal –
ausgeliefert wird immer von der Maschine.** Jeder Upsell hat genau zwei Kauf-Wege
(1-Klick-Zahlungslink am Kunden im Ops-Dashboard / Buchen-Button im Portal) und genau einen
Fulfillment-Typ: `auto` (Zahlungs-Webhook startet den Provisioning-Job sofort) oder
`va_manual` (Webhook erzeugt `manual_task` für die VA). Die Touchpoints unten sind optionale
Automatik-Verstärker, keine Voraussetzung.

| Touchpoint | Produkt | Modell | Fulfillment |
|---|---|---|---|
| Wizard Schritt 5 | **SEO-Plan** | monatlich, eigene Laufzeit (Config) | auto (Phase G) |
| Kick-off Tag 1–3 | **GBP-Einrichtung/-Pflege** | einmalig + monatlich | weitgehend auto (Phase G) |
| Kick-off / Tag 30 | **Google Ads Starter** | monatliche Pauschale; Werbebudget zahlt der Kunde direkt an Google | teil-auto (Phase G, ehrlicher Scope) |
| Editor (Feature-Gate) | Plan-Upgrade, Terminbuchung, Unterseite | Proration / einmalig | auto |
| Tag 14 / Tag 60 (Cron) | Bewertungs-System, Stadtteil-Seiten-Paket / Konkurrenz-Radar, Saison-Automat | einmalig / monatlich | auto |

- **Kick-off-Mechanik:** `KICKOFF_MODE=auto|call`. *auto*: 5-teilige Mail-Sequenz + interaktive
  „Erfolgsplan"-Checkliste im Portal – jeder erledigte Schritt endet in einem Upsell-CTA.
  *call*: buchbarer 15-Minuten-Termin; das Ops-Dashboard zeigt dem Closer am Kunden
  1-Klick-Zahlungslinks für jeden Upsell (Mechanik aus Phase E). Beide Modi nutzen dieselben
  Produkte – der Call ist Beschleuniger, nie Voraussetzung.
- **Editor als Verkäufer:** Fragt der Kunde nach einem gesperrten Feature („ich will eine
  Terminbuchung"), antwortet der Bot mit Nutzen + Buchungs-Button → gespeicherte
  Zahlungsmethode (Bestätigungsklick, Proration bei Plan-Upgrade) → automatische
  Provisionierung je `product_key` → `upsell_orders`.
- **Jede Buchung erzeugt einen eigenen `contracts`-Eintrag mit eigener Laufzeit** – MRR
  stapelt sich pro Kunde, Kündigungen laufen produktgenau über denselben Fristen-Flow.
- Nerv-Schutz = Churn-Schutz: abgelehnte oder ignorierte Angebote 60 Tage nicht erneut
  pushen; jedes Angebot zeigt Preis + Laufzeit im Klartext.

### 10.5 Upsell-Produktkatalog – final (vom Menschen freigegeben)

| Produkt | Modell | Fulfillment-Mechanik (startet bei Zahlung automatisch) |
|---|---|---|
| **SEO-Unterseiten-Abo** | mtl., eigene Laufzeit | Cron: 1 lokale Keyword-Seite/Monat aus der Bibliothek; Kunde gibt per 1 Klick frei (oder Auto-Publish-Opt-in) |
| **Bewertungs-System** (QR + Funnel-Seite) | einmalig + mtl. | Funnel-Page aus Library, druckfertiges QR-PDF für die Theke, Zähler im Report. **Ohne Review-Gating** (Google-Richtlinie); Mail-Bitten nur an Kontakte mit dokumentierter Einwilligung (UWG) |
| **Konkurrenz-Radar** | mtl. | Cron-Report „Ihre 3 Wettbewerber in {Stadt}" (Bewertungen, Sichtbarkeit) via Places/Rank-API, Claude-Zusammenfassung per Mail |
| **Stadtteil-Seiten-Paket** (10 Umkreis-Seiten) | einmalig | Job generiert Seiten aus Library + Places-Geodaten, interne Verlinkung, Sitemap-Update |
| **Saison-Kampagnen-Automat** | mtl. | Branchen-Kalender blendet Hero-Banner + Aktionsseite zu Saisonterminen automatisch ein/aus (Freigabe-Klick) |
| GBP-Ersteinrichtung | einmalig | `fulfillment='va_manual'` → `manual_task` für die VA (bewusste Ausnahme) |

**Umsetzungsreihenfolge:** SEO-Abo + Stadtteil-Paket zuerst (beide nutzen dieselbe
Generierungs-Pipeline aus Phase D) → Bewertungs-System → Konkurrenz-Radar → Saison-Automat.
Jedes Produkt braucht vor Launch genau vier Dinge: Stripe-Product, Provisioning-Job,
Portal-Kachel, Zeile in `config/upsells.ts` – mehr nicht.

**Bewusst verworfen (nicht bauen, nicht wieder vorschlagen):** Anruf-Tracking,
Lead-Alarm-SMS, Rechtstexte-Abo, Profi-E-Mail-Adresse, Anfrage-Konfigurator,
Foto-Veredelung. Bei Bedarf später reaktivierbar.

**DoD:** Wizard-Durchlauf E2E; gesperrtes Feature führt zu funktionierendem Upgrade-Kauf im
Testmode inkl. automatischer Freischaltung; invalider Patch wird abgewiesen; Rollback geht.

## 11. PHASE G – Domains, Upsell-Fulfillment, Restautomatik

- **Deploy auf Kunden-Cloudflare (`deploy_target='customer_cloudflare'`):** Render →
  statischer Export → Pages Direct Upload ins Kunden-Konto (Projekt legt das System an);
  „Veröffentlichen" im Editor triggert asynchronen Re-Deploy mit Statusanzeige. Previews und
  Drafts rendern weiterhin intern. Token-Fehler (widerrufen/abgelaufen) → automatischer
  Fallback auf `multi_tenant`, Reconnect-Mail an den Kunden, `manual_task` erst nach 2
  gescheiterten Versuchen.
- **Custom Domain:** bei `multi_tenant` via Vercel Domains API / Cloudflare for SaaS; bei
  `customer_cloudflare` DNS direkt in der Kunden-Zone (automatisch per Token). Status
  „wartet auf DNS" mit Recheck-Button; Neuregistrierung im Kundennamen via Reseller-API
  inkl. automatischem Nameserver-Setup.
- **SEO-Plan-Automation (Upsell #1):** monatlicher Cron je Abonnent: 1 lokale
  Keyword-Landingpage aus der Bibliothek generieren (Slot-Pipeline aus Phase D
  wiederverwenden; Kunde gibt per 1 Klick frei), technischer SEO-Check (Meta, Links,
  Ladezeit), monatlicher Sichtbarkeits-Report per Mail (Rank-API wie DataForSEO; ohne Key →
  Stub + `WARTELISTE.md`).
- **GBP-Ersteinrichtung (Upsell #2, bewusst `va_manual`):** Kauf erzeugt automatisch einen
  `manual_task` mit allen Daten aus dem Business-Profil; die VA arbeitet `/admin/worklist`
  ab und hakt ab (Slack `#worklist`). Spätere Ausbaustufe (erst ab ≥ 20 Käufern): laufende
  GBP-Pflege via Manager-Zugriff auf unser Orga-Konto + API (Posts, Stammdaten-Sync).
- **Google Ads Starter (Upsell #3, ehrlicher Scope):** Kunden-Ads-Konto unter unserem MCC
  (Einladung per Mail), **Werbebudget läuft direkt Kunde↔Google – niemals über unsere
  Zahlungsmittel**. Templated Kampagnen-Setup je Branche (Search/PMax) aus Website-Content,
  Conversion-Import (Formular/Anruf), regelbasierte Wochen-Checks + Monatsreport per Mail.
  Echte Hand-Optimierung ist NICHT Teil des Produkts – Leistungsbeschreibung und Preis
  entsprechend ehrlich halten.
- Formular-Lead-Inbox im Portal (Submissions, Mail-Weiterleitung mit Reply-To, Honeypot,
  Rate-Limit; bei Mailfehler trotzdem 200 für den Besucher).
- Rechnungen/Zahlungsmethode via Stripe Customer Portal Link.
- Cookielose Analytics auf Kundenseiten (First-Party-Pageview-Counter) → kein Cookie-Banner;
  Consent-Banner existiert ausschließlich auf der Marketing-Landingpage (Pixel/CAPI).

**DoD:** Domain-Neuregistrierung läuft mit gemocktem Registrar durch; SEO-Cron erzeugt eine
freigebbare Landingpage; GBP-Flow bis Status „Zugriff erteilt" testbar; Ads-Setup erzeugt
einen Kampagnen-Entwurf im Test-Modus.

## 12. PHASE H – Qualitäts-CI & Monitoring (die Gates scharf schalten)

1. **Golden-Set:** `test/golden_set.json` – 10 reale Firmen (5 mit Website, 3 nur
   Google-Eintrag, 2 ohne alles; Platzhalter anlegen, Mensch trägt echte ein →
   `WARTELISTE.md`). CI-Job: generiert alle 10, prüft Schema, Blacklist, Stadt-im-Hero.
2. **Lighthouse-CI** gegen die 8 Bibliotheks-Previews + 3 Golden-Demos: Budgets aus 2.1,
   Unterschreitung = Build rot.
3. **E2E (Playwright), Stripe-Testmode:** Landingpage-Formular → Lead mit UTM in DB → Demo
   generieren (gemockter Scrape) → Checkout → Webhook-Simulation → Login → Wizard inkl.
   Domain-Schritt (gemockter Registrar) + SEO-Upsell-Kauf → Fertigstellen → Chat-Edit →
   Publish → Rollback → Kick-off-Sequenz wird getriggert.
4. Sentry auf App + Jobs; Slack `#errors` bei Job-Fails; tägliche Kosten-Summary (Tokens,
   Scrapes) nach `#money`; `GENERATION_KILL_SWITCH`-ENV.
5. **Kennzahlen-Dashboard `/admin/kennzahlen`** – der Grund, warum die Landingpage im
   Monorepo lebt: Funnel je UTM-Kampagne/Adset (Leads → Termine → Show → Close → MRR),
   ARPU, Upsell-Quote je Produkt, Churn, MRR-Entwicklung; optionaler Adspend-Import via
   Meta-Ads-API für CPL/CAC/LTV (Key → `WARTELISTE.md`).

**Gesamt-DoD des Umbaus:** Alle Phasen-DoDs grün, `PROGRESS.md` vollständig, `WARTELISTE.md`
listet exakt, was der Mensch noch liefern muss (Keys, AGB vom Anwalt, DNS, Golden-Set-Firmen,
Stripe-Live-Produkte, Registrar-/GBP-/Ads-Zugänge). Die Landingpage läuft aus dem Monorepo
und schreibt Leads direkt in die DB, jeder Upsell der Leiter ist im Testmode kauf- und
auslieferbar, und ein kompletter Testmode-Durchlauf von Landingpage-Lead bis
veröffentlichter, fertiggestellter Website läuft ohne einen einzigen manuellen Eingriff
zwischen Zahlung und Fertigstellung.

## 13. Problem-Katalog (einplanen, nicht hoffen – jede Zeile hat oben eine Gegenmaßnahme)

| Problem | Antwort im System |
|---|---|
| 30–50 % der Prospect-Websites nicht scrapebar | Fallback-Kette Places → Manuell; Bibliothek macht Demo unabhängig vom Scrape |
| KI-Output generisch/„Slop" | Vorlagen befüllen statt erfinden, Slot-Limits, Floskel-Blacklist, Golden-Set-Regression |
| Langsame Seiten trotz schöner Optik | Lighthouse-CI als harter Build-Gate, JS-Budget, Bild-Pipeline |
| Urheberrecht (Fotos/Texte von alter Website oder „Vorbild-Seiten") | Fakten frei; Alt-Fotos nur über Quarantäne-Bucket + Rechte-Bestätigung des Kunden im Wizard (Freistellung in AGB); in Demos nur per bewusstem Schalter am Lead; Texte immer neu formuliert |
| DSGVO-Abmahnungen (Google Fonts CDN, Maps) | Self-hosted Fonts, Zwei-Klick-Karte, cookielos – als Gate erzwungen |
| SEPA platzt nach Freischaltung | `payment_settled`-Flag, Dunning, Auto-Suspend |
| Magic-Link im Spam | Mail-Subdomain + SPF/DKIM/DMARC, „Link erneut senden" + Passwort-Fallback |
| Webhook-Doppel/Reihenfolge | Idempotenz-Tabelle, Upsert-Handler |
| Kunde zerschießt Seite im Editor | Nur Schema-Patches, gesperrte Kern-Sektionen, Versionierung/Rollback |
| Laufzeit 24/24/3 rechtlich gekippt | Alle drei Werte Config; Checkout zeigt Bedingungen transparent; AGB-Erstellung = Anwalt (WARTELISTE) |
| Kunde kündigt Lastschrift statt Vertrag | Dunning + Suspend + Vertragsstatus getrennt von Zahlstatus; Forderung bleibt dokumentiert |
| Kosten laufen weg | Kosten-Log je Demo, Rate-Limits, Kill-Switch |
| Aufräumen zerstört Funktionierendes | Branch, `_legacy` statt löschen, additive Migrationen, Build-Gate nach jedem Schritt |
| Demo 5 Min vor Call kaputt | Prozessregel Vorabend + Pflicht-Checkbox „Demo geprüft" |
| Kunden-Cloudflare-Tokens = Sicherheits-/Support-Risiko | Nur scoped Custom-Token (nie Global API Key), Scope-Verifizierung bei Annahme, Verschlüsselung at rest, nie loggen, Revoke-Handling mit Auto-Fallback auf `multi_tenant` |
| Cloudflare-Setup killt den Abschluss im Call | Reihenfolge fix: **erst Zahlung, dann Connect** (im selben Call oder später im Wizard); Demo & Fallback laufen immer auf unserer Infra |
| Deploy-Latenz/Fehler bei Kunden-Cloudflare | Asynchrone Deploys mit Status, Retry, Auto-Fallback; Previews bleiben intern |
| Kunde löscht CF-Account/Token oder Konto wird gesperrt | Site fällt automatisch auf `multi_tenant` zurück (Ausfallzeit ≈ 0), Reconnect-Mail, Task nach 2 Fehlversuchen |
| Google Ads als „Zero Fulfillment" verkauft | Budget direkt Kunde↔Google, templated Setup, regelbasierte Checks, ehrliche Leistungsbeschreibung; Konto-Sperr-Risiko der Plattform einkalkulieren |
| GBP-API ohne verifiziertes Profil/Owner-Rechte nutzlos | Geführter Verifizierungs- & Zugriffs-Flow als Gate vor Aktivierung des Upsells |
| Tracking-Pixel/CAPI vs. DSGVO | Consent-Banner nur auf der Marketing-Domain; Kundenseiten bleiben strikt cookielos |
| Landingpage driftet als Zweitprojekt weg | Monorepo-Einzug in Phase B, Altprojekt stillgelegt + Redirect |
| Upsell-Verträge werden unübersichtlich | Ein `contracts`-Eintrag je Produkt mit eigener Laufzeit; MRR-Report = Summe aktiver Positionen |
| Upsell-Spam treibt Kunden in den Churn | Abgelehnte Angebote 60 Tage Pause; jedes Angebot mit Preis + Laufzeit im Klartext |
| KI-Bilder wirken uncanny oder inkonsistent | Nur kuratierte `asset_bank` mit Mensch-Freigabe; Vorher/Nachher per Degradations-Edit derselben Szene; Prompt + Seed gespeichert |
| Video-Generierung teuer/langsam/variabel | Demos bedienen sich nur aus der abgenommenen Loop-Bank; individuelles Video erst nach Kauf, über Nacht |
| Template-Reste ruinieren die Demo (falsche Stadt, leere Slots, Fake-Reviews, tote Links) | Konsistenz-Validator als hartes Gate (Phase D, Schritt 6) – Fail = kein `demo_bereit` |

## 14. Nicht bauen (V2)
Freiform-Pagebuilder, DocuSign/Angebots-PDF, eigener SEPA-Einzug, Blog-CMS, Mehrsprachigkeit,
White-Label, native App, mehr als 4 Seed-Branchen vor dem ersten zahlenden Kunden je Branche,
kein manuelles Ads-Optimierungs-Versprechen, kein eigenes Ads-Reporting-Dashboard
(Monatsreport per Mail reicht in V2).

---

**Start jetzt mit Abschnitt 0, Punkt 1 (Git-Sicherheitsnetz), dann Phase A.**
