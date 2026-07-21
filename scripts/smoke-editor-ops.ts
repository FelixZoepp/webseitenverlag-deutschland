/**
 * Offline-Smoke-Test §10.2 (DoD Phase F): npx tsx scripts/smoke-editor-ops.ts
 *  - invalider Patch (falscher Op-Typ / rohes HTML) wird abgewiesen
 *  - Leitplanken: Telefon gesperrt, Hero nicht ausblendbar, Reorder nur Permutation
 *  - gültiger Patch geht durch, All-or-Nothing bei Teil-Fehler
 */
import { PatchSchema, applyPatch, THEME_PRESETS, type AufgeloestesBild } from '../lib/editor-ops'

let fehler = 0
function check(name: string, bedingung: boolean) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}`)
  if (!bedingung) fehler++
}

const config: Record<string, unknown> = {
  headline: 'Alte Überschrift',
  tagline: 'Alter Slogan',
  phone: '030 123456',
  heroImageUrl: 'https://images.unsplash.com/photo-1',
  sections: [
    { id: 'sek-hero', type: 'hero', title: 'Hero', visible: true, order: 1 },
    { id: 'sek-leist', type: 'leistungen', title: 'Leistungen', visible: true, order: 2 },
    { id: 'sek-kontakt', type: 'kontakt', title: 'Kontakt', visible: true, order: 3 },
  ],
}

// 1. Unbekannter Op-Typ → Zod weist ab
check('Zod: unbekannter Op-Typ abgewiesen',
  !PatchSchema.safeParse([{ op: 'inject_html', html: '<script>alert(1)</script>' }]).success)

// 2. Leeres Array → abgewiesen (min 1)
check('Zod: leerer Patch abgewiesen', !PatchSchema.safeParse([]).success)

// 3. __proto__-Pfad → abgewiesen
check('Zod: __proto__-Pfad abgewiesen',
  !PatchSchema.safeParse([{ op: 'update_text', pfad: '__proto__.x', wert: 'a' }]).success)

// 4. Gesperrter Pfad (Telefon) → applyPatch weist ab
{
  const p = PatchSchema.safeParse([{ op: 'update_text', pfad: 'phone', wert: '0900 555' }])
  check('Leitplanke: Telefon-Pfad Zod-gültig, aber gesperrt',
    p.success && !applyPatch(config, p.data).ok)
}

// 5. Gültiger Text-Patch → geht durch, Original unverändert
{
  const p = PatchSchema.parse([{ op: 'update_text', pfad: 'headline', wert: 'Neue Überschrift' }])
  const r = applyPatch(config, p)
  check('Gültig: update_text angewendet',
    r.ok && (r.config as Record<string, unknown>).headline === 'Neue Überschrift')
  check('Immutabilität: Original unverändert', config.headline === 'Alte Überschrift')
}

// 6. All-or-Nothing: 1 gültige + 1 gesperrte Op → GESAMT abgewiesen
{
  const p = PatchSchema.parse([
    { op: 'update_text', pfad: 'headline', wert: 'OK' },
    { op: 'update_text', pfad: 'phone', wert: '0900' },
  ])
  check('All-or-Nothing: Misch-Patch komplett abgewiesen', !applyPatch(config, p).ok)
}

// 7. Bild-Swap (Phase 4): nur Asset-IDs aus der aufgelösten Bank-Menge
{
  const heroAssetId = '11111111-1111-4111-8111-111111111111'
  const galerieAssetId = '22222222-2222-4222-8222-222222222222'
  const bilder = new Map<string, AufgeloestesBild>([
    [heroAssetId, { url: 'https://cdn.example.supabase.co/asset-bank/hero.webp', szeneTyp: 'hero', quelle: 'bank' }],
    [galerieAssetId, { url: 'https://cdn.example.supabase.co/asset-bank/galerie.webp', szeneTyp: 'galerie', quelle: 'bank' }],
  ])
  const alteForm = PatchSchema.safeParse([{ op: 'swap_image_from_pool_or_upload', pfad: 'heroImageUrl', url: 'https://images.unsplash.com/photo-2' }])
  check('Bild: alter URL-Op-Typ von Zod abgewiesen', !alteForm.success)
  const unbekannt = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: '33333333-3333-4333-8333-333333333333' }])
  check('Bild: unbekannte Asset-ID abgewiesen', !applyPatch(config, unbekannt, bilder).ok)
  const falscheSzene = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: galerieAssetId }])
  check('Bild: Galerie-Asset auf Hero-Pfad abgewiesen', !applyPatch(config, falscheSzene, bilder).ok)
  const gut = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: heroAssetId }])
  const r = applyPatch(config, gut, bilder)
  check('Bild: Hero-Asset auf Hero-Pfad erlaubt',
    r.ok && (r.config as Record<string, unknown>).heroImageUrl === 'https://cdn.example.supabase.co/asset-bank/hero.webp')
}

// 8. Theme: nur Presets
{
  const ungueltig = PatchSchema.safeParse([{ op: 'set_theme_preset', preset: 'neon-pink' }])
  check('Theme: unbekanntes Preset von Zod abgewiesen', !ungueltig.success)
  const gueltig = PatchSchema.parse([{ op: 'set_theme_preset', preset: Object.keys(THEME_PRESETS)[0] }])
  check('Theme: Preset erlaubt', applyPatch(config, gueltig).ok)
}

// 9. Toggle: Hero nicht ausblendbar, Leistungen schon
{
  const hero = PatchSchema.parse([{ op: 'toggle', sectionId: 'sek-hero', sichtbar: false }])
  const leist = PatchSchema.parse([{ op: 'toggle', sectionId: 'sek-leist', sichtbar: false }])
  check('Toggle: Hero-Ausblenden abgewiesen', !applyPatch(config, hero).ok)
  check('Toggle: Leistungen-Ausblenden erlaubt', applyPatch(config, leist).ok)
}

// 10. Reorder: nur exakte Permutation, Hero muss vorn bleiben
{
  const fehltEine = PatchSchema.parse([{ op: 'reorder', sectionIds: ['sek-hero', 'sek-leist'] }])
  const heroHinten = PatchSchema.parse([{ op: 'reorder', sectionIds: ['sek-leist', 'sek-kontakt', 'sek-hero'] }])
  const ok = PatchSchema.parse([{ op: 'reorder', sectionIds: ['sek-hero', 'sek-kontakt', 'sek-leist'] }])
  check('Reorder: unvollständige Liste abgewiesen', !applyPatch(config, fehltEine).ok)
  check('Reorder: Hero nicht an Position 1 abgewiesen', !applyPatch(config, heroHinten).ok)
  check('Reorder: gültige Permutation erlaubt', applyPatch(config, ok).ok)
}

// 11. add_section: nur erlaubte Typen
{
  const boese = PatchSchema.safeParse([{ op: 'add_section_from_library', typ: 'custom-html', titel: 'X' }])
  check('add_section: unbekannter Typ von Zod abgewiesen', !boese.success)
  const gut = PatchSchema.parse([{ op: 'add_section_from_library', typ: 'faq', titel: 'Häufige Fragen' }])
  const r = applyPatch(config, gut)
  check('add_section: FAQ erlaubt', r.ok)
}

// 12. Max 20 Ops
{
  const viele = Array.from({ length: 21 }, (_, i) => ({ op: 'update_text', pfad: 'headline', wert: `v${i}` }))
  check('Zod: >20 Ops abgewiesen', !PatchSchema.safeParse(viele).success)
}

console.log(fehler === 0 ? '\nALLE TESTS BESTANDEN' : `\n${fehler} TEST(S) FEHLGESCHLAGEN`)
process.exit(fehler === 0 ? 0 : 1)
