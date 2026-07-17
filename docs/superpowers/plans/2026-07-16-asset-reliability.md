# Asset-Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guarantee every saved demo has 100% of its required assets — no CSS placeholders, no broken images.

**Architecture:** Provider-level retry in `generiereAsset`/`generiereVideo`, asset-level retry loop in `generiereFlagshipDemo`, mandatory slot validation before return, URL validation for Premium engine, improved logo extraction in scraper.

**Tech Stack:** TypeScript, Next.js App Router, Supabase, Higgsfield/fal.ai

## Global Constraints

- No test framework (vitest/jest) installed — verification via `npx tsx` scripts and manual testing
- Existing provider chain order: Higgsfield → fal → Mock (unchanged)
- Bank-Fallback remains as last resort before hard fail
- Video remains optional (warning, not error)
- Budget checks remain — retries don't bypass `ASSET_BUDGET_TAG_CENT`
- `maxDuration: 300` on API routes (sufficient for retries)

---

### Task 1: Provider-Retry in `generiereAsset()` und `generiereVideo()`

**Files:**
- Modify: `lib/assets/pipeline.ts:155-195` (generiereAsset)
- Modify: `lib/assets/pipeline.ts:283-324` (generiereVideo)

**Interfaces:**
- Consumes: `AssetProvider.generateImage()`, `AssetProvider.generateVideo()` from `lib/assets/higgsfield.ts`
- Produces: Same `generiereAsset()` and `generiereVideo()` signatures (no API change), but with internal retry

- [ ] **Step 1: Add `sleep` helper at top of `pipeline.ts`**

After the existing imports (line 30), add:

```typescript
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const PROVIDER_RETRIES = 2
const RETRY_DELAY_MS = 3000
```

- [ ] **Step 2: Replace the provider loop in `generiereAsset()` with retry logic**

Replace the provider loop (lines 172-195 — from `const kette =` through the `if (!bild || !provider)` block) with:

```typescript
  const kette = vorgabe?.providers ?? getAssetProviderKette()
  let bild: GeneratedImage | null = null
  let provider: AssetProvider | null = null
  let letzterFehler: unknown = null
  for (const p of kette) {
    for (let versuch = 1; versuch <= PROVIDER_RETRIES; versuch++) {
      try {
        bild = await p.generateImage({
          prompt: o.prompt,
          aspect: o.aspect,
          referenceJobId: o.referenceJobId,
          seed: o.seed,
        })
        provider = p
        break
      } catch (e) {
        letzterFehler = e
        console.warn(
          `[assets] Provider ${p.name} Versuch ${versuch}/${PROVIDER_RETRIES} fehlgeschlagen:`,
          (e as Error).message
        )
        if (versuch < PROVIDER_RETRIES) await sleep(RETRY_DELAY_MS)
      }
    }
    if (bild) break
  }
  if (!bild || !provider) {
    throw new Error(
      `Alle Asset-Provider fehlgeschlagen (je ${PROVIDER_RETRIES} Versuche): ${letzterFehler instanceof Error ? letzterFehler.message : letzterFehler}`
    )
  }
```

- [ ] **Step 3: Replace the provider loop in `generiereVideo()` with retry logic**

Replace the provider loop (lines 290-308 — from `const kette =` through the `if (!ergebnis || !provider)` block) with:

```typescript
  const kette = getAssetProviderKette()
  let ergebnis: GeneratedVideo | null = null
  let provider: AssetProvider | null = null
  let letzterFehler: unknown = null
  for (const p of kette) {
    if (!p.generateVideo) continue
    for (let versuch = 1; versuch <= PROVIDER_RETRIES; versuch++) {
      try {
        ergebnis = await p.generateVideo(o)
        provider = p
        break
      } catch (e) {
        letzterFehler = e
        console.warn(
          `[video] Provider ${p.name} Versuch ${versuch}/${PROVIDER_RETRIES} fehlgeschlagen:`,
          (e as Error).message
        )
        if (versuch < PROVIDER_RETRIES) await sleep(RETRY_DELAY_MS)
      }
    }
    if (ergebnis) break
  }
  if (!ergebnis || !provider) {
    throw new Error(
      `Kein Video-Provider verfügbar (je ${PROVIDER_RETRIES} Versuche): ${letzterFehler instanceof Error ? letzterFehler.message : 'keine Provider mit generateVideo'}`
    )
  }
```

- [ ] **Step 4: Verify build compiles**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors in `lib/assets/pipeline.ts`

