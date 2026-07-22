# FEHLERJOURNAL — Selbstkontrolle (Dauerregel)

> Jeder gefundene Fehler bekommt einen Eintrag:
> `Datum · Fehler · Root Cause · Fix · VERHINDERUNGS-REGEL`.
> Die Verhinderungs-Regel muss **maschinell** sein (Test, Lint-Regel, Zod-Schema,
> CI-Check) — nie nur „besser aufpassen".
> **Wiederholungs-Verbot:** Tritt ein Fehler erneut auf, der hier steht, ist das
> ein P0 gegen den Prozess — erst die Regel härten, dann weiterarbeiten.

Regel-Status: ✅ = maschinelle Regel existiert und läuft · ⚠️ OFFEN = Regel muss
im Master-Review verifiziert/gebaut werden.

---

## Startbestände (Historie, vor Master-Review 2026-07-23)

### J-001 · Erfundene Marke in Demo (Friseur Schmidt/Lichtwerk)
- **Datum:** Historie (vor 2026-07-23)
- **Fehler:** Demo zeigte eine vom LLM erfundene Firmierung statt des verbatim
  übergebenen Prospect-Namens.
- **Root Cause:** Firmenname lief durch LLM-formulierte Texte statt mechanischer
  Ersetzung; keine Validierung „meta.firma erscheint verbatim, keine Fremdmarke".
- **Fix:** meta.firma/ort/telefon VERBATIM aus business_profiles; mechanische
  Ersetzung via `ersetzeUeberall` (lib/pipeline/generate-flagship-demo.ts);
  Konsistenz-Validator prüft Fremdstadt/Fremdname.
- **VERHINDERUNGS-REGEL:** Konsistenz-Validator (QA-Gate) schlägt fehl, wenn
  Vorlagen-Firma/-Ort im gerenderten HTML auftaucht. Regel-Status: ⚠️ OFFEN —
  im Review beweisen (Test mit Vorlagen-Name im Assert).

### J-002 · Sichtbare „0+"-Zähler auf der Seite
- **Datum:** Historie (vor 2026-07-23)
- **Fehler:** Stat-Zähler rendert „0+" wenn keine Kennzahl vorhanden.
- **Root Cause:** Zähler-Sektion rendert bedingungslos; fehlender Wert wird als 0
  interpretiert statt die Kachel wegzulassen.
- **Fix:** Kennzahlen ohne Wert werden nicht gerendert.
- **VERHINDERUNGS-REGEL:** Render-Test asserted, dass „0+" in keinem generierten
  HTML vorkommt. Regel-Status: ⚠️ OFFEN — im Review als Assert in Golden-Set/
  QA-Gate nachweisen.

### J-003 · Platzhalter „wird vom System generiert" im Footer
- **Datum:** Historie (vor 2026-07-23)
- **Fehler:** Interner Platzhalter-Text erschien auf ausgelieferter Seite.
- **Root Cause:** Platzhalter-String aus Seed/Config gelangte ungefiltert in den
  Renderer; kein Scan auf verbotene interne Strings.
- **Fix:** Platzhalter entfernt.
- **VERHINDERUNGS-REGEL:** QA-Gate mit Verbots-Liste interner Strings
  („wird vom System generiert", „TODO", „Platzhalter", „Lorem") über das
  gesamte HTML. Regel-Status: ⚠️ OFFEN — Liste + Test im Review verifizieren.

### J-004 · Sektionen bei Bildfehlern still ausgeblendet
- **Datum:** Historie (vor 2026-07-23)
- **Fehler:** Fehlende/kaputte Assets führten dazu, dass ganze Sektionen ohne
  Warnung wegfielen — Demo sah „fertig" aus, war aber unvollständig.
- **Root Cause:** Renderer behandelte fehlende MediaSlots als „Sektion weglassen"
  statt als Fehler; keine Pflicht-Slot-Validierung am Ende.
- **Fix:** `fehlendePflichtSlots` — Demo wird NICHT gespeichert, wenn
  Pflicht-Slots leer sind (generate-flagship-demo.ts).
- **VERHINDERUNGS-REGEL:** Pflicht-Slot-Validierung wirft hart; Test deckt den
  Pfad ab. Regel-Status: ⚠️ OFFEN — Testabdeckung im Review beweisen.

### J-005 · SF-Pro-Lizenzdatei im Kunden-Handoff
- **Datum:** Historie (vor 2026-07-23)
- **Fehler:** Apple-SF-Pro-Font (nicht lizenzierbar für Web-Weitergabe) lag im
  ausgelieferten Handoff-Paket.
- **Root Cause:** Font-Dateien wurden unreflektiert mitkopiert; keine
  Lizenz-Whitelist im Build/Export.
- **Fix:** SF Pro entfernt, nur lizenzfreie Fonts (Google Fonts/self-hosted OFL).
- **VERHINDERUNGS-REGEL:** CI-Scan: Export/Public-Verzeichnisse dürfen keine
  Dateien matchen auf `(SF-?Pro|\.dfont|Apple)` u. ä.; Font-Whitelist.
  Regel-Status: ⚠️ OFFEN — Scan im Review einrichten oder nachweisen.

---

## Neue Einträge (Master-Review 2026-07-23 ff.)

_(noch keine)_
