# TEMPLATE-FABRIK — Masterprompt für 16 Branchen (+ neue Branchen auf Zuruf)

> **Sitzungs-Start:** „Lies TEMPLATE_FABRIK_MASTER.md und PROGRESS.md und baue die nächste offene Branche."
> **Nur EINE Branche pro Session.** Die Fortschritts-Matrix in PROGRESS.md ist die einzige Wahrheit.

## 1. Grundprinzip

Das GaLaBau-System (`galabau-landing-v1`, Auftrag T1) wird auf 16 Branchen repliziert.
Pro Branche entsteht **genau EINE Komposition** `{branche}-landing-v1` mit **drei Render-Stufen**:

| Stufe | Paket | Preis | Inhalt |
|---|---|---|---|
| `statisch` | Starter | 99 € | Onepager ohne Video, ohne Signature-Extras |
| `video` | Business | 149 € | + Video-Header, + Galerie, + dezente Signature |
| `growth` | Growth | 249 € | + Unterseiten + Funktions-Module (siehe unten) |

- **Growth-Unterseiten:** `/leistungen/{slug}` (eigener Title, H1 „{Leistung} in {Stadt}", eigene FAQ, eigener CTA) + `/ueber-uns` + `/referenzen`.
- **Growth-Funktions-Module** (Auswahl je Branche im Steckbrief): Terminanfrage/Rückruf-Widget, WhatsApp-Button, Google-Reviews (**nur echte, NIE erfunden**), Referenz-Galerie mit Filter, Einzugsgebiets-Karte, Datei-Anhang im Formular; Restaurant zusätzlich: Speisekarte + Reservierung.
- **Scroll-Story-Signature** = optionales Growth-Extra: `signature_story: on|off`, **Default off**.
- **Stufen-Zuordnung liegt NUR in `config/plans.ts`** — nirgendwo hardcoden.
- **Demos rendern auf Stufe `video`**; `?level=growth` schaltet live auf die Growth-Ansicht um.

## 2. Was pro Branche NEU entsteht (mehr nicht)

1. Theme (Token-Layer, `lib/flagship/themes/{branche}.ts`)
2. Signature-Sektion (der eine unverwechselbare Moment)
3. Copy-Defaults (Seed aus dem freigegebenen Steckbrief)
4. Rezeptliste `rezepte/REZEPTE_{BRANCHE}.md` (aus der GaLaBau-Vorlage abgeleitet)
5. Slot-Feinheiten (nur wo die Branche abweicht)
6. Growth-Modul-Auswahl (im Steckbrief begründet)

Alles andere (Sektions-Reihenfolge, Animations-Grammatik, Copy-/Asset-Slot-Verträge,
Verbatim-Regeln, Test-Muster) wird von `galabau-landing-v1` übernommen.

## 3. Die 16 Branchen

| Nr | Branche | 5 Leistungen | Akzent | Signature | B/A-Motiv |
|---|---|---|---|---|---|
| 1 | GaLaBau ✅ fertig | Gartenplanung, Pflaster/Terrasse, Pflege, Bewässerung, Zaun/Sichtschutz | Grün `#3FA463` | Sticky-Leistungs-Stack + BA-Slider | verwilderter Garten → Neuanlage |
| 2 | Maler & Lackierer | Innenanstrich, Fassade, Lackierarbeiten, Tapezierarbeiten, Spachteltechnik | Salbei `#7BA88A` | Wand färbt sich beim Scroll | vergilbtes Zimmer → frisch gestrichen |
| 3 | Gebäudereinigung | — Steckbrief offen — | Aqua `#3FA0A4` | — | — |
| 4 | Dachdecker | — | Ziegelrot `#B4553D` | — | — |
| 5 | Elektriker | — | Amber `#D98E2B` | — | — |
| 6 | SHK (Sanitär/Heizung/Klima) | — | Tiefblau `#2E6FA8` | — | — |
| 7 | Fliesenleger | — | Steingrau `#6E7B86` | — | — |
| 8 | Schreiner | — | Nussbraun `#8A6240` | — | — |
| 9 | Kfz-Werkstatt | — | Signalrot `#C43D3D` | — | — |
| 10 | Autoaufbereitung | — | Graphit `#3A4149` | — | — |
| 11 | Umzugsunternehmen | — | Orange `#D97B2B` | — | — |
| 12 | Zaun- & Metallbau | — | Anthrazit `#46505A` | — | — |
| 13 | Friseur | — | Champagner `#C9A96A` | Look-Galerie **statt** B/A | kein B/A |
| 14 | Kosmetik | — | Rosé `#C98A8A` | **HWG beachten!** | kein Heilversprechen |
| 15 | Physiotherapie | — | Petrol `#2F8577` | **kein B/A, HWG!** | kein B/A |
| 16 | Restaurant | Speisekarten-Sektion `menu_items[]` statt svc-Karten — einzige strukturelle Abweichung | Bordeaux `#8A3038` | Speisekarte | kein B/A |

Fehlende Zellen („—") werden im jeweiligen B1-Steckbrief gefüllt und dort freigegeben.

**Neue Branche auf Zuruf:** Felix schreibt „Neue Branche: {Name}" ⇒ Tabellenzeile
(Leistungen/Akzent/Signature/B-A) vorschlagen → **STOP: bestätigen lassen** → dann B1–B6.

## 4. Prozess je Branche: B1–B6

### B1 — Steckbrief (`branchen/{branche}/STECKBRIEF.md`)
Inhalt (vollständig, keine Platzhalter):
- Musterbetrieb (Name, fiktive Stadt — **Städte ROTIEREN**, nie zweimal dieselbe)
- 5 Leistungen: Titel / Chip / Claim / 2-Satz-Beschreibung
- 3 „Warum wir"-Punkte mit **konkreten Belegen** (keine Floskeln)
- 6 FAQ mit **ehrlichen Preisspannen**
- KPI-Zeile (3–4 Kennzahlen)
- Inhaber-Zitat
- Growth-Modul-Auswahl **mit Begründung**
- Signature-Konzept (3 Sätze)
- Farbwelt-Begründung (Akzent + Kollisionscheck mit Nachbar-Branchen)

⛔ **STOP: Mensch-Freigabe** — Checkbox in der Matrix (PROGRESS.md). Ohne Haken kein B2.

### B2 — Theme + Komposition
Abgeleitet von `galabau-landing-v1` (Struktur/Animations-Grammatik unangetastet):
Theme-Token, Signature-Sektion, Growth-Unterseiten + gewählte Module, 3 Stufen-Rendering.

### B3 — Rezeptliste
`rezepte/REZEPTE_{BRANCHE}.md` aus der GaLaBau-Vorlage (`rezepte/REZEPTE_GALABAU.md`):
Dateinamen = Slot-IDs mit Bindestrich, Ketten-Logik (Hero zuerst → Video aus Hero;
NACHHER zuerst freigeben → VORHER als image-to-image), Slot-Deckung mit der
Komposition prüfen.

### B4 — Stresstest + Qualität
- `scripts/test-{branche}.ts` nach dem `test-galabau.ts`-Muster (fiese Datensätze inklusive)
- Lighthouse ≥ 90/95/90 auf **allen Stufen inkl. JEDER Growth-Unterseite** (Stub-Assets)
- QUALITY_CHECKLIST-Regeln erfüllt, Golden-Set-Eintrag ergänzt

### B5 — Optik-Abnahme
Playwright-Screenshots **aller 3 Stufen** in PROGRESS.md verlinken.
⛔ **STOP: Mensch-Freigabe Optik** — erst danach `frozen: true`.

### B6 — Assets + Probe-Demo
Echte Assets importieren (`import-assets.ts`), Probe-Demo generieren.
Ohne Assets: Stubs bis B5, Rest auf WARTELISTE.

## 5. Harte Regeln

1. **Kein Redesign der Basis.** Änderungen an der gemeinsamen Grundlage = eigene Session
   + Golden-Set-Lauf über ALLE fertigen Branchen.
2. **Verbatim-Regel:** Firma / Ort / Telefon gehen NIE durch ein LLM.
3. Eine Matrix-Zeile gilt erst als fertig, wenn sie **komplett grün** ist.
4. **Kosten-Log je Branche in Cent** (Assets + LLM) in PROGRESS.md.
5. Team-Slots aus der Asset-Bank sind **nur für Demos** (KI-Menschen als „Team" live = Vertrauensbruch).
6. Nie zwei Branchen parallel bearbeiten.

## 6. Fortschritts-Matrix (Format)

In PROGRESS.md unter „## Template-Fabrik — Fortschritts-Matrix":

```
| Branche | B1 | Freigabe | B2 | B3 | B4 | B5-Optik | Assets | Demo-URL |
```

Werte: ✅ / ⛔ (wartet auf Mensch) / — (offen). Nur diese Tabelle zählt.
