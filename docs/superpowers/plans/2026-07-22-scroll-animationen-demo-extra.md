# Scroll-Animationen als wählbares Demo-Extra — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Checkbox „Scroll-Animationen" im Admin-Demo-Formular schaltet gebündelt Scroll-Video-Header (Scrub), Premium-Animationen und Signature-Story ein.

**Architecture:** Ein neues Config-Flag `scroll_animationen` im Demo-Config-JSONB ist die einzige Quelle der Wahrheit. Es wird vom bestehenden Formular-Payload (`scrollAnimationen: true`) über `DesignOverrides` gesetzt und von der Video-Route ausgelesen, um den scrub-Prompt + `modus: 'scrub'` zu wählen. Frontend-Rendering (`.scrub`-Klasse, Scroll-Kopplung) existiert bereits.

**Tech Stack:** Next.js App Router, TypeScript, tsx-Testscripts (`npm run test:flagship`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-22-scroll-animationen-demo-extra-design.md`
- Checkbox-Label exakt: „Scroll-Animationen (Scroll-Video + Effekte)"
- Starter: Checkbox deaktiviert, Hinweis „ab Business"; Wechsel auf Starter setzt gesetzten Haken zurück
- Business + Growth: manuell wählbar, Default aus, NIRGENDS automatisch an
- Branchen ohne scrub-Prompt: stiller Fallback auf Loop-Video, KEIN Fehler
- Frozen Kompositionen (galabau, maler) und deren Stufenlogik werden NICHT verändert
- Deutsche Kommentare/Commits (`feat(demos): …`), bestehende Tests (463 flagship, 204 maler) bleiben grün
- Kein neues Feature-Gate in `config/plans.ts` (nicht im Scope)

---

### Task 1: Config-Flag `scroll_animationen` + Pipeline-Override

**Files:**
- Modify: `lib/flagship/types.ts:287-289` (FlagshipConfig, neben `premium_animationen`)
- Modify: `lib/pipeline/generate-flagship-demo.ts:95-144` (DesignOverrides + `wendeDesignOverridesAn`)
- Modify: `app/api/admin/demos/route.ts:79-81`
- Test: `scripts/test-flagship.ts`

**Interfaces:**
- Consumes: `istMalerKomposition(config)` aus `lib/flagship/maler/types.ts` (existiert)
- Produces: `FlagshipConfig.scroll_animationen?: boolean`; exportierte Funktion `wendeDesignOverridesAn(config: FlagshipConfig, overrides: DesignOverrides): void`; `DesignOverrides.scroll_animationen?: boolean`. Task 2 liest `config.scroll_animationen`.

- [ ] **Step 1: Failing Test schreiben**

In `scripts/test-flagship.ts` ans Ende (vor der Ergebnis-Ausgabe `console.log(\`${geprueft} Prüfungen…\`)` bzw. dem Fehler-Exit) einfügen:

```ts
// ------------------------------------------------------------
// Scroll-Animationen-Extra (Spec 2026-07-22)
// ------------------------------------------------------------
import { wendeDesignOverridesAn } from '../lib/pipeline/generate-flagship-demo'

{
  const basis = klon(FLAGSHIP_SEEDS[0])

  // Override setzt beide Flags
  const mitFlag = klon(basis)
  wendeDesignOverridesAn(mitFlag, { scroll_animationen: true, premium_animationen: true })
  assert(mitFlag.scroll_animationen === true, 'scroll-extra', 'Override setzt scroll_animationen nicht')
  assert(mitFlag.premium_animationen === true, 'scroll-extra', 'Override setzt premium_animationen nicht')

  // Ohne Override bleibt das Flag aus
  const ohneFlag = klon(basis)
  wendeDesignOverridesAn(ohneFlag, {})
  assert(ohneFlag.scroll_animationen === undefined, 'scroll-extra', 'Flag darf ohne Override nicht gesetzt sein')

  // Render: Scrub-Modus am Hero
  const scrubConfig = klon(basis)
  scrubConfig.scroll_animationen = true
  scrubConfig.inhalte.hero.video = { src: '/media/test.mp4', poster: '/media/test.jpg', modus: 'scrub' }
  const scrubHtml = renderFlagshipPage(scrubConfig, { demo: true, basisPfad: '/demo/test' })
  assert(scrubHtml.includes('data-modus="scrub"'), 'scroll-extra', 'Hero rendert nicht data-modus="scrub"')
  assert(scrubHtml.includes('class="vhero scrub"'), 'scroll-extra', 'Hero hat keine .scrub-Klasse')

  // Render: Loop bleibt Default
  const loopConfig = klon(basis)
  loopConfig.inhalte.hero.video = { src: '/media/test.mp4', poster: '/media/test.jpg', modus: 'loop' }
  const loopHtml = renderFlagshipPage(loopConfig, { demo: true, basisPfad: '/demo/test' })
  assert(loopHtml.includes('data-modus="loop"'), 'scroll-extra', 'Hero rendert nicht data-modus="loop"')
}
```

Hinweis: `import` muss ggf. an den Dateianfang zu den anderen Imports (ESM). `klon`, `FLAGSHIP_SEEDS`, `renderFlagshipPage`, `assert` existieren bereits in der Datei.

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npm run test:flagship`
Expected: FAIL — `wendeDesignOverridesAn` wird nicht exportiert (Compile-Fehler) bzw. `scroll_animationen` existiert nicht auf `DesignOverrides`.

- [ ] **Step 3: Typ-Feld ergänzen**

In `lib/flagship/types.ts` direkt nach `premium_animationen?: boolean` (Zeile ~289):

```ts
  /** Scroll-Animationen-Extra: Scroll-Video-Header (Scrub) + Signature-Story (Demo-Formular) */
  scroll_animationen?: boolean
```

- [ ] **Step 4: DesignOverrides + wendeDesignOverridesAn erweitern und exportieren**

In `lib/pipeline/generate-flagship-demo.ts`:

a) Import ergänzen (bei den bestehenden Imports):

```ts
import { istMalerKomposition } from '@/lib/flagship/maler/types'
```

b) `DesignOverrides`-Interface (Zeile ~96-104) erweitern:

```ts
  /** Scroll-Animationen-Extra: Scrub-Video-Header + Signature-Story (gebündelt) */
  scroll_animationen?: boolean
```

c) `function wendeDesignOverridesAn` → `export function wendeDesignOverridesAn` und am Ende der Funktion (nach dem `premium_animationen`-Block):

```ts
  if (overrides.scroll_animationen) {
    config.scroll_animationen = true
    // Kompositionen mit Signature-Story (aktuell maler-landing-v1): Story einschalten
    if (istMalerKomposition(config)) config.signature_story = 'on'
  }
```

- [ ] **Step 5: Demos-Route setzt das neue Override**

In `app/api/admin/demos/route.ts` (Zeile 79-81) ersetzen:

```ts
    if (body?.scrollAnimationen === true) {
      designOverrides.premium_animationen = true
    }
```

durch:

```ts
    if (body?.scrollAnimationen === true) {
      designOverrides.premium_animationen = true
      designOverrides.scroll_animationen = true
    }
```

- [ ] **Step 6: Tests laufen lassen — müssen grün sein**

Run: `npm run test:flagship && npm run test:maler && npx tsc --noEmit`
Expected: PASS — 463+6 flagship-Prüfungen (die 6 neuen), 204 maler, kein Typfehler.

- [ ] **Step 7: Commit**

```bash
git add lib/flagship/types.ts lib/pipeline/generate-flagship-demo.ts app/api/admin/demos/route.ts scripts/test-flagship.ts
git commit -m "feat(demos): Config-Flag scroll_animationen — Override bündelt Scrub + Signature-Story"
```

---

### Task 2: Video-Route wählt Scrub-Prompt + Modus

**Files:**
- Modify: `app/api/admin/demos/[demoId]/video/route.ts:73-89`
- Modify: `lib/pipeline/generate-flagship-demo.ts:24` (VIDEO_PROMPTS exportieren)

**Interfaces:**
- Consumes: `config.scroll_animationen` (Task 1); `VIDEO_PROMPTS: Record<string, { loop: string; scrub: string }>` aus `lib/pipeline/generate-flagship-demo.ts` (wird exportiert als `FLAGSHIP_VIDEO_PROMPTS`)
- Produces: `config.inhalte.hero.video.modus: 'scrub' | 'loop'` in gespeicherten Demo-Configs

- [ ] **Step 1: Scrub-Prompts exportieren**

In `lib/pipeline/generate-flagship-demo.ts` Zeile ~24:

```ts
const VIDEO_PROMPTS: Record<string, { loop: string; scrub: string }> = {
```

ersetzen durch:

```ts
export const FLAGSHIP_VIDEO_PROMPTS: Record<string, { loop: string; scrub: string }> = {
```

Alle internen Verwendungen von `VIDEO_PROMPTS` in dieser Datei auf `FLAGSHIP_VIDEO_PROMPTS` umbenennen (Suchen/Ersetzen, es gibt 2 Stellen: die Definition und `const branchenVideo = VIDEO_PROMPTS[brancheKey]` im videoJob-Block ~Zeile 662).

- [ ] **Step 2: Video-Route umbauen**

In `app/api/admin/demos/[demoId]/video/route.ts`:

a) Import ergänzen:

```ts
import { FLAGSHIP_VIDEO_PROMPTS } from '@/lib/pipeline/generate-flagship-demo'
```

b) Zeilen 73-75 ersetzen:

```ts
  const brancheKey = demo.branche || config.branche_key || ''
  const videoPrompt = VIDEO_PROMPTS[brancheKey]
    || `Cinematic 4K, static camera. Close-up scene related to ${brancheKey}. Subtle ambient motion, gentle material movement. Seamless 5-second loop. No face, no text, no logos.`
```

durch:

```ts
  const brancheKey = demo.branche || config.branche_key || ''
  // Scroll-Animationen-Extra: Scrub-Video (Verwandlung an Scroll gekoppelt) statt Loop.
  // Branchen ohne Scrub-Prompt fallen still auf Loop zurück (Spec 2026-07-22).
  const scrubPrompt = config.scroll_animationen === true
    ? FLAGSHIP_VIDEO_PROMPTS[brancheKey]?.scrub
    : undefined
  const videoPrompt = scrubPrompt
    || VIDEO_PROMPTS[brancheKey]
    || `Cinematic 4K, static camera. Close-up scene related to ${brancheKey}. Subtle ambient motion, gentle material movement. Seamless 5-second loop. No face, no text, no logos.`
```

c) Zeile 89 ersetzen:

```ts
    config.inhalte.hero.video = { src: video.videoUrl, poster: heroUrl, modus: 'loop' }
```

durch:

```ts
    config.inhalte.hero.video = { src: video.videoUrl, poster: heroUrl, modus: scrubPrompt ? 'scrub' : 'loop' }
```

Das lokale `VIDEO_PROMPTS` (Loop-Prompts, Zeile 9-27) bleibt unverändert bestehen — es deckt Branchen ab, die in `FLAGSHIP_VIDEO_PROMPTS` fehlen.

- [ ] **Step 3: Prüfen**

Run: `npx tsc --noEmit && npm run test:flagship`
Expected: PASS, keine Typfehler, Tests grün (Route hat keine eigenen Unit-Tests — Render-Seite ist durch Task 1 abgedeckt, Netzwerk-Pfad wird nach Deploy manuell verifiziert).

- [ ] **Step 4: Commit**

```bash
git add lib/pipeline/generate-flagship-demo.ts "app/api/admin/demos/[demoId]/video/route.ts"
git commit -m "feat(demos): Video-Route generiert Scrub-Video bei scroll_animationen"
```

---

### Task 3: Formular — Label, Starter-Sperre, Reset

**Files:**
- Modify: `app/admin/demos/page.tsx:451` (Paket-Button onClick) und `:519-524` (Checkbox)

**Interfaces:**
- Consumes: States `paket` / `setPaket`, `scrollAnimationen` / `setScrollAnimationen`, `generating` (existieren)
- Produces: unverändertes Payload-Feld `scrollAnimationen: boolean`

- [ ] **Step 1: Paket-Wechsel auf Starter setzt Haken zurück**

In `app/admin/demos/page.tsx` Zeile ~451, im Paket-Button:

```tsx
<button key={p} type="button" onClick={() => setPaket(p)} disabled={generating}
```

ersetzen durch:

```tsx
<button key={p} type="button" onClick={() => { setPaket(p); if (p === 'starter') setScrollAnimationen(false) }} disabled={generating}
```

- [ ] **Step 2: Checkbox — Label + Starter-Sperre**

Zeilen ~519-524 (der Extras-Block) ersetzen:

```tsx
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: scrollAnimationen ? 'rgba(212,168,40,0.08)' : 'rgba(255,255,255,0.7)', border: `1px solid ${scrollAnimationen ? 'var(--za-gold)' : 'var(--za-border)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--za-fg-2)', transition: '.15s' }}>
                  <input type="checkbox" checked={scrollAnimationen} onChange={(e) => setScrollAnimationen(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--za-gold)' }} disabled={generating} />
                  Scroll-Animationen (Premium)
                </label>
```

durch:

```tsx
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: scrollAnimationen ? 'rgba(212,168,40,0.08)' : 'rgba(255,255,255,0.7)', border: `1px solid ${scrollAnimationen ? 'var(--za-gold)' : 'var(--za-border)'}`, borderRadius: '8px', cursor: paket === 'starter' ? 'not-allowed' : 'pointer', opacity: paket === 'starter' ? 0.5 : 1, fontSize: '12px', fontWeight: 600, color: 'var(--za-fg-2)', transition: '.15s' }}>
                  <input type="checkbox" checked={scrollAnimationen} onChange={(e) => setScrollAnimationen(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--za-gold)' }} disabled={generating || paket === 'starter'} />
                  {paket === 'starter' ? 'Scroll-Animationen — ab Business' : 'Scroll-Animationen (Scroll-Video + Effekte)'}
                </label>
```

- [ ] **Step 3: Prüfen**

Run: `npx tsc --noEmit && npx next build 2>&1 | tail -5`
Expected: Typecheck + Build ohne Fehler.

- [ ] **Step 4: Commit**

```bash
git add app/admin/demos/page.tsx
git commit -m "feat(demos): Scroll-Animationen-Checkbox — Starter gesperrt, Label präzisiert"
```

---

## Abschluss-Verifikation (manuell, nach Deploy)

1. `/admin/demos` → Business-Paket → Haken „Scroll-Animationen (Scroll-Video + Effekte)" → Demo generieren
2. Demo öffnen: Hero-Video spielt beim Scrollen (nicht als Auto-Loop), `data-modus="scrub"` im DOM
3. Starter wählen → Checkbox ausgegraut mit „ab Business", gesetzter Haken verschwindet
4. Demo ohne Haken: Hero weiter als Loop-Video
