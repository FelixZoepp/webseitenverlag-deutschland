# LEGACY_NOTIZEN — Ideensicherung aus den 39 Alt-Templates

> Erstellt 2026-07-15, VOR K1 (Verschieben der Alt-Templates nach `/_legacy/`).
> Quelle: `lib/templates/*` (39 Dateien), `lib/template-catalog.ts`, `lib/template-configs.ts`,
> `lib/template-schemas.ts`, `lib/template-renderer.ts`, `lib/multipage-renderer.ts`,
> `templates/business-multipage/`.
> Zweck: Alles Gute aus dem Alt-System festhalten, damit es in der Branchen-Fabrik
> (BRANCHEN_FABRIK_PROMPT.md, F2–F5) weiterlebt. Die Alt-Dateien selbst werden NICHT gelöscht,
> sondern nach `/_legacy/` archiviert (Rollback-Referenz für Bestands-Configs).

---

## 1. Branchen-Abdeckung (39 Templates, 13 Branchen)

| Branche | Templates (Datei → Stil) |
|---|---|
| Fitness (3) | `eisenwerk` (Performance-Gym, dark-athletic) · `fitness-boutique` (Off-White+Korall) · `fitness-frauen` (Cream+Plum) |
| Gastronomie (3) | `trattoria` (Terracotta+Olive) · `cafe` (Beige+Espresso) · `sushi` (Schwarz+Wasabi) |
| Floristik (3) | `wildblatt` (Salbei+Antikrosa, Slow Flower) · `floristik-edel` (Aubergine+Gold) · `floristik-bio` (Erdbraun+Gelb) |
| Reinigung (3) | `reinigung-b2b` (Tiefblau+Mint) · `reinigung-privat` (Hellgrau+Sky) · `reinigung-industrie` (Schwarz+Orange) |
| Friseur (3) | `friseur-damen` (Aubergine+Champagner) · `friseur-unisex` (Anthrazit+Roségold) · `friseur-barbershop` (Schwarz+Whisky) |
| Gesundheit (3) | `arzt-hausarzt` (Salbeigrün) · `arzt-zahnarzt` (Blau+Mint) · `arzt-hautarzt` (Rosé+Sand) |
| Handwerk (4) | `gruenwerk` (Forest+Wood) · `handwerk-sanitaer` (Tiefblau+Kupfer) · `handwerk-maler` (Petrol+Terracotta) · `handwerk-elektriker` (Schwarz+Volt-Gelb) |
| Recht/Steuer (3) | `anwalt-wirtschaft` (Marine+Bordeaux) · `anwalt-steuerberater` (Anthrazit+Senf) · `anwalt-familie` (Bordeaux+Sand) |
| Hotel (3) | `hotel-stadt` (Anthrazit+Champagner) · `hotel-land` (Tannengrün+Holz) · `hotel-nordsee` (Tiefblau+Sand) |
| KFZ (3) | `werkstatt-klassisch` (Anthrazit+Orange) · `werkstatt-bmw` (Schwarz+Tiefblau) · `werkstatt-eauto` (Off-White+Mint) |
| Immobilien (3) | `immobilien-premium` (Bordeaux+Gold) · `immobilien-tech` (Off-White+Lime) · `immobilien-regional` (Tannengrün+Sand) |
| Yoga (3) | `yoga-premium` (Antikrosa+Salbei) · `yoga-pilates` (Anthrazit+Korall) · `yoga-hot` (Burgund+Cream) |
| Tattoo (1) | `tattoo-studio` (Schwarz+Rot, **Dark-by-design**) |

→ Für F3 (16 Start-Branchen): Diese 13 Branchen sind vorvalidiert; die Farbwelten oben sind
gute Startpunkte für `branchen_profile.profil.design` — aber IMMER mit `akzent_begruendung`
(BF §1.3) und ohne die verbotenen Defaults.

## 2. Sektions-Patterns, die weiterleben sollen

**Universell (deckt sich mit BF §1.1 — bestätigt das Skelett):**
Hero mit Accent-Wort · Sticky-Nav mit Glas + CTA · Trust-Leiste · Testimonials (Sterne + Zitat + Kontext) · FAQ · Conversion-Sektion · Multi-Column-Footer.

**Besonders gut gelöst (in die Section-Library als parametrisierte Varianten übernehmen):**

