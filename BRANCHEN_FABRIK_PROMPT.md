# BRANCHEN-FABRIK & DESIGN-SYSTEM – Ausführungs-Prompt

> **An Claude Code:** Dieses Dokument ist die verbindliche Detail-Ausführung für Vorlagen,
> Assets und Branchen (ersetzt/vertieft Phase C des `CLAUDE_CODE_MASTERPROMPT.md`; bei
> Widerspruch gilt dieses Dokument, alle Arbeitsregeln aus dessen Abschnitt 0 gelten weiter:
> Branch, atomare Commits, `PROGRESS.md`, `WARTELISTE.md`, Selbsttests, Stop-Bedingungen).
> Kanonische Qualitäts-Referenzen sind `flagship_reinigung.html` und
> `flagship_restaurant.html` im Repo – jede Vorlage, die dieses System erzeugt, muss deren
> Niveau halten.

---

## 1. Die Grundbasis: das destillierte Design-System

### 1.1 Seitenskelett (Pflicht-Reihenfolge jeder Vorlage)

1. **Nav** (sticky, Glas-Effekt beim Scrollen, 1 CTA-Button)
2. **Hero**: lokaler Hook im H1, EIN primärer CTA, Trust-Chips, Media-Frame mit
   schwebenden Stat-Cards, Typo-Signature auf Schlüsselwörtern