- [ ] **Step 5: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/assets/pipeline.ts
git commit -m "feat: add provider-level retry (2 attempts, 3s delay) to generiereAsset/generiereVideo"
```

---

### Task 2: Asset-Retry + Pflicht-Validierung in `generiereFlagshipDemo()`

**Files:**
- Modify: `lib/pipeline/generate-flagship-demo.ts:194-503`

**Interfaces:**
- Consumes: `generiereAsset()`, `generiereVideo()`, `makePair()` from `lib/assets/pipeline.ts` (with retry from Task 1)
- Produces: Same `generiereFlagshipDemo()` signature, but now throws if required assets are missing instead of returning warnings

- [ ] **Step 1: Add validation function and constants after the `DEMO_KOSTEN_LIMIT_CENT` constant (line 87)**

```typescript
const MAX_ASSET_DURCHLAEUFE = 2

/**
 * Prüft ob alle Pflicht-Asset-Slots in der Config befüllt sind.
 * Gibt die Namen fehlender Slots zurück (leer = alles ok).
 */
function fehlendePflichtSlots(config: FlagshipConfig): string[] {
  const fehlend: string[] = []
  if (!config.inhalte.hero.media.datei) fehlend.push('hero')
  if (!config.inhalte.signature.nachher.datei) fehlend.push('signature-nachher')
  if (!config.inhalte.signature.vorher.datei) fehlend.push('signature-vorher')
  if (config.inhalte.ergebnisse.variante === 'ba_slider' && config.inhalte.ergebnisse.paare) {
    for (const [i, p] of config.inhalte.ergebnisse.paare.entries()) {
      if (!p.nachher.datei) fehlend.push(`ergebnis-${i}-nachher`)
      if (!p.vorher.datei) fehlend.push(`ergebnis-${i}-vorher`)
    }
  }
  return fehlend
}
```

- [ ] **Step 2: Refactor the asset generation block into a retry loop**

The current code has two near-identical blocks (lines 278-436): one for branches with `style_prompts`, one without. Both use the same `Promise.allSettled` pattern. The change wraps each block's hero+signature generation in a retry loop.

Replace the entire asset generation section (from `if (styleProfil?.style_prompts) {` through the end of the else block at line 436, just before `// Fallback-Kette: Bank`) with:

```typescript
  // 2) Schlüssel-Assets: Retry-Schleife → Bank-Fallback → Pflicht-Validierung
  for (let durchlauf = 1; durchlauf <= MAX_ASSET_DURCHLAEUFE; durchlauf++) {
    // Hero nur generieren wenn noch nicht vorhanden
    if (!config.inhalte.hero.media.datei) {
      let heroPrompt: string
      if (styleProfil?.style_prompts) {
        heroPrompt = baueAssetPrompt(styleProfil, styleProfil.style_prompts.szenen.hero)
      } else {
        const heroLabel = config.inhalte.hero.media.label || config.inhalte.hero.eyebrow
        const brancheName = row.name || brancheKey
        heroPrompt = [
          `Close-up on the craft and result: ${heroLabel}, hands and tools only, no face visible, cropped above shoulders.`,
          `The main action positioned on the RIGHT half of the frame, calm open ${brancheName} interior on the left.`,
          `${brancheName} professional environment, authentic workplace details.`,
          `Bright natural side lighting with reflections on clean surfaces.`,
          `Shallow depth of field, 16:9 wide format.`,
          `Photorealistic editorial photography. No text, no logos, no watermarks, no recognizable people.`,
        ].join(' ')
      }

      try {
        const hero = await generiereAsset({
          prompt: heroPrompt,
          aspect: '16:9',
          branche: brancheKey,
          szeneTyp: 'hero',
          quelleOverride: 'demo_generiert',
          kontext,
        })
        kostenCent += hero.kostenCent
        config.inhalte.hero.media.datei = hero.publicUrl
        assetMeta.hero = { id: hero.id, quelle: 'frisch' }

        // Video-Hero (optional, Fehler = Warning)
        try {
          let videoPrompt: string
          if (styleProfil?.style_prompts) {
            videoPrompt = baueVideoPrompt(styleProfil)
          } else {
            const heroLabel = config.inhalte.hero.media.label || config.inhalte.hero.eyebrow
            const brancheName = row.name || brancheKey
            const branchenBewegung = VIDEO_PROMPTS[brancheKey] || `Subtle ambient motion fitting for ${brancheName}: light reflections shifting on surfaces, gentle material movement, dust particles in light.`
            videoPrompt = [
              `Cinematic 4K, completely static tripod camera, zero camera movement.`,
              `Close-up scene: ${heroLabel}. ${brancheName} environment.`,
              branchenBewegung,
              `Seamless 5-second loop, calm and premium. No face visible, no person looking at camera. No text, no logos.`,
            ].join(' ')
          }
          const video = await generiereVideo({
            imageUrl: hero.publicUrl,
            prompt: videoPrompt,
            durationSeconds: 6,
            kontext: `video:${kontext}`,
          })
          if (video.videoUrl) {
            kostenCent += video.kostenCent
            config.inhalte.hero.video = { src: video.videoUrl, poster: hero.publicUrl }
            assetMeta.video = { job_id: video.jobId, quelle: 'frisch' }
          }
        } catch (e) {
          warnungen.push(`Video-Hero fehlgeschlagen (Bild-Hero bleibt): ${(e as Error).message}`)
        }
      } catch (e) {
        warnungen.push(`Hero-Generierung Durchlauf ${durchlauf} fehlgeschlagen: ${(e as Error).message}`)
      }
    }

    // Signature-Paar nur generieren wenn noch nicht vorhanden
    if (!config.inhalte.signature.nachher.datei || !config.inhalte.signature.vorher.datei) {
      let nachherPrompt: string
      let vorherPrompt: string
      if (styleProfil?.style_prompts) {
        nachherPrompt = baueAssetPrompt(styleProfil, styleProfil.style_prompts.szenen.signature_nachher)
        vorherPrompt = styleProfil.style_prompts.szenen.signature_vorher
      } else {
        const nachherLabel = config.inhalte.signature.nachher.label || config.inhalte.signature.tag_nachher
        const vorherLabel = config.inhalte.signature.vorher.label || config.inhalte.signature.tag_vorher
        const brancheName = row.name || brancheKey
        const sigCap = config.inhalte.signature.cap || ''
        nachherPrompt = [
          `${nachherLabel}. ${sigCap || brancheName}.`,
          `The space/result is IMMACULATE — gleaming surfaces, well-maintained, inviting. The satisfying outcome of professional work.`,
          `Bright natural daylight, warm atmosphere, sharp details showing quality.`,
          `Eye-level perspective, 16:9 wide format.`,
          `Photorealistic photography, shallow depth of field. No people, no text, no logos.`,
        ].join(' ')
        vorherPrompt = [
          `Edit this exact scene, keep the IDENTICAL room, furniture, objects, windows, camera angle and perspective unchanged.`,
          `Only change: ${vorherLabel}. Cover surfaces in dust, grime, stains. Dull and unmaintained state.`,
          `Muted desaturated colors, flat unflattering light. Dramatic but realistic contrast to the clean version.`,
          `Same exact composition and framing — only the cleanliness/condition changes. No text, no logos.`,
        ].join(' ')
      }

      try {
        const paar = await makePair({
          branche: brancheKey,
          nachherPrompt,
          vorherPrompt,
          aspect: '16:9',
          quelleOverride: 'demo_generiert',
          kontext,
        })
        kostenCent += paar.nachher.kostenCent + paar.vorher.kostenCent
        config.inhalte.signature.nachher.datei = paar.nachher.publicUrl
        config.inhalte.signature.vorher.datei = paar.vorher.publicUrl
        assetMeta.paar = { pair_id: paar.pairId, asset_ids: [paar.nachher.id, paar.vorher.id], quelle: 'frisch' }
      } catch (e) {
        warnungen.push(`Signature-Paar Durchlauf ${durchlauf} fehlgeschlagen: ${(e as Error).message}`)
      }
    }

    // Prüfen ob Hero + Signature komplett sind → früh raus
    if (config.inhalte.hero.media.datei && config.inhalte.signature.nachher.datei && config.inhalte.signature.vorher.datei) {
      break
    }
    if (durchlauf < MAX_ASSET_DURCHLAEUFE) {
      console.warn(`[flagship-demo] Durchlauf ${durchlauf}: Assets unvollständig, starte Retry…`)
    }
  }
```

- [ ] **Step 3: Add retry to Ergebnis-Paare (ba_slider)**

Replace the existing ergebnis-paare block (lines 462-494, the `if (config.inhalte.ergebnisse.variante === 'ba_slider'` block) with:

```typescript
  if (config.inhalte.ergebnisse.variante === 'ba_slider' && config.inhalte.ergebnisse.paare) {
    for (let i = 0; i < config.inhalte.ergebnisse.paare.length; i++) {
      const paarDef = config.inhalte.ergebnisse.paare[i]
      if (paarDef.nachher.datei && paarDef.vorher.datei) continue

      for (let durchlauf = 1; durchlauf <= MAX_ASSET_DURCHLAEUFE; durchlauf++) {
        try {
          const nachherLabel = paarDef.nachher.label || paarDef.caption
          const vorherLabel = paarDef.vorher.label || paarDef.caption
          const brName = row.name || brancheKey
          const ergebnisPaar = await makePair({
            branche: brancheKey,
            nachherPrompt: [
              `${nachherLabel}. ${brName}.`,
              `Immaculate, clean, well-maintained result of professional work.`,
              `Bright natural lighting, sharp details. 16:9 format.`,
              `Photorealistic photography, shallow depth of field. No people, no text, no logos.`,
            ].join(' '),
            vorherPrompt: [
              `Edit this exact scene, keep IDENTICAL room, objects, camera angle unchanged.`,
              `Only change: ${vorherLabel}. Dirty, dusty, neglected, worn state. Muted colors, flat light.`,
              `Same composition — only the condition changes. No text, no logos.`,
            ].join(' '),
            aspect: '16:9',
            quelleOverride: 'demo_generiert',
            kontext: `${kontext}:ergebnis-${i}`,
          })
          kostenCent += ergebnisPaar.nachher.kostenCent + ergebnisPaar.vorher.kostenCent
          paarDef.nachher.datei = ergebnisPaar.nachher.publicUrl
          paarDef.vorher.datei = ergebnisPaar.vorher.publicUrl
          break
        } catch (e) {
          warnungen.push(`Ergebnis-Paar ${i + 1} Durchlauf ${durchlauf} fehlgeschlagen: ${(e as Error).message}`)
          if (durchlauf >= MAX_ASSET_DURCHLAEUFE) {
            // Kein throw hier — Validierung am Ende fängt es
          }
        }
      }
    }
  }
```

- [ ] **Step 4: Add mandatory validation after bank-fallback and before return**

After the existing bank-fallback block (the `if (!config.inhalte.signature.nachher.datei ...` block that ends around line 459) and after the ergebnis-paare block, replace the cost-warning + return (lines 496-502) with:

```typescript
  // Pflicht-Validierung: ALLE Asset-Slots müssen befüllt sein
  const fehlend = fehlendePflichtSlots(config)
  if (fehlend.length > 0) {
    throw new Error(
      `Asset-Generierung unvollständig nach ${MAX_ASSET_DURCHLAEUFE} Durchläufen + Bank-Fallback. ` +
      `Fehlende Slots: ${fehlend.join(', ')}. Demo wurde NICHT gespeichert.`
    )
  }

  if (kostenCent > DEMO_KOSTEN_LIMIT_CENT) {
    warnungen.push(
      `Demo-Kosten ${kostenCent} Cent über DoD-Grenze (${DEMO_KOSTEN_LIMIT_CENT} Cent)`
    )
  }

  return { config, kostenCent, assetMeta, warnungen }
```

- [ ] **Step 5: Verify build compiles**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors in `lib/pipeline/generate-flagship-demo.ts`

- [ ] **Step 6: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/pipeline/generate-flagship-demo.ts
git commit -m "feat: add asset retry loop + mandatory slot validation in flagship demo pipeline"
```

---

### Task 3: URL-Validierung für Premium-Engine

**Files:**
- Modify: `lib/generate-demo.ts` — add `validateImageUrls()` function
- Modify: `app/api/admin/demos/route.ts:185-225` — call validation after config generation

**Interfaces:**
- Consumes: `generateDemoConfig()` from `lib/generate-demo.ts`
- Produces: `validateImageUrls(config: Record<string, unknown>): Promise<{ config: Record<string, unknown>; entfernt: string[] }>` — new exported function

- [ ] **Step 1: Add `validateImageUrls()` to `lib/generate-demo.ts`**

Add after the `generateDemoConfig` function (after line 139):

```typescript
const URL_CHECK_TIMEOUT_MS = 5000
const IMAGE_KEY_PATTERN = /(?:image|img|logo|hero|gallery|photo|src).*url$/i

/**
 * Prüft alle Bild-URLs in der Config per HEAD-Request.
 * Unerreichbare URLs werden auf null gesetzt.
 */
export async function validateImageUrls(
  config: Record<string, unknown>
): Promise<{ config: Record<string, unknown>; entfernt: string[] }> {
  const urls = new Map<string, { obj: Record<string, unknown>; key: string }>()

  function sammle(obj: unknown, pfad: string): void {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => sammle(v, `${pfad}[${i}]`))
      return
    }
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      if (
        typeof val === 'string' &&
        val.startsWith('http') &&
        IMAGE_KEY_PATTERN.test(key)
      ) {
        urls.set(`${pfad}.${key}`, { obj: obj as Record<string, unknown>, key })
      } else {
        sammle(val, `${pfad}.${key}`)
      }
    }
  }

  sammle(config, 'config')

  const entfernt: string[] = []
  await Promise.all(
    Array.from(urls.entries()).map(async ([pfad, { obj, key }]) => {
      const url = obj[key] as string
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), URL_CHECK_TIMEOUT_MS)
        const res = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
        })
        clearTimeout(timeout)
        if (!res.ok) {
          obj[key] = null
          entfernt.push(url)
        }
      } catch {
        obj[key] = null
        entfernt.push(url)
      }
    })
  )

  return { config, entfernt }
}
```

- [ ] **Step 2: Call validation in the Premium route**

In `app/api/admin/demos/route.ts`, add import at the top (line 7):

```typescript
import { generateDemoConfig, validateImageUrls } from '@/lib/generate-demo'
```

Remove the existing bare import of `generateDemoConfig` (line 7).

Then in the premium engine section, after `config = await generateDemoConfig(...)` (line 197) and before the demo insert, add:

```typescript
  // Bild-URLs validieren (externe URLs vom Prospect können offline sein)
  const { entfernt } = await validateImageUrls(config)
  if (entfernt.length > 0) {
    const urlWarning = `${entfernt.length} Bild-URL(s) nicht erreichbar und entfernt.`
    scrapeWarning = scrapeWarning ? `${scrapeWarning} ${urlWarning}` : urlWarning
  }