1. **Live-Kursplan mit Tages-Tabs** (`eisenwerk.ts:118-144`): Tab-Switch per `data-day`, Kurs-Zeilen mit Zeit/Level/Trainer/Plätze. → Variante für zeitgebundene Services (Fitness, Yoga, Kurse).
2. **Before/After-Slider** (Reinigung, Friseur, Zahnarzt): visuell stärkstes Vertrauens-Element — im Flagship bereits als BA-Drag-Slider umgesetzt, Alt-Templates bestätigen die Branchen-Passung.
3. **Service-Category-Tabs** (`friseur-damen`): Damen/Herren bzw. Kategorien-Tabs statt einer langen Liste.
4. **Team-Cards mit Initialen-Avatar-Fallback** (`friseur-damen.ts:140-147`): kein Foto → `getInitials(name)` + Gradient-Zyklus. Übernehmen — löst das „Kunde hat keine Teamfotos"-Problem.
5. **Trust-Badge-Cluster**: Zertifikate + Kammer + Jahre + Bewertung in EINEM Container (statt verstreut).
6. **Dark-Design-Enforcement** (`template-schemas.ts:316-321`, Tattoo): explizite Regel „NIEMALS helle Hintergründe" pro Branche. → Als Constraint-Feld in `branchen_profile.profil.design` patternisieren.
7. **Zimmer-/Objekt-Cards mit strukturierten Daten** (Hotel: Typ/Preis/Amenities; Immobilien: Lage/Preis/m²/Zimmer): Muster für „Inventar-Branchen".
8. **Occasions/Anlässe-Grid + Liefergebiete mit Preis/Zeit** (`wildblatt`): lokales SEO-Gold für Floristik/Lieferdienste.
9. **Preis-Transparenz** (`reinigung-privat`): €/h offen + „Festpreise, keine Überraschungen" — Alleinstellung gegenüber typischen Handwerker-Sites.

**Sektion-Inventar gesamt** (für F2/F3-Zerlegung): Hero (Accent-Wort, Badge) · Schedule/Verfügbarkeit · Leistungen (Grid oder Tabs) · Pricing (Tiers/Tabelle) · Team (Initialen-Fallback) · Testimonials · Before/After · FAQ · Trust-Badges · CTA mit Feature-Liste · Standort/Kontakt (JSON-LD) · Footer.

## 3. Beste Copy-Muster (max. 3 je Branche, mit Quelle)

