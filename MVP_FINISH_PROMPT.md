# MVP-FINISH-PROMPT — Webseitenverlag Deutschland

> **An Claude Code:** Dieses Dokument ist der verbindliche Arbeitsauftrag, um das Repo
> `webseitenverlag-deutschland` bis zum **verkaufsfähigen MVP** fertigzustellen.
> Es ergänzt `CLAUDE_CODE_MASTERPROMPT.md`: dessen Arbeitsregeln, Qualitäts-Standards
> (Abschnitt 2 „Kein Slop") und Datenmodell gelten weiter — **bei Widerspruch gewinnt
> DIESES Dokument.** Arbeite die Phasen in Reihenfolge ab, selbstständig, über mehrere
> Sessions. Session-Start immer: „Lies MVP_FINISH_PROMPT.md und PROGRESS.md und führe
> die nächste offene Phase aus."

---

## 0. Arbeitsregeln (unverändert streng)

1. **Git:** Nie auf `main`. Branch `feat/mvp-finish`. Atomare Commits, Conventional Messages.
   Vor Phasenstart: `git status` prüfen, WIP committen.
2. **PROGRESS.md** nach jedem Arbeitsblock fortschreiben. **WARTELISTE.md** für alles,
   was der Mensch liefern muss (API-Keys, DNS, Freigaben).
3. **Selbsttest nach jeder Phase:** Build + Typecheck + Lint + Tests grün, sonst nicht weiter.
4. **Stop nur bei:** destruktiven Migrationen auf Produktivdaten, Live-Zahlungsdaten,
   oder wenn ein Ordner wie ein zweites Produktivsystem aussieht. Fehlende Keys = Stub +
   WARTELISTE, weiterarbeiten.
5. **Löschen = verschieben nach `/_legacy/`.** Nur additive DB-Migrationen.
6. **Config statt Hardcode:** Branding, Preise, Laufzeiten, Feature-Gates, API-Keys —
   alles in Config/DB/ENV. (Vorleistung für spätere Mandanten-Fähigkeit.)

---

## 1. Missions-Delta: Was sich gegenüber dem großen Masterprompt ändert

### 1.1 Hosting: NUR noch Multi-Tenant auf Vercel — Cloudflare-Architektur entfällt

**Entscheidung:** Für das MVP gibt es genau EIN Deployment und EIN Hosting-Ziel.
Alle Websites (Demos UND Live-Kundenseiten) werden multi-tenant aus der DB gerendert.

- `deploy_target='customer_cloudflare'`, Kunden-Token-Handling, Pages-Direct-Upload,
  Token-Verschlüsselung, Reconnect-Flows: **komplett nach `/_legacy/` verschieben.**
  In `LEGACY_NOTIZEN.md` festhalten: „Cloudflare-Kundendeployment bewusst aus MVP
  entfernt, Wiedereinführung nur bei konkretem Bedarf."
- `sites.deploy_target` bleibt als Spalte bestehen (additiv!), Default `multi_tenant`,
  wird aber nirgends mehr verzweigt.
- **Host-Routing (Middleware), Ziel-Zustand:**

  | Host | Inhalt |
  |---|---|
  | `PRODUKTDOMAIN.de` (+www) | Marketing-Landingpage |
  | `app.PRODUKTDOMAIN.de` | Kundenportal (Login, Editor) |
  | `admin.PRODUKTDOMAIN.de` oder `/admin` | Ops-Dashboard |
  | `{slug}.PRODUKTDOMAIN.de` | Demo- & Kundenseiten aus DB |
  | Kundendomain (später) | via Vercel Domains API auf dieselbe Site |

- **Rendering:** Host-Header → `sites`-Lookup (slug bzw. custom_domain) →
  Template-Renderer → HTML. Caching: Next.js Route-Cache/ISR mit Revalidate-Tag pro
  Site; „Veröffentlichen" invalidiert den Tag. Ziel-TTFB gecacht < 200 ms.
- **Custom Domains (MVP-light):** Funktion `attachCustomDomain(siteId, domain)` über
  Vercel Domains API + Anleitung-Mail an Kunden (A/CNAME). Kein Registrar-Kauf im MVP —
  Wunschdomain-Registrierung kommt nach dem MVP (WARTELISTE).
- Lokal testbar machen: `?__host=slug.PRODUKTDOMAIN.de`-Override in der Middleware
  (nur in dev), damit E2E-Tests ohne DNS laufen.

### 1.2 Scope-Schnitt fürs MVP (bewusst NICHT bauen)

Verschoben auf nach-MVP (nicht anfangen, nicht vorbereiten außer via Config):
Domain-Registrar-API, GBP/Ads-Upsell-Fulfillment, Konkurrenz-Radar, Saison-Automat,
Meta-CAPI/Google-Tracking, Scraping-Pipeline (Firecrawl/Places — Demos entstehen im MVP
aus dem **manuellen 2-Minuten-Formular**, das reicht zum Verkaufen), Kick-off-Mail-Sequenzen.

**Im MVP-Scope bleibt:** Generierung, Asset-System, Validator, Multi-Tenant-Hosting,
Kundenportal mit Chat-Editor, Stripe-Testmode-Checkout + Magic-Link, Impressum/Datenschutz-
Generator, SEO-Unterseiten-Upsell als einziger Upsell (nutzt dieselbe Pipeline).

---

## 2. PHASE 1 — Hosting-Fundament (Multi-Tenant auf Vercel)

1. Middleware-Host-Routing gemäß Tabelle 1.1 implementieren. Auth-Cookies je Bereich
   scopen (Team vs. Kunde vs. öffentlich).
2. Site-Renderer als Server Component Route (`app/(sites)/[[...path]]`): lädt
   `sites.config` per Host, rendert Sections, setzt Meta/JSON-LD/OG aus Config.
   `status='demo'` ⇒ `noindex` + dezentes Demo-Badge. `status='suspended'` ⇒ Wartungsseite.
3. Cache + Invalidierung: `revalidateTag(site:{id})` beim Publish.
4. Bestehenden Cloudflare-Publish-Flow auf den neuen Weg umstellen: „Veröffentlichen" =
   `draft_config → config` kopieren + Version anlegen + Tag invalidieren. Kein Upload mehr.
5. Vercel-Setup dokumentieren (README-Abschnitt): Wildcard-Domain `*.PRODUKTDOMAIN.de`
   im Vercel-Projekt, ENV-Liste. Domain-Eintrag selbst = Mensch (WARTELISTE).

**DoD:** Zwei Test-Sites mit unterschiedlichen Slugs rendern lokal über den Host-Override
unterschiedlich; Publish invalidiert den Cache nachweislich (Test); `/_legacy/` enthält
den Cloudflare-Code, Build grün ohne ihn.

---

## 3. PHASE 2 — Asset-System & Higgsfield-Pipeline (das Herzstück: keine falschen Bilder mehr)

**Grundprinzip: Die KI wählt NIEMALS Bilder aus. Bilder werden von deterministischem
Code zugewiesen.** Claude füllt ausschließlich Text-Slots. Jeder Bild-Bug der
Vergangenheit (falsches Motiv, falsche Sortierung, falsches Format) wird hier durch
Schema + Code + Gates unmöglich gemacht.

### 3.1 Slot-Schema (Template-Seite)

Jede Section-Vorlage deklariert ihre Bild-Slots typisiert:

```ts
// Beispiel in der Section-Definition
asset_slots: {
  hero_img:    { scene_typ: 'hero',    aspect: '16:9', min_width: 1600, tags: ['branche'] },
  galerie_1:   { scene_typ: 'galerie', aspect: '4:3',  min_width: 1000 },
  galerie_2:   { scene_typ: 'galerie', aspect: '4:3',  min_width: 1000 },
  galerie_3:   { scene_typ: 'galerie', aspect: '4:3',  min_width: 1000 },
  vorher_1:    { scene_typ: 'vorher',  aspect: '4:3',  pair_with: 'nachher_1' },
  nachher_1:   { scene_typ: 'nachher', aspect: '4:3' },
  team_img:    { scene_typ: 'team',    aspect: '3:4',  min_width: 800 },
}
```

Zod-Schema für Slot-Definitionen anlegen; Renderer weigert sich, eine Section ohne
vollständige, valide Slot-Deklaration zu registrieren.

### 3.2 asset_bank (DB, additiv migrieren falls abweichend vorhanden)

Spalten mindestens: `storage_path, medium(image|video), branchen[], style_tags[],
szene_typ, aspect_ratio, breite, hoehe, pair_id, quelle, gen_prompt, gen_seed,
alt_text_de, quality_status(draft|approved), created_at`.
**Nur `approved` wird jemals ausgespielt** — überall als WHERE-Klausel erzwungen,
nicht dem Aufrufer überlassen (View oder Repository-Funktion `getApprovedAssets()`).

### 3.3 Deterministische Zuweisung (der Sortier-Bug stirbt hier)

`assignAssets(siteId, branche, style, slots[]) → Record<slotKey, assetId>`:

1. Kandidaten je Slot: `approved` ∧ Branche passt ∧ `szene_typ` exakt ∧ Aspect-Ratio
   innerhalb ±5 % ∧ `breite ≥ min_width`.
2. Ranking: Style-Tag-Übereinstimmung, dann Zufall — aber mit **seeded RNG
   (`seed = siteId`)**: dieselbe Site bekommt bei jedem Re-Render dieselben Bilder
   (reproduzierbar, debugbar), verschiedene Sites bekommen verschiedene.
3. **Keine Doppelverwendung** desselben Assets auf einer Seite (Set-Tracking über alle Slots).
4. **Vorher/Nachher:** Slots mit `pair_with` werden IMMER als Paar über `pair_id`
   aufgelöst — nie zwei unabhängige Bilder. Kein approved-Paar vorhanden ⇒ Sektion wird
   automatisch ausgeblendet (nie ein halbes Paar rendern).
5. Kein Kandidat für einen Pflicht-Slot ⇒ Job-Fail mit klarer Meldung
   („asset_bank: kein approved hero/16:9 für branche=maler") — niemals Platzhalter,
   niemals stilles Fallback-Bild.

### 3.4 Higgsfield-Seeding-Script (`scripts/seed-assets.ts`)

- CLI: `npx tsx scripts/seed-assets.ts --branche maler --count 40`
- Fester **Style-Prompt-Baukasten** pro Branche in `config/asset-styles.ts`
  (Licht, Farbwelt, Kamera, Negativ-Prompts: keine Gesichter nah, keine Logos/Marken,
  kein Text im Bild). Prompt + Seed werden am Asset gespeichert.
- Generiert je Branche einen definierten Mix: 6× hero (16:9), 12× galerie (4:3),
  4× team/detail (3:4), 4× vorher/nachher-PAARE (sauber generieren → per Bild-Editing
  kontrolliert „degradieren", `pair_id` verknüpft; nie umgekehrt).
- Nach Generierung: **Sharp-Pipeline** (AVIF/WebP + Größenvarianten, width/height in DB),
  dann `quality_status='draft'`.
- Kein Higgsfield-Key vorhanden ⇒ Script läuft im Stub-Modus mit lokalen
  Platzhalter-Assets (deutlich als STUB markiert, nie approvebar), WARTELISTE-Eintrag.

### 3.5 Freigabe-UI (`/admin/assets`)

Grid aller Assets, Filter Branche/Szene/Status, Großansicht, Buttons
Approve/Reject/Regenerate (Regenerate = neuer Higgsfield-Call mit gespeichertem Prompt,
neuem Seed). Vorher/Nachher-Paare werden IMMER gemeinsam angezeigt und gemeinsam
approved/rejected. Alt-Text-Feld (vorbefüllt per Claude, Mensch kann korrigieren).

**DoD Phase 2:** Für Branche `maler` (oder deine erste Zielbranche) liegen ≥ 30 approved
Assets inkl. 3 Paaren in der Bank; `assignAssets` hat Unit-Tests für: Determinismus
(gleicher Seed ⇒ gleiches Ergebnis), keine Duplikate, Paar-Kopplung, Fail bei leerer Bank,
Aspect-Filter. Freigabe-UI funktioniert.

---

## 4. PHASE 3 — Generierung + Konsistenz-Validator (Bug-frei per Gate, nicht per Hoffnung)

1. **Eingang (MVP):** 2-Minuten-Formular im Admin (`/admin/leads/neu`): Firmenname,
   Branche, Stadt, 3–8 Leistungen, Telefon, optional USPs/Öffnungszeiten →
   `business_profiles.data`.
2. **Ein-Klick-Generierung** am Lead: Komposition per Branche wählen → Claude
   (claude-sonnet-4-6) füllt NUR `copy_slots` als JSON → Zod-Validierung
   (Pflichtslots, Zeichenlimits, Floskel-Blacklist aus dem Masterprompt, Stadt muss in
   H1 + Title vorkommen) → `assignAssets` → Site anlegen (`status='demo'`, Slug
   generieren, Kollisionscheck) → rendern.
   Max. 2 Copy-Retries mit Fehlerfeedback, dann Job `failed` mit lesbarem Grund.
3. **Konsistenz-Validator als hartes Gate nach dem Rendern** (Fail ⇒ Retry ⇒ failed,
   NIE `demo_bereit`):
   - Orts-Konsistenz: Städte-Blockliste (Top-200 DE minus Kundenstadt) gegen den
     gerenderten Output.
   - Alle Pflicht-Slots gefüllt, keine leeren `src`, keine toten `#`-Links, keine rohen
     HTML-Entities, kein „Lorem", kein Slot-Platzhalter-Text (`{{`-Scan).
   - **Bild-Checks:** jedes `<img>` hat width/height + nicht-leeres deutsches alt;
     gerendertes Seitenverhältnis vs. Slot-Deklaration ±5 %; keine Bild-URL doppelt;
     Vorher/Nachher-Slider zeigt ein echtes Paar (gleiche `pair_id`).
   - Bewertungen: nur wenn echte Daten im Profil, sonst Sektion ausgeblendet — niemals
     erfinden.
4. **Mensch-Gate:** Checkbox „Demo geprüft" im Admin schaltet auf `demo_bereit`.
5. Kosten je Generierung loggen (Tokens in Cent).

**DoD:** 5 Testfirmen (verschiedene Städte, 3 vs. 8 Leistungen, mit/ohne Bewertungen,
sehr langer Firmenname) → 5/5 Demos ohne manuellen Eingriff, Validator grün,
Lighthouse Mobile ≥ 90/95/90 auf allen fünf.

---

## 5. PHASE 4 — Kundenportal & Chat-Editor härten

1. Chat-Editor auf strukturierte Ops festnageln (falls noch nicht vollständig):
   `update_text`, `swap_image_from_bank`, `set_theme_preset`,
   `add_section_from_library`, `reorder`, `toggle_section`. Kein Roh-HTML, Zod auf
   jeden Patch. `swap_image_from_bank` zeigt nur approved Assets passend zu Slot-Typ
   und Branche (Kunde kann also gar kein „falsches" Bild wählen).
2. Bild-Upload des Kunden: Sharp-Pipeline, Zuordnung nur auf kompatible Slots
   (Aspect-Check mit Auto-Crop-Vorschlag), landet als `quelle='kunde'` in der Bank
   (nur für diese Site sichtbar).
3. Gesperrte Kern-Sektionen (Hero-Struktur, primärer CTA, Kontakt) — Bot begründet kurz
   und bietet Alternative. Draft → Preview → Publish → `site_versions` mit
   1-Klick-Rollback. Rate-Limit 50 Nachrichten/Tag.
4. Impressum/Datenschutz-Generator: Pflichtangaben-Formular ⇒ generierte Rechtsseiten
   als feste, nicht löschbare Sections. Texte als Vorlage in Config (Anwalts-Review =
   WARTELISTE).

**DoD:** E2E: Kunde loggt ein, ändert Headline per Chat, tauscht ein Galeriebild
(nur passende werden angeboten), veröffentlicht, macht Rollback. Invalider Patch wird
abgewiesen und verständlich beantwortet.

---

## 6. PHASE 5 — Stripe (Testmode) + Zugang

1. Zahlungslink-Button am Lead: Stripe Checkout (`mode=subscription`, Setup-Fee als
   One-time, card+sepa_debit, locale=de, metadata `{lead_id, site_id, plan}`), Laufzeit-
   Transparenz-Text aus Config (24/12/3 — Werte NUR in Config).
2. Webhooks idempotent (`processed_webhook_events`): `checkout.session.completed` ⇒
   Customer + Auth-User (Magic Link), Site `demo→live`, `contracts`-Zeile aus Config,
   Slack/Log-Event. `invoice.payment_failed` ⇒ Dunning-Mails Tag 0/3/7 ⇒ nach 14 Tagen
   `suspended`.
3. Ein Upsell, um die Mechanik zu beweisen: **SEO-Unterseiten-Abo** — Kauf im Portal per
   Klick ⇒ eigener `contracts`-Eintrag ⇒ monatlicher Cron generiert 1 lokale
   Keyword-Unterseite über die Phase-3-Pipeline, Kunde gibt per Klick frei.

**DoD:** Kompletter Testmode-Durchlauf: Checkout ⇒ Webhook ⇒ Magic-Link-Mail (Resend
oder Log-Stub) ⇒ Login ⇒ Site live. Fehlgeschlagene Zahlung führt automatisch zu
Mahnung + Suspend. Upsell-Kauf schaltet den Cron-Job frei.

---

## 7. PHASE 6 — Qualitäts-CI (Gates scharf schalten)

1. **Golden-Set** `test/golden_set.json`: 8 Firmen-Profile (Edge-Cases: langer Name,
   3 Leistungen, 10 Leistungen, Umlaute/ß im Namen, Stadt mit Bindestrich, keine
   Bewertungen, zwei Branchen). CI generiert alle, Validator + Blacklist + Stadt-Check.
2. **Lighthouse-CI** gegen 3 Golden-Demos: Budgets aus Masterprompt 2.1, rot = Build rot.
3. **Playwright-E2E:** Formular → Generierung → Publish → Subdomain rendert →
   Checkout (Testmode) → Login → Chat-Edit → Publish → Rollback.
4. Fehler-Handling: Job-Fails mit lesbarem Grund im Admin sichtbar; `GENERATION_KILL_SWITCH`-ENV.

---

## 8. MVP-Gesamtabnahme (Definition of Done)

Der MVP ist fertig, wenn dieser Durchlauf OHNE manuellen Eingriff zwischen den Klicks
funktioniert und alle CI-Gates grün sind:

1. Admin füllt 2-Minuten-Formular für „Malermeister Beispiel, Frankfurt" aus.
2. Klick „Demo generieren" ⇒ < 3 Min. später steht eine fehlerfreie Demo auf
   `malermeister-beispiel.PRODUKTDOMAIN.de`: richtige Stadt überall, alle Bilder korrekt
   (Motiv, Format, Sortierung, Paare), Lighthouse ≥ 90/95/90.
3. Admin prüft (Checkbox), sendet Stripe-Testlink, „zahlt".
4. Kunde bekommt Magic-Link, loggt ein, ändert per Chat einen Text und ein Bild,
   veröffentlicht.
5. Rollback funktioniert. Dunning/Suspend nachweisbar im Testmode.
6. `WARTELISTE.md` listet exakt die menschlichen Rest-Aufgaben (Vercel-Wildcard-DNS,
   Higgsfield-Key, Stripe-Live, Resend-Domain, Anwalt für AGB/Rechtstexte,
   Asset-Freigaben).

---

## 9. Bild-Fehler-Katalog (jede Zeile MUSS durch einen Test abgedeckt sein)

| Bekannter Bug | Verhindert durch |
|---|---|
| Falsches Motiv im Slot (z. B. Küche im Maler-Hero) | `szene_typ`-Pflichtmatch + Branche-Filter, KI wählt nie |
| Bilder falsch sortiert / vertauscht | Slot-Keys statt Arrays; Zuweisung per Key, nie per Index |
| Gleiches Bild mehrfach auf der Seite | Duplikat-Set in `assignAssets` + Validator-Check |
| Vorher/Nachher zeigt zwei fremde Szenen | `pair_id`-Zwang, halbe Paare ⇒ Sektion aus |
| Verzerrte/abgeschnittene Bilder | Aspect-Deklaration ±5 % + width/height-Pflicht + CLS-Gate |
| Kaputte/leere Bild-URLs | Pflicht-Slot-Fail statt Platzhalter + Validator-`src`-Check |
| Unfreigegebene/AI-Ausschuss-Bilder live | `quality_status='approved'`-Zwang in der Datenzugriffsschicht |
| Nicht reproduzierbare Ergebnisse beim Re-Render | Seeded RNG mit `siteId` |
| Fehlende Alt-Texte (SEO/A11y) | alt_text_de Pflichtfeld + Validator |
| Riesige Originale ausgeliefert | Sharp-Pipeline, Originale nie public |

---

**Start jetzt: Abschnitt 0 (Git-Sicherheitsnetz), dann Phase 1. Nach jeder Phase:
PROGRESS.md, Commit, sauber stoppen.**