```

- [ ] **Step 3: Verify build compiles**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/generate-demo.ts app/api/admin/demos/route.ts
git commit -m "feat: validate Premium demo image URLs, remove unreachable ones"
```

---

### Task 4: Logo-Extraktion verbessern

**Files:**
- Modify: `lib/scrape-prospect.ts:123-149` (extractImages function)

**Interfaces:**
- Consumes: raw HTML string
- Produces: Same `extractImages()` return type `{ images: string[]; logoUrl: string | null }`, but with better logo detection

- [ ] **Step 1: Fix SVG filtering to allow logo SVGs**

In `lib/scrape-prospect.ts`, replace the `extractImages` function (lines 123-149) with:

```typescript
function extractImages(html: string, baseUrl: string): { images: string[]; logoUrl: string | null } {
  const imgTags = Array.from(html.matchAll(/<img[^>]*>/gi)).map((m) => m[0])
  const images: string[] = []
  let logoUrl: string | null = null

  for (const tag of imgTags) {
    const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/i)
    if (!srcMatch) continue
    const src = srcMatch[1]
    if (src.startsWith('data:')) continue
    const abs = absolutize(src, baseUrl)
    if (!abs) continue

    const lower = `${tag.toLowerCase()} ${abs.toLowerCase()}`
    const isLogo = lower.includes('logo')
    const isSvg = /\.svg(\?|$)/i.test(abs)
    const isJunk = /sprite|icon|pixel|tracking|badge|placeholder|captcha|avatar-default/.test(abs.toLowerCase())

    if (isLogo && !logoUrl) {
      logoUrl = abs  // Logo-SVGs sind erlaubt
      continue
    }
    if (isJunk || isSvg) continue  // Nicht-Logo SVGs und Junk weiter filtern
    if (!images.includes(abs)) images.push(abs)
    if (images.length >= MAX_IMAGES) break
  }

  // Fallback: <link rel="icon/apple-touch-icon"> als Logo
  if (!logoUrl) {
    const patterns = [
      /<link[^>]+rel=["'](?:icon|apple-touch-icon|shortcut\s+icon)["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|apple-touch-icon|shortcut\s+icon)["']/i,
    ]
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) {
        const abs = absolutize(match[1], baseUrl)
        if (abs) {
          logoUrl = abs
          break
        }
      }
    }
  }

  return { images, logoUrl }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/scrape-prospect.ts
git commit -m "feat: allow SVG logos, add favicon fallback for logo extraction"
```

---

### Task 5: End-to-End Verification

**Files:**
- No file changes — manual verification

- [ ] **Step 1: TypeScript compilation check**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty`
Expected: Clean compilation, zero errors

- [ ] **Step 2: Verify flagship test script still works**

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | head -50`
Expected: No import errors or type errors (actual asset generation may fail without API keys, that's OK)

- [ ] **Step 3: Review all changes**

Run: `cd ~/webseitenverlag-deutschland && git diff HEAD~4 --stat`
Expected: Only 4 files changed:
- `lib/assets/pipeline.ts`
- `lib/pipeline/generate-flagship-demo.ts`
- `lib/generate-demo.ts`
- `lib/scrape-prospect.ts`
