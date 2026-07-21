/**
 * Baustein-C-Test (Produktstufen 99/149/249 €): npx tsx scripts/test-baustein-c.ts
 *
 * Deckt die QA-Regeln der Kategorie „Produktstufen" ab:
 *  - C-PLAN-GATE: Editor-Ops werden serverseitig gegen den Plan geprüft (nie nur UI)
 *  - C-STARTER-PRESETS: Starter darf nur die 3 kuratierten Theme-Presets
 *  - C-COPY-PERSONAL: Copy-Slots werden in JEDEM Tier personalisiert (kein Duplicate Content)
 *  - C-STARTER-FROZEN: Frozen Composition (library_pages.frozen) existiert als Migration
 *  - C-VIDEO-APPROVED: Nur freigegebene Videos sind zuweisbar (Growth-Gate serverseitig)
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PLANS, getPlan, hatEditorFeature } from '../config/plans'
import { PatchSchema, applyPatch, getOpsPrompt } from '../lib/editor-ops'
import { VIDEO_GUIDELINES, buildVideoRefinerPrompt, getBranchenVideoStil } from '../config/video-guidelines'
import { enthaeltStadt } from '../lib/generierung/copy-slots'

let fehler = 0
function check(name: string, bedingung: boolean) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}`)
  if (!bedingung) fehler++
}

const root = join(__dirname, '..')

// ------------------------------------------------------------
// Plan-Matrix (§C.4): Preise als Hinweis aus Config, Rechte-Matrix
// ------------------------------------------------------------
check('Plans: drei Tiers vorhanden', !!PLANS.starter && !!PLANS.business && !!PLANS.growth)
check('Plans: Preis-Hinweise 99/149/249 € netto',
  PLANS.starter.preis_hinweis === '99 € netto' &&
  PLANS.business.preis_hinweis === '149 € netto' &&
  PLANS.growth.preis_hinweis === '249 € netto')
check('Matrix: Starter hat update_text/swap_image/set_theme_preset',
  hatEditorFeature('starter', 'update_text') &&
  hatEditorFeature('starter', 'swap_image_from_bank') &&
  hatEditorFeature('starter', 'set_theme_preset'))
check('Matrix: Starter hat KEIN add_section/reorder/video/scroll_story',
  !hatEditorFeature('starter', 'add_section_from_library') &&
  !hatEditorFeature('starter', 'reorder') &&
  !hatEditorFeature('starter', 'video_header') &&
  !hatEditorFeature('starter', 'scroll_story'))
check('Matrix: Business hat add_section+reorder+signature, kein Video',
  hatEditorFeature('business', 'add_section_from_library') &&
  hatEditorFeature('business', 'reorder') &&
  hatEditorFeature('business', 'signature_section') &&
  !hatEditorFeature('business', 'video_header'))
check('Matrix: Growth hat alles inkl. video_header+scroll_story',
  hatEditorFeature('growth', 'video_header') && hatEditorFeature('growth', 'scroll_story'))

// ------------------------------------------------------------
// C-PLAN-GATE: applyPatch mit Tier — gesperrte Ops mit Upsell-Antwort
// ------------------------------------------------------------
const config: Record<string, unknown> = {
  headline: 'Überschrift',
  sections: [
    { id: 'sek-hero', type: 'hero', title: 'Hero', visible: true, order: 1 },
    { id: 'sek-leist', type: 'leistungen', title: 'Leistungen', visible: true, order: 2 },
    { id: 'sek-galerie', type: 'galerie', title: 'Galerie', visible: true, order: 3 },
    { id: 'sek-kontakt', type: 'kontakt', title: 'Kontakt', visible: true, order: 4 },
  ],
}

{
  const p = PatchSchema.parse([{ op: 'add_section_from_library', typ: 'faq', titel: 'Häufige Fragen' }])
  const starter = applyPatch(config, p, undefined, 'starter')
  check('C-PLAN-GATE: Starter darf keine Sektion hinzufügen', !starter.ok)
  const grund = starter.ok ? '' : starter.fehler.join(' ')
  check('C-PLAN-GATE: Upsell-Antwort nennt Zielpaket + Preis',
    grund.includes(getPlan('business').name) && grund.includes(getPlan('business').preis_hinweis))
  check('C-PLAN-GATE: Business darf Sektion hinzufügen', applyPatch(config, p, undefined, 'business').ok)
  check('C-PLAN-GATE: ohne Tier kein Gate (Abwärtskompatibilität)', applyPatch(config, p).ok)
}

{
  const p = PatchSchema.parse([{ op: 'toggle', sectionId: 'sek-galerie', sichtbar: false }])
  check('C-PLAN-GATE: Toggle für Starter gesperrt', !applyPatch(config, p, undefined, 'starter').ok)
  check('C-PLAN-GATE: Toggle für Business erlaubt', applyPatch(config, p, undefined, 'business').ok)
}

// Kern-Sektionen-Fix (§C.2): Kontakt bleibt fix — nur freie Sektionen sortierbar
{
  const kontaktNachVorn = PatchSchema.parse([
    { op: 'reorder', sectionIds: ['sek-hero', 'sek-kontakt', 'sek-leist', 'sek-galerie'] },
  ])
  check('C-PLAN-GATE: Business darf Kern-Sektion (Kontakt) nicht verschieben',
    !applyPatch(config, kontaktNachVorn, undefined, 'business').ok)
  const freieSektionen = PatchSchema.parse([
    { op: 'reorder', sectionIds: ['sek-hero', 'sek-galerie', 'sek-leist', 'sek-kontakt'] },
  ])
  check('C-PLAN-GATE: freie Sektionen bleiben für Business sortierbar',
    applyPatch(config, freieSektionen, undefined, 'business').ok)
  check('C-PLAN-GATE: Reorder für Starter gesperrt',
    !applyPatch(config, freieSektionen, undefined, 'starter').ok)
}

// Editor-als-Verkäufer: Prompt-Baustein nur bei eingeschränkten Plänen
{
  const starterPrompt = getOpsPrompt(undefined, 'starter')
  check('C-PLAN-GATE: Starter-Prompt enthält PAKET-RECHTE', starterPrompt.includes('PAKET-RECHTE'))
  check('C-PLAN-GATE: Growth-Prompt ohne Gate-Abschnitt', !getOpsPrompt(undefined, 'growth').includes('PAKET-RECHTE'))
}

// ------------------------------------------------------------
// C-STARTER-PRESETS: nur 3 kuratierte Presets im Starter
// ------------------------------------------------------------
check('C-STARTER-PRESETS: Starter-Allowlist = 3 kuratierte Presets',
  JSON.stringify(PLANS.starter.erlaubteThemePresets) ===
  JSON.stringify(['klar-blau', 'modern-anthrazit', 'warm-terracotta']))
check('C-STARTER-PRESETS: Business/Growth ohne Preset-Einschränkung',
  PLANS.business.erlaubteThemePresets === null && PLANS.growth.erlaubteThemePresets === null)
{
  const verboten = PatchSchema.parse([{ op: 'set_theme_preset', preset: 'frisch-gruen' }])
  check('C-STARTER-PRESETS: nicht-kuratiertes Preset für Starter gesperrt',
    !applyPatch(config, verboten, undefined, 'starter').ok)
  const erlaubt = PatchSchema.parse([{ op: 'set_theme_preset', preset: 'klar-blau' }])
  check('C-STARTER-PRESETS: kuratiertes Preset für Starter erlaubt',
    applyPatch(config, erlaubt, undefined, 'starter').ok)
  check('C-STARTER-PRESETS: Business darf alle Presets',
    applyPatch(config, verboten, undefined, 'business').ok)
}

// ------------------------------------------------------------
// C-COPY-PERSONAL: Personalisierung in JEDEM Tier (kein Duplicate Content)
// ------------------------------------------------------------
{
  const copySlots = readFileSync(join(root, 'lib/generierung/copy-slots.ts'), 'utf8')
  check('C-COPY-PERSONAL: Prompt enthält Firmenname aus dem Profil',
    copySlots.includes('Firmenname: ${profil.firma}'))
  check('C-COPY-PERSONAL: Prompt enthält Stadt aus dem Profil',
    copySlots.includes('Stadt: ${profil.stadt}'))
  check('C-COPY-PERSONAL: Copy-Pipeline hat keinen Tier-Schalter (alle Pakete personalisiert)',
    !copySlots.includes('PackageTier') && !copySlots.includes("tier ==="))
  check('C-COPY-PERSONAL: enthaeltStadt erkennt die Stadt',
    enthaeltStadt('Ihr Malerbetrieb in Berlin', 'Berlin') && !enthaeltStadt('Ihr Malerbetrieb', 'Berlin'))
}

// ------------------------------------------------------------
// C-STARTER-FROZEN: Frozen Composition als additive Migration
// ------------------------------------------------------------
{
  const pfad = join(root, 'supabase/migrations/031_frozen_composition.sql')
  check('C-STARTER-FROZEN: Migration 031 existiert', existsSync(pfad))
  const sql = existsSync(pfad) ? readFileSync(pfad, 'utf8') : ''
  check('C-STARTER-FROZEN: frozen boolean auf library_pages (additiv)',
    sql.includes('frozen boolean') && sql.includes('library_pages') && sql.includes('ADD COLUMN IF NOT EXISTS'))
}

// ------------------------------------------------------------
// C-VIDEO-APPROVED + Video-Guidelines (§C.3)
// ------------------------------------------------------------
check('Video: Dauer-Korridor 5–8s', VIDEO_GUIDELINES.dauerSekundenMin === 5 && VIDEO_GUIDELINES.dauerSekundenMax === 8)
check('Video: Max-Größe 3 MB (C-VIDEO-SIZE-Basis)', VIDEO_GUIDELINES.maxGroesseMb === 3)
check('Video: Negativ-Regeln vorhanden', Array.isArray(VIDEO_GUIDELINES.negativ) && VIDEO_GUIDELINES.negativ.length >= 3)
{
  const prompt = buildVideoRefinerPrompt('Frische Farbe rollt über eine Wand', 'maler')
  check('Video: Refiner-Prompt enthält die Kundenbeschreibung', prompt.includes('Frische Farbe rollt über eine Wand'))
  check('Video: Refiner-Prompt enthält Branchen-Stil', prompt.includes(getBranchenVideoStil('maler').licht))
  check('Video: Refiner-Prompt enthält Pflicht- und Negativ-Regeln',
    prompt.includes('PFLICHT-REGELN') && prompt.includes('VERBOTEN'))
}
{
  const route = readFileSync(join(root, 'app/api/admin/sites/[siteId]/video/route.ts'), 'utf8')
  check('C-VIDEO-APPROVED: Zuweisung prüft quality_status === approved serverseitig',
    route.includes("quality_status !== 'approved'"))
  check('C-VIDEO-APPROVED: Growth-Gate über hatEditorFeature(video_header)',
    route.includes("hatEditorFeature(tier, 'video_header')"))
  check('C-VIDEO-APPROVED: Poster-Fallback bei Zuweisung gesetzt',
    route.includes('poster') && route.includes('C-VIDEO-FALLBACK'))
  check('C-VIDEO-APPROVED: Stub ohne Datei nicht zuweisbar', route.includes('keine abspielbare Datei'))
}

console.log(fehler === 0 ? '\nAlle Baustein-C-Tests grün.' : `\n${fehler} Test(s) rot.`)
process.exit(fehler === 0 ? 0 : 1)