- **Reinigung** (`reinigung-privat.ts:135-138`): „So sieht [Raum] **wirklich** sauber aus" · Trust: „Festpreise, keine Überraschungen" / „24h Notdienst" · CTA: „Kostenloses Angebot" (nicht „Anfrage").
- **Fitness** (`eisenwerk.ts`): „Kraft trifft Leidenschaft" + Accent „Training" · Testimonial-Meta mit Kontext: „3x/Woche seit 2 Jahren".
- **Restaurant** (`trattoria.ts`): „Italienisch, wie es sein sollte" · Chef-Zitat original italienisch: „Ogni piatto è una storia" · Öffnungszeiten ehrlich: „Di–So 17:00–23:00" statt „täglich".
- **Friseur** (`friseur-damen.ts`): „Haare, die eine **Geschichte** erzählen" · Stylist-Bio mit Marken-Zertifikaten (Olaplex, K18, Kérastase) als Badges.
- **Zahnarzt** (`arzt-zahnarzt.ts`): „Zahnbehandlung **schmerzfrei**" (Accent = Benefit!) · CTA: „Termin vereinbaren" (nie generisch).
- **Yoga** (`yoga-premium.ts`): Klassen mit Sanskrit-Tiefe („Vinyasa Flow", Level + Dauer) · Teacher-Bio mit RYT-Zertifikat + Jahren.
- **Immobilien** (`immobilien-tech.ts`): „Immobilien-Suche, **neu erfunden**" · Zahlen-Trust: „avg. 5 Tage zur Vermittlung".
- **Anwalt** (`anwalt-wirtschaft.ts`): „Rechtssicherheit für **Unternehmen**" · Preis-Ehrlichkeit: „Erstberatung 250 € inkl. MwSt." · Titel-Trust: „Dr. jur., Fachanwalt für Arbeitsrecht".
- **Tattoo** (`tattoo-studio.ts`): „Kunst, die unter die **Haut** geht" · Hygiene-Trust: „Autoklave, Einzelnadeln" · Artists mit Instagram-Handle.

**Meta-Muster** (in Library-Textregeln übernehmen):
- Accent-Wort trägt den Benefit, nicht ein Fülladjektiv („schmerzfrei", „wirklich", „Geschichte").
- CTA immer branchenspezifisch: Termin vereinbaren / Tisch reservieren / Kostenloses Angebot / Probetraining.
- Testimonials mit Kontext-Meta (seit wann, wie oft, welcher Service) statt nackter Sterne.

## 4. Branchen-Wissen (Leistungen · FAQ · Trust-Signale)

→ Direktfutter für `branchen_profile.profil` (Leistungen, FAQ, quali_fragen-Anregungen):

| Branche | Leistungen | Typische FAQ | Trust-Signale |
|---|---|---|---|
| Fitness | Krafttraining, HIIT, Personal Training, EMS, Kurse | Anfänger ok? Kursplan online? Probetraining? | Trainer-Lizenzen, Geräte-Marken, Community |
| Restaurant | Antipasti/Primi/Secondi/Dolci, à la carte, Events | Vegetarisch/vegan? Reservierung nötig? Private Räume? | Chef-Bio, regionale Zutaten, Weinkarte |
| Friseur | Schnitt, Balayage, Bond-Treatment, Extensions | Haartyp-Beratung? Wie lange halten Extensions? | Marken-Partnerschaften, Stylist-Ausbildung |
| Reinigung | Fenster, Umzug, Polster, Unterhaltsreinigung, Treppenhaus | Festpreis? Versichert? Notdienst? | Versicherung, Termintreue-Quote, €/h offen |
| Zahnarzt | PZR, Bleaching, Veneers, Implantate, KFO | Schmerzfrei? Kasse? Ratenzahlung? | Gerätepark (Cerec/DVT), Implantologie-Zertifikat |
| Yoga | Vinyasa, Hatha, Yin, Ashtanga, Pilates | Anfängerklassen? Online? Gruppengröße? | RYT-200/500, max. Teilnehmerzahl |
| Hotel | Zimmerkategorien, Frühstück, Spa, Restaurant | Check-in? Haustiere? Parken? | Sterne, Google-Rating, Concierge |
| Handwerk | Renovierung, Reparatur, Wartung, Montage | Kostenlose Besichtigung? Garantie? Finanzierung? | **Meisterbetrieb**, Handwerkskammer, Jahre |
| Anwalt/Steuer | Beratung, Vertretung, Erstberatung | Erstberatung kostenlos? Honorar? | Fachanwalt-Titel, Kammer, Spezialisierung |
| Florist | Strauß, Braut, Trauer, Abo, Lieferung | Liefergebiet? Same-Day? Bio? | Slow-Flower, Direkthandel, Saisonalität |
| KFZ | HU/AU, Inspektion, Diagnose, Achsvermessung | TÜV? Originalteile? Garantie? | KFZ-Meisterbetrieb, Ersatzwagen |
| Immobilien | Verkauf, Vermietung, Bewertung, 3D-Tour | Provision? Verkaufsdauer? | IVD, Marktwertgutachten, Bewertungen |
| Tattoo | Realistic, Fine-Line, Blackwork, Cover-Up | Schmerz? Preis? Nachsorge? | Hygienestandard, Einzelnadeln, Artist-Portfolios |

⚠️ Gesundheit/Recht: Werberecht beachten (HWG, BORA) — keine Heilversprechen, keine Erfolgsgarantien (deckt sich mit BF §3.1 Meta-Kategorie „Gesundheit & Praxis").

## 5. Farbwelten & Fonts

- **28+ validierte Farbpaarungen** (siehe Tabelle §1) — als Inspirationsquelle für `branchen_profile.profil.design.tokens`, nie als Hardcode. Verbotene Defaults aus BF §1.3 gelten weiter.
- **Bewährte Font-Paarung über alle 39 Templates:** Fraunces (Display, variable 400–900 + SOFT-Achse) + Inter Tight (Body) + JetBrains Mono (Zahlen/Technik); Alternative Body: DM Sans.
- **ABER:** Alt-System lud alles via Google-Fonts-CDN → in der neuen Welt ausschließlich self-hosted `@font-face` (Flagship-Standard) oder System-Stacks.

## 6. Multipage-Struktur-Muster (aus `multipage-renderer.ts` + `templates/business-multipage/`)

Übernehmen für Paket-Seiten (Start 99 = 1 Seite, höhere Pakete = Unterseiten):
- **Pages-Array mit Slug-Routing**: home / ueber-uns / leistungen / kontakt / impressum / datenschutz — `meta.json` mit `requiredPages` (Impressum+Datenschutz immer Pflicht, zählen nie gegen Limit → deckt sich mit BF §1.2 System-Seiten).
- **Shared-Layer**: JSON-LD, Head-Meta, Nav, Footer einmal definiert, je Seite injiziert.
- **default-config.json-Pattern**: GlobalSiteConfig + Page-Einträge — gutes Muster für `library_pages.sections`-Kompositionen mit Seiten-Ebene.

## 7. Fallstricke (= K1-Beleg)

1. **Google-Fonts-CDN in 40 Dateien** (38 Templates + `template-renderer.ts` + `multipage-renderer.ts`, je preconnect + stylesheet-Link, ~80 Instanzen): DSGVO-Problem (IP an Google ohne Consent, LG München I 2022) + render-blocking. **Das ist der KILL-Grund K1.**
2. **Schema-Instabilität (R5-Beleg):** Generisches KI-Output-Schema ≠ Template-Schema. `reinigung-privat.ts:96-117` normalisiert händisch (`pricingTable`→`pricingPlans`, `stats`→`aboutStats`), andere Templates crashen stattdessen (Reinifix-Crash 2026-07-15, AUDIT.md). Lehre: **ein** kanonisches Content-Schema je Sektionstyp + Konsistenz-Validator VOR `demo_bereit` (BF §1.4).
3. **3 parallele Renderer** (template-renderer, multipage-renderer, library/render) → nach F2/K1 nur noch der Library-Renderer.
4. Unsplash-Platzhalter als Demo-Bilder: funktional ok, aber als Demo-Qualität deprecated → Asset-Bank/Higgsfield (F1).

## 8. Cloudflare-Kundendeployment (MVP-Finish §1, 2026-07-20)

Bewusst aus dem MVP entfernt (nach `/_legacy/` verschoben, nicht gelöscht):
- **Was es war:** Kunden hinterlegten eigene Cloudflare-Credentials (`cloudflare_account_id`,
  `cloudflare_api_token` an `customers`); Publish renderte HTML und lud es per Direct Upload
  in ein CF-Pages-Projekt im Kunden-Account (`cloudflare_project_name` an `sites`).
- **Warum raus:** Onboarding-Reibung (Kunde braucht CF-Account + API-Token), fremde
  Infrastruktur ohne Kontrolle (Token läuft ab → Site tot, Reconnect-Mail-Flow),
  kein zentrales Cache-/Sperr-/Noindex-Management. Widerspricht 0-Fulfillment-Vision.
- **Ersetzt durch:** Multi-Tenant-Auslieferung aus der DB über unsere Vercel-Infrastruktur
  (`middleware.ts` Host-Routing → `app/kundenseite/[host]/`, `lib/hosting/site-cache.ts`
  mit Tag-Invalidierung, `lib/hosting/vercel-domains.ts` für Custom Domains).
- **DB bleibt additiv:** Die drei CF-Spalten bleiben stehen (`@deprecated` in `types/index.ts`).
- **Reaktivierung:** `_legacy/lib/cloudflare.ts` + `_legacy/lib/cloudflare-email.ts` +
  `_legacy/app/api-sites/*-mit-cloudflare.route.ts` sind vollständig — als „Kunde will
  eigenes Hosting"-Premium-Option denkbar, aber nicht MVP.

## Konsequenz für K1

- **Sichern erledigt** (dieses Dokument): Farbwelten, Copy-Muster, Branchen-Wissen, Sektions-Patterns, Multipage-Struktur.
- **Nach `/_legacy/` verschieben (nicht löschen):** alle 39 `lib/templates/*.ts`, `template-renderer.ts`, `multipage-renderer.ts`, `template-catalog.ts`, `template-configs.ts`, `template-schemas.ts`, `templates/business-multipage/` — bleiben als Rollback-Referenz für Bestands-Configs.
- **Reihenfolge bleibt:** LEGACY_NOTIZEN (✓) → F2 (Flagship-Zerlegung) → Migration der Aufrufer (`app/demo/[token]`, preview/fertigstellen/rollback, `lib/auslieferung.ts`) → dann erst `/_legacy/`.
