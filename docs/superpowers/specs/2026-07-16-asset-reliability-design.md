# Asset-Reliability: 100% Asset-Generierung in der Demo-Pipeline

**Ziel:** Jede Demo die gespeichert wird hat ALLE Assets. Keine halben Demos, keine CSS-Platzhalter. Retry bis es klappt, oder Fehler.

---

## Fix 1+2+4: Retry-Logik + Pflicht-Validierung (Flagship)

### Dateien
- `lib/assets/pipeline.ts` — Provider-Retry
- `lib/pipeline/generate-flagship-demo.ts` — Asset-Retry + Validierung

### Provider-Retry (`generiereAsset`)

Aktuell durchläuft die Provider-Kette (Higgsfield → fal → Mock) jeden Provider einmal. Transiente Fehler (Timeout, 503) führen sofort zum Wechsel.

**Änderung in `generiereAsset()` (pipeline.ts Zeile 172-190):**

```
for provider in kette:
    for versuch in [1, 2]:
        try: return provider.generateImage(...)
        catch:
            if versuch == 1: await sleep(3000)  // 1 Retry mit 3s Pause
            else: log warning, nächster Provider
```

Gleiches für `generiereVideo()` (Zeile 289-303).

### Asset-Retry (`generiereFlagshipDemo`)

Aktuell: `Promise.allSettled` → Fehler werden Warnings → Demo wird trotzdem mit leeren Slots gespeichert.

**Änderung:** `Promise.allSettled` wird durch eine Retry-Schleife ersetzt:

```
MAX_ASSET_VERSUCHE = 2

for versuch in [1, 2]:
    // Hero + Signature parallel generieren (wie bisher)
    [heroResult, paarResult] = await Promise.allSettled([...])

    // Ergebnisse auswerten, erfolgreiche Slots merken
    if hero OK: config.inhalte.hero.media.datei = url
    if paar OK: config.inhalte.signature.*.datei = url

    // Prüfen ob alle Pflicht-Slots befüllt
    if alle da: break
    if versuch < MAX: warning loggen, fehlende Slots erneut versuchen
```

Bank-Fallback bleibt als letzte Chance NACH allen Retries (wie bisher Zeile 438-459), aber VOR der Pflicht-Validierung.

### Pflicht-Validierung (neue Funktion)

Nach allen Retries + Bank-Fallback:

```typescript
function validiereAssetSlots(config: FlagshipConfig): string[] {
    const fehlend: string[] = []
    if (!config.inhalte.hero.media.datei) fehlend.push('hero')
    if (!config.inhalte.signature.nachher.datei) fehlend.push('signature-nachher')
    if (!config.inhalte.signature.vorher.datei) fehlend.push('signature-vorher')
    if (config.inhalte.ergebnisse.variante === 'ba_slider') {
        for (const [i, p] of (config.inhalte.ergebnisse.paare ?? []).entries()) {
            if (!p.nachher.datei) fehlend.push(`ergebnis-${i}-nachher`)
            if (!p.vorher.datei) fehlend.push(`ergebnis-${i}-vorher`)
        }
    }
    return fehlend
}
```

Wenn `fehlend.length > 0` → `throw new Error(`Asset-Generierung unvollständig: ${fehlend.join(', ')}`)`. Demo wird NICHT gespeichert. API gibt 500 mit klarer Fehlermeldung zurück.

### Ergebnis-Paare (ba_slider)

Aktuell werden Ergebnis-Paare einzeln sequentiell generiert (Zeile 462-494), ohne Retry. Gleiches Retry-Pattern anwenden: 2 Versuche pro Paar, nach Erschöpfung → throw.

---

## Fix 3: URL-Validierung bei Premium-Engine

### Dateien
- `lib/generate-demo.ts` — neue `validateImageUrls()` Funktion
- `app/api/admin/demos/route.ts` — Aufruf nach `generateDemoConfig()`

### Ablauf

Neue Funktion `validateImageUrls(config)`:

1. Rekursiv alle String-Werte in der Config finden deren Key auf `Url`, `url`, `Image`, `image`, `src` endet
2. Für jede URL: HEAD-Request mit 5s Timeout
3. Unerreichbare URLs → auf `null` setzen
4. Rückgabe: `{ config, removedCount, removedUrls }`

Aufruf im Premium-Pfad der Route (`app/api/admin/demos/route.ts` Zeile 194-203):

```typescript
config = await generateDemoConfig(...)
const { config: validatedConfig, removedCount } = await validateImageUrls(config)
config = validatedConfig
if (removedCount > 0) {
    scrapeWarning = `${removedCount} Bild-URL(s) nicht erreichbar und entfernt.`
}
```

Dies ist best-effort — Premium-Demos nutzen externe URLs die wir nicht kontrollieren. Warning reicht hier, kein hard fail.

---

## Fix 5: Logo-Extraktion verbessern

### Datei
- `lib/scrape-prospect.ts`

### Änderung 1: SVGs für Logos durchlassen

Aktuell (Zeile 138):
```typescript
const isJunk = /sprite|icon|pixel|tracking|badge|placeholder|captcha|avatar-default|\.svg(\?|$)/.test(abs.toLowerCase())
```

`.svg` wird pauschal gefiltert. Änderung: SVGs nur filtern wenn KEIN Logo-Indikator vorhanden:

```typescript
const isSvg = /\.svg(\?|$)/i.test(abs)
const isJunk = /sprite|icon|pixel|tracking|badge|placeholder|captcha|avatar-default/.test(abs.toLowerCase())

// Logo-SVGs durchlassen, generische SVGs weiter filtern
if (isLogo && !logoUrl) {
    logoUrl = abs  // SVG-Logos sind erlaubt
    continue
}
if (isJunk || (isSvg && !isLogo)) continue  // Nicht-Logo SVGs filtern
```

### Änderung 2: Favicon/Touch-Icon als Logo-Fallback

Nach der `<img>`-Extraktion: Falls kein `logoUrl` gefunden, `<link>` Tags prüfen:

```typescript
if (!logoUrl) {
    // <link rel="icon" href="..."> oder <link rel="apple-touch-icon" href="...">
    const linkMatch = html.match(/<link[^>]+rel=["'](icon|apple-touch-icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i)
        || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](icon|apple-touch-icon|shortcut icon)["']/i)
    if (linkMatch) {
        const href = linkMatch[2] || linkMatch[1]  // Gruppe je nach Match-Reihenfolge
        const abs = absolutize(href, baseUrl)
        if (abs) logoUrl = abs
    }
}
```

---

## Nicht-Änderungen

- **Bank-Fallback bleibt erhalten** — wird weiterhin vor dem Fehler probiert
- **Video bleibt optional** — Video-Fehler sind Warnings, kein hard fail (Hero-Bild reicht)
- **Library-Engine** bleibt unverändert (nutzt keine generierten Assets)
- **Custom-Engine** bleibt unverändert (manuelle HTML-Demos)
- **Kosten-Tracking** bleibt gleich, Retries werden normal geloggt
- **Budget-Check** bleibt — wenn Budget überschritten verhindert die Retry-Logik nicht den Budget-Stopp

## Risiken

- **Retry verdoppelt potentiell die Kosten** bei Higgsfield-Fehlern (Asset wird generiert aber Download scheitert). Akzeptabel: Zuverlässigkeit > Kosten.
- **Längere Generierungszeit** durch Retries (worst case: +6s pro fehlgeschlagenem Asset). `maxDuration: 300` ist ausreichend.
- **Premium URL-Validierung** kann false positives haben (Server blockiert HEAD aber GET geht). Deshalb nur Warning, kein hard fail.