3. **Fakten-/Trust-Leiste** (4 Punkte, Zahlen aus dem Business-Profil, nie erfunden)
4. **Empathie/Willkommen** (Problem spiegeln bzw. „Benvenuti"-Moment)
5. **Signature-Scroll-Sektion**: die Branchen-Transformation, sticky an den
   Scroll-Fortschritt gekoppelt (Referenzen: Abzieher-Wisch, Tisch-deckt-sich)
6. **Leistungen/Angebot** (6 Karten, nutzenorientiert)
7. **Ablauf der Zusammenarbeit** – Pflicht bei Dienstleistung: interaktiver
   5-Schritte-Stepper (Referenz `#ablauf` in `flagship_reinigung.html`); bei
   Gastro/Einzelhandel stattdessen „Ihr Besuch"
8. **Ergebnisse**: Vorher/Nachher-Drag-Slider (Transformations-Branchen) oder
   Galerie (Genuss-/Ambiente-Branchen)
9. **Zahlen-Band** (animierte Counter, nur belegbare Werte)
10. **Stimmen** (ausschließlich echte Places-/Website-Bewertungen, sonst ausblenden)
11. **Lokal-Sektion** (Einsatzgebiet-Chips oder Adresse/Öffnungszeiten)
12. **FAQ** (4–6 echte Einwände der Branche)
13. **Conversion-Sektion** (siehe 1.2) → 14. Footer mit Impressum/Datenschutz +
    Demo-Ribbon

### 1.2 Kontakt-Architektur: Vorqualifizierung auf eigener Unterseite (Standard!)

- Die Inline-Kontakt-Sektion wird zur **Kurz-Conversion**: Telefon (Click-to-Call) +
  Button **„Anfrage starten"** + 3 Trust-Punkte. Kein langes Formular mehr auf der
  Startseite.
- Der eigentliche Lead-Fang ist die **Unterseite `/anfrage`**: ein mehrstufiger
  Vorqualifizierungs-Funnel (max. 5 Schritte, Fortschrittsbalken, Zurück-Navigation,
  mobile-first, eine Frage pro Screen):
  1. Leistung wählen (Icon-Karten aus dem Leistungs-Katalog der Branche)
  2. Branchenspezifische Detail-Fragen (aus `branchen_profile.quali_fragen`, z. B.
     Reinigung: Fläche in m², Verschmutzungsgrad, Wunschzeitraum; Dachdecker: Dachtyp,
     Baujahr, Anliegen; Kosmetik: Behandlung, Erst-/Stammkundin)
  3. Optional Foto-Upload (Sharp-Pipeline)
  4. Kontaktdaten (Name, Telefon, E-Mail) + Datenschutz-Checkbox
  5. Erfolg mit Erwartungssetzung („Ihr Festpreisangebot kommt innerhalb von 24 h")
- Antworten landen strukturiert in `form_submissions.qualifizierung` (jsonb); die
  Lead-Inbox im Portal und die Benachrichtigungs-Mail zeigen die Qualifizierung
  aufbereitet – der Betrieb ruft vorbereitet zurück. **Das ist ein Verkaufsargument:
  „Sie bekommen keine Namen, Sie bekommen vorqualifizierte Anfragen."**
- Gastro-Ausnahme: `/reservierung` (Datum, Uhrzeit, Personen, Anlass).
- `/anfrage`, `/impressum`, `/datenschutz` sind **System-Seiten** und zählen nie gegen
  das Unterseiten-Limit der Pakete.

### 1.3 Design-Tokens: jede Branchen-Vorlage definiert exakt

```ts
// Teil von branchen_profile.design
{ typo_modus: 'sans_bold_hell' | 'serif_warm_dunkel' | '<neu, begründet>',
  tokens: { basis, panel, text, akzent1, akzent2, line },   // 5-6 Hex-Werte
  akzent_begruendung: string,   // PFLICHT: warum diese Farbe aus der Branchenwelt?
                                // (Reinigung: Gummihandschuh-Gelb; Gastro: Kerzengold+Chianti)
  typo_signature: 'wisch_highlight' | 'gold_unterstrich' | '<neu>',
  radius: px, schatten: preset }
```

**Verbotene Defaults** (Slop-Erkennungsmerkmale, werden im Review abgelehnt):
Creme + Serifen + Terracotta-Einheitslook, Schwarz + Neongrün, generisches
Template-Teal, Standard-Bootstrap-Blau. Der Akzent muss aus der Branchenwelt kommen
und in `akzent_begruendung` dokumentiert sein.

### 1.4 Qualitäts-Gates (unverändert aus Masterprompt 2.1–2.4, hier nur scharf)
Lighthouse Mobile ≥ 90/95/90 · JS ≤ 30 KB (Basis) / ≤ 80 KB (Signature) · Bilder
WebP/AVIF mit srcset, self-hosted · Fonts self-hosted · `prefers-reduced-motion` ·
Konsistenz-Validator (Städte-Scan, Entities, leere Slots, tote Links, keine erfundenen
Reviews) · Floskel-Blacklist.

---

## 2. Higgsfield-API: der Asset-Motor

### 2.1 Service `lib/assets/higgsfield.ts` (Provider-Abstraktion!)

```ts
interface AssetProvider {
  generateImage(o: { prompt: string; aspect: '3:4'|'4:3'|'16:9'|'1:1';
                     referenceJobId?: string }): Promise<{jobId, url, costCents}>
}
// Implementierungen: HiggsfieldProvider (primär, Modell: bestes verfügbares
// Foto-/Edit-Modell, z. B. nano_banana-Klasse), FalProvider (Fallback, gleiche Schnittstelle).
```

- Ablauf je Call: Job anlegen → pollen bis `completed` (Timeout 120 s) → **Bild sofort
  in eigenes Storage laden** (WebP + AVIF konvertieren, srcset-Größen erzeugen) →
  `asset_bank`-Eintrag mit `gen_prompt`, `gen_seed`, `kosten_cent`, `quelle`.
  **Higgsfield-CDN-URLs erscheinen niemals im Kundenoutput** – nur zum Download.
- ENV: `HIGGSFIELD_API_KEY`, `FAL_API_KEY` (beide → `WARTELISTE.md`; bis dahin
  Mock-Provider, der Bank-Assets zurückgibt). Kosten-Log je Call, Tages-Limit,
  `GENERATION_KILL_SWITCH` respektieren.

### 2.2 Paar-Generator `makePair()`

Ziel-Szene generieren → per Edit (referenceJobId) die Gegen-Variante derselben Szene
erzeugen → beide mit gemeinsamer `pair_id` speichern. **Regel: immer Ziel zuerst, dann
Degradation/Addition** (verschmutzen, eindecken, verwildern lassen, Karosserie
matt machen) – die Gegenrichtung ist unzuverlässig. Automatischer Paar-Check: gleiche
Szene/Perspektive (Bild-Vergleichs-Heuristik + Mensch sieht es im Freigabe-Preview).

### 2.3 Demo-Asset-Regel (Standard: immer frisch fürs Unternehmen)

Für **jede Demo** werden die Schlüssel-Assets individuell generiert – aus dem
Style-Prompt-Baukasten der Branche plus Lokal-/Firmen-Kontext aus dem Business-Profil:

| Asset | Quelle |
|---|---|
| Hero | **frisch generiert** (Branchen-Style + Stadt-/Milieu-Bezug) |
| Signature-Paar (Vorher/Nachher bzw. Transformation) | **frisch generiert** via `makePair()` |
| 1 Detail-/Stimmungsbild | frisch generiert (optional, wenn Budget übrig) |
| Galerie-Filler, Icons, Hintergründe | approved `asset_bank` der Branche |
| Original-Fotos des Prospects | nur per bewusstem Schalter (Quarantäne-Regel aus dem Masterprompt) |

Leitplanken: Budget ≤ 1,50 €/Demo · Generierungen parallelisieren · schlägt ein Asset
fehl oder reißt das Timeout → **Fallback auf Bank-Assets, die Demo scheitert nie an
Bildern** · jedes Demo-Asset wandert automatisch in die Bank
(`quelle='demo_generiert'`, Branche getaggt) – **die Bibliothek wächst mit jedem Lead
von selbst**. Personen in KI-Bildern nur distanziert/seitlich/von hinten (kein
Uncanny-Risiko), keine erkennbaren Marken/Logos.

---

## 3. Branchen-Taxonomie & Startbestand

### 3.1 `config/branchen.ts`: 8 Meta-Kategorien

| Meta-Kategorie | Beispiel-Branchen | Signature-Transformation | Typo-Modus |
|---|---|---|---|
| Handwerk & Bau | Dachdecker, SHK, Elektro, Maler, GaLa, Bodenleger | Projekt-Reveal / Vorher-Nachher-Wisch (Baustelle→fertig, verwildert→gepflegt) | sans_bold_hell |
| Reinigung & Facility | Gebäude-, Glas-, Praxisreinigung | Scroll-Clean-Reveal (Referenz-Flagship) | sans_bold_hell |
| Gastro & Genuss | Restaurant, Café, Bäckerei, Catering | Tisch-deckt-sich / Ambiente-Erwachen (Referenz-Flagship) | serif_warm_dunkel |
| Beauty & Wellness | Kosmetik, Friseur, Nails, Massage | Ergebnis-Karussell, weiches Licht-Reveal | serif_warm_dunkel |
| Gesundheit & Praxis | Zahnarzt, Physio, Podologie | ruhiger Vertrauens-Reveal, Termin-Fokus (Werberecht beachten!) | sans_ruhig_hell |
| Auto & Mobilität | Werkstatt, Aufbereitung, Folierung | Aufbereitungs-Wisch (matt→glänzend) | sans_bold_dunkel |
| Dienstleistung & Beratung | Umzug, Hausverwaltung, Fotograf, Steuerbüro | Ablauf-Stepper prominent + Ergebnis-Galerie | je nach Positionierung |
| Fitness & Coaching | Studio, Personal Training, Tanzschule | Energie-/Transformations-Moment | sans_bold_dunkel |

### 3.2 Startbestand (Auftrag)

Je Meta-Kategorie **2 konkrete Branchen** voll ausbauen = **16 approved Vorlagen**.
Reinigung und Restaurant entstehen durch **Parametrisierung der beiden Flagships**
(1:1-Reproduktion aus der Library ist der Beweis, dass die Zerlegung stimmt). Jede der
16 durchläuft das Mensch-Freigabe-Gate. Tiefe schlägt Breite – alles darüber hinaus
erledigt das Auto-Seeding.

---

## 4. Auto-Seeding: neue Branchen bauen sich selbst (mit Freigabe-Klick)

**Trigger:** Lead/Demo-Anforderung mit Branche ohne approved Vorlage → Dashboard zeigt
„Branche wird gebaut (~15 Min)" + Button, Inngest-Job `branche_seeden` startet:

1. **Klassifizieren:** Claude mappt die Branche auf eine Meta-Kategorie (unsicher →
   Rückfrage-Karte im Dashboard statt Raten).
2. **Branchen-Profil generieren** (Claude, strikt gegen Zod-Schema):
   Leistungs-Katalog (8–12), Kunden-Schmerzpunkte, lokale Hooks, 6 FAQ-Rohlinge,
   5 Ablauf-Schritte, **Signature-Wahl inkl. Transformations-Szene** („Was ist das
   Vorher/Nachher dieser Branche?"), Design-Tokens + `akzent_begruendung`,
   **Style-Prompt-Baukasten** für Higgsfield (Szenen, Licht, Materialien, Personen
   ja/nein), **Vorqualifizierungs-Fragen** für `/anfrage` (4–6, branchenspezifisch).
3. **Vorlage komponieren:** Section-Varianten der Meta-Kategorie + Copy-Beispiele in
   Agentur-Qualität als Few-Shots.
4. **Asset-Grundset via Higgsfield:** 1 Hero, 1 Signature-Paar, 6 Detail-/Galerie-Bilder
   → Bank (`quality_status='draft'`).
5. **Preview rendern** unter `preview-<branche>.DOMAIN` + alle Gates (Lighthouse,
   Validator, Blacklist, verbotene Default-Looks).
6. **Mensch-Gate:** Slack `#library` + Dashboard-Karte „Neue Branche wartet auf
   Freigabe" mit Preview-Link → 1 Klick `approved`, oder Feedback-Text →
   Regenerier-Runde mit dem Feedback im Prompt. **Ohne Freigabe keine Demo in dieser
   Branche** – der Demo-Button bleibt gesperrt.
7. **Lern-Schleife:** Jedes Ablehnungs-Feedback wird als `guideline_notes` an der
   Meta-Kategorie gespeichert und in alle künftigen Seeding-Prompts injiziert – das
   System lernt deinen Geschmack und wird mit jeder Freigabe treffsicherer.

Ziel: ≤ 15 Minuten Maschine + 2 Minuten Mensch pro neuer Branche. Setter-Prozess:
Termin in unbekannter Branche gelegt → Seeding sofort antriggern, Freigabe vor dem
Termin.

---

## 5. Datenmodell-Ergänzungen (additiv migrieren)

```sql
create table branchen_profile (
  id uuid primary key default gen_random_uuid(),
  branche_key text unique not null,          -- 'dachdecker', 'hundesalon', ...
  meta_kategorie text not null,
  profil jsonb not null,        -- Leistungen, Hooks, FAQ, Ablauf, quali_fragen, design(1.3),
                                -- signature { typ, transformations_szene }, style_prompts{}
  guideline_notes text[],       -- Lern-Schleife aus Freigabe-Feedback (auf Meta-Ebene gespiegelt)
  quality_status text default 'draft',       -- draft|approved  (nur approved → Demos)
  created_at timestamptz default now(), approved_at timestamptz, approved_by text
);
-- asset_bank:        quelle um 'demo_generiert' erweitern; kosten_cent int
-- library_pages:     branchen_profil_id uuid
-- form_submissions:  qualifizierung jsonb    -- Antworten des /anfrage-Funnels
```

---

## 6. Ausführungsplan (in dieser Reihenfolge, je mit DoD)

**F1 – Higgsfield-Motor:** Provider-Abstraktion, Download-/Konvertier-Pipeline,
`makePair()`, Kosten-Log, Mock-Fallback.
✅ DoD: CLI-Befehl erzeugt ein Vorher/Nachher-Paar, beide Bilder liegen als
WebP/AVIF im eigenen Storage, Bank-Einträge mit Prompt/Seed/Kosten vorhanden.

**F2 – Design-System extrahieren:** Beide Flagships in Section-Templates + Token-System
zerlegen (inkl. Signature-Sektionen und Ablauf-Stepper als parametrisierte Varianten),
`/anfrage`-Funnel-Template bauen und in beide Flagship-Vorlagen einhängen.
✅ DoD: Beide Flagships sind 1:1 aus der Library reproduzierbar; Stresstest mit je 3
abweichenden Datensätzen besteht; `/anfrage` schreibt strukturierte Qualifizierung in
die DB und die Lead-Inbox zeigt sie an.

**F3 – Startbestand:** 16 Branchen (je 2 pro Meta-Kategorie) über die eigene
Seeding-Pipeline bauen (manuell angestoßen), Mensch gibt jede frei.
✅ DoD: 16 approved Previews online, alle Gates grün, jede mit eigenem Signature-Paar
und begründetem Akzent.

**F4 – Auto-Seeding scharf schalten:** Trigger am Lead, Dashboard-Freigabe-UI,
Slack-Ping, Regenerier-Runde mit Feedback, `guideline_notes`-Injection.
✅ DoD: Test mit 3 bewusst ungeseedeten Branchen (z. B. Schlüsseldienst, Hundesalon,
Fahrradwerkstatt) → 3 freigabefertige Vorlagen ohne eine Zeile Handarbeit.

**F5 – Demo-Pipeline umstellen:** Schlüssel-Assets jeder Demo frisch via Higgsfield
(2.3), Bank-Fallback, Kosten pro Demo im Dashboard.
✅ DoD: Golden-Set-Lauf – jede Demo hat individuell generierten Hero + Signature-Paar,
Kosten ≤ 1,50 €/Demo, kein Lauf scheitert an Bildern.

---

## 7. Zusätzliche Crash-Punkte (einplanen)

| Problem | Antwort |
|---|---|
| Higgsfield down / Rate-Limit / Kosten-Spike | Provider-Abstraktion mit fal.ai-Fallback, Bank-Fallback, Tages-Budget + Kill-Switch, Kosten-Alarm nach `#money` |
| Auto-Seeding produziert Mittelmaß | Mensch-Gate ist Pflicht; Feedback → Regenerier-Runde; `guideline_notes` machen jede Runde besser |
| Werberecht bei Heilberufen/Recht (HWG, Berufsordnungen) | Meta-Kategorie Gesundheit/Beratung bekommt eigene Claims-Blacklist (keine Heilversprechen, keine Superlative); Hinweis in `WARTELISTE.md` für anwaltlichen Kurz-Check der Standardtexte |
| Vorqualifizierungs-Funnel zu lang → Abbrüche | Max. 5 Schritte, eine Frage pro Screen, Abbruch-Tracking je Schritt, Telefon-Ausweg auf jedem Screen |
| Paar-Bilder driften (andere Szene) | Ziel-zuerst-Regel, Edit mit Referenz, Paar-Check + Mensch-Preview |
| Bank wächst unkuratiert durch Demo-Assets | `demo_generiert` bleibt draft; wöchentlicher „Library-Blick": beste Assets per Klick approven, Rest verfällt nach 90 Tagen |

---

**Start mit F1. Nach jeder F-Phase: DoD prüfen, committen, `PROGRESS.md` fortschreiben,
sauber stoppen. Resume-Kommando des Menschen: „Lies BRANCHEN_FABRIK_PROMPT.md und
PROGRESS.md und führe die nächste offene F-Phase aus."**
