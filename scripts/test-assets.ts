/**
 * MVP-Finish §3 DoD — Unit-Tests für das Asset-Slot-System (ohne DB).
 *
 *   npm run test:assets
 *
 * Prüft: Slot-Schema-Gate, Determinismus von assignAssets, keine
 * Duplikate, Paar-Kopplung (nie ein halbes Paar), harter Fail bei
 * leerer Bank (Pflicht-Slot), Aspect-±5%- und min_width-Filter,
 * Style-Tag-Ranking, Flagship-Deklarationen.
 */

import { validiereAssetSlots, aspectZahl, type AssetSlots } from '../lib/assets/slots'
import { assignAssetsAusKandidaten } from '../lib/assets/assign'
import type { ApprovedAsset } from '../lib/assets/repository'
import { FLAGSHIP_ASSET_SLOTS } from '../lib/flagship/asset-slots'
import { baueSeedPrompt, altTextVorlage } from '../config/asset-styles'

let geprueft = 0
let fehler = 0

function assert(bedingung: boolean, name: string, meldung?: string) {
  geprueft++
  if (bedingung) {
    console.log(`  ✓ ${name}`)
  } else {
    fehler++
    console.error(`  ✗ ${name}${meldung ? ` — ${meldung}` : ''}`)
  }
}

function wirft(fn: () => unknown, name: string, erwartet?: string) {
  geprueft++
  try {
    fn()
    fehler++
    console.error(`  ✗ ${name} — hat NICHT geworfen`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (erwartet && !msg.includes(erwartet)) {
      fehler++
      console.error(`  ✗ ${name} — falsche Meldung: "${msg}" (erwartet: "${erwartet}")`)
    } else {
      console.log(`  ✓ ${name}`)
    }
  }
}

/** Test-Asset-Fabrik */
let laufNr = 0
function asset(teil: Partial<ApprovedAsset>): ApprovedAsset {
  laufNr++
  return {
    id: teil.id ?? `asset-${laufNr}`,
    storage_path: `test/${laufNr}.webp`,
    szene_typ: 'hero',
    branchen: ['maler'],
    style_tags: [],
    pair_id: null,
    breite: 1600,
    hoehe: 900,
    aspect_ratio: '16:9',
    alt_text_de: null,
    quelle: 'ai_higgsfield',
    created_at: '2026-07-20T00:00:00Z',
    ...teil,
  }
}

// ————— §3.1 Slot-Schema —————
console.log('\n§3.1 Slot-Schema (Zod-Gate)')

assert(aspectZahl('16:9') !== null && Math.abs((aspectZahl('16:9') as number) - 16 / 9) < 1e-9, 'aspectZahl 16:9')
assert(aspectZahl('kaputt') === null, 'aspectZahl invalid ⇒ null')

const gueltig = validiereAssetSlots('test', {
  hero_img: { scene_typ: 'hero', aspect: '16:9', min_width: 1600 },
})
assert(gueltig.hero_img.scene_typ === 'hero', 'gültige Deklaration parst')

wirft(() => validiereAssetSlots('test', { HeroImg: { scene_typ: 'hero', aspect: '16:9' } }), 'CamelCase-Key wird abgelehnt (snake_case)')
wirft(() => validiereAssetSlots('test', { a: { scene_typ: 'quatsch', aspect: '16:9' } }), 'unbekannter scene_typ wird abgelehnt')
wirft(() => validiereAssetSlots('test', { a: { scene_typ: 'vorher', aspect: '16:9', pair_with: 'fehlt' } }), 'pair_with auf nicht-existenten Slot', 'existiert nicht')
wirft(
  () =>
    validiereAssetSlots('test', {
      a: { scene_typ: 'hero', aspect: '16:9', pair_with: 'b' },
      b: { scene_typ: 'nachher', aspect: '16:9' },
    }),
  'pair_with nur vorher→nachher',
  'vorher→nachher'
)
wirft(
  () =>
    validiereAssetSlots('test', {
      a: { scene_typ: 'vorher', aspect: '4:3', pair_with: 'b' },
      b: { scene_typ: 'nachher', aspect: '16:9' },
    }),
  'Paar-Slots brauchen dasselbe aspect',
  'dasselbe aspect'
)

// Flagship-Deklarationen sind beim Modul-Load validiert worden (Import oben)
assert(Object.keys(FLAGSHIP_ASSET_SLOTS).length >= 4, 'Flagship-Sektionen deklariert (Registrierungs-Gate geladen)')
assert(FLAGSHIP_ASSET_SLOTS.signature.sig_vorher.pair_with === 'sig_nachher', 'signature: vorher→nachher gekoppelt')

// ————— §3.3 assignAssets: Determinismus —————
console.log('\n§3.3 Determinismus (Seed = siteId)')

const heroSlots: AssetSlots = validiereAssetSlots('t', {
  hero_img: { scene_typ: 'hero', aspect: '16:9', min_width: 1600 },
})
const heroBank = Array.from({ length: 8 }, (_, i) => asset({ id: `hero-${i}` }))

const lauf1 = assignAssetsAusKandidaten('site-a', 'maler', [], heroSlots, heroBank)
const lauf2 = assignAssetsAusKandidaten('site-a', 'maler', [], heroSlots, heroBank)
assert(lauf1.zuweisung.hero_img.id === lauf2.zuweisung.hero_img.id, 'gleiche Site ⇒ gleiches Bild')

const gemischt = [...heroBank].reverse()
const lauf3 = assignAssetsAusKandidaten('site-a', 'maler', [], heroSlots, gemischt)
assert(lauf1.zuweisung.hero_img.id === lauf3.zuweisung.hero_img.id, 'unabhängig von Kandidaten-Reihenfolge')

const andereSites = ['site-b', 'site-c', 'site-d', 'site-e', 'site-f']
const andereWahl = andereSites.map((s) => assignAssetsAusKandidaten(s, 'maler', [], heroSlots, heroBank).zuweisung.hero_img.id)
assert(new Set([lauf1.zuweisung.hero_img.id, ...andereWahl]).size > 1, 'verschiedene Sites ⇒ Streuung über die Bank')

// ————— §3.3 Keine Duplikate —————
console.log('\n§3.3 Keine Duplikate pro Seite')

const galerieSlots = validiereAssetSlots('t', {
  galerie_1: { scene_typ: 'galerie', aspect: '4:3' },
  galerie_2: { scene_typ: 'galerie', aspect: '4:3' },
  galerie_3: { scene_typ: 'galerie', aspect: '4:3' },
})
const galerieBank = Array.from({ length: 5 }, (_, i) =>
  asset({ id: `gal-${i}`, szene_typ: 'galerie', breite: 1600, hoehe: 1200, aspect_ratio: '4:3' })
)
const galerieLauf = assignAssetsAusKandidaten('site-a', 'maler', [], galerieSlots, galerieBank)
const galerieIds = Object.values(galerieLauf.zuweisung).map((a) => a.id)
assert(new Set(galerieIds).size === 3, 'drei Slots ⇒ drei verschiedene Assets')

// ————— §3.3 Paar-Kopplung —————
console.log('\n§3.3 Paar-Kopplung (pair_id, nie ein halbes Paar)')

const paarSlots = validiereAssetSlots('t', {
  sig_nachher: { scene_typ: 'nachher', aspect: '16:9', pflicht: false },
  sig_vorher: { scene_typ: 'vorher', aspect: '16:9', pair_with: 'sig_nachher', pflicht: false },
})
const paarBank = [
  asset({ id: 'n1', szene_typ: 'nachher', pair_id: 'p1' }),
  asset({ id: 'v1', szene_typ: 'vorher', pair_id: 'p1' }),
  asset({ id: 'n2', szene_typ: 'nachher', pair_id: 'p2' }),
  asset({ id: 'v2', szene_typ: 'vorher', pair_id: 'p2' }),
]
const paarLauf = assignAssetsAusKandidaten('site-a', 'maler', [], paarSlots, paarBank)
assert(
  paarLauf.zuweisung.sig_nachher.pair_id === paarLauf.zuweisung.sig_vorher.pair_id,
  'beide Hälften aus demselben Paar (pair_id)'
)

// Halbes Paar in der Bank (vorher fehlt) ⇒ Sektion ausblenden, nie halb zuweisen
const halbeBank = [asset({ id: 'n-solo', szene_typ: 'nachher', pair_id: 'p-solo' })]
const halbLauf = assignAssetsAusKandidaten('site-a', 'maler', [], paarSlots, halbeBank)
assert(Object.keys(halbLauf.zuweisung).length === 0, 'halbes Paar ⇒ KEINE Zuweisung')
assert(
  halbLauf.ausgeblendet.includes('sig_nachher') && halbLauf.ausgeblendet.includes('sig_vorher'),
  'halbes Paar ⇒ beide Slots ausgeblendet'
)

// Loses vorher+nachher OHNE pair_id ⇒ zählt nicht als Paar
const loseBank = [
  asset({ id: 'n-lose', szene_typ: 'nachher', pair_id: null }),
  asset({ id: 'v-lose', szene_typ: 'vorher', pair_id: null }),
]
const loseLauf = assignAssetsAusKandidaten('site-a', 'maler', [], paarSlots, loseBank)
assert(Object.keys(loseLauf.zuweisung).length === 0, 'ohne pair_id ⇒ kein Paar (IMMER über pair_id)')

// ————— §3.3 Harter Fail bei leerer Bank —————
console.log('\n§3.3 Pflicht-Slot ⇒ harter Fail (nie Platzhalter)')

wirft(
  () => assignAssetsAusKandidaten('site-a', 'maler', [], heroSlots, []),
  'leere Bank + Pflicht-Slot wirft [C-APPROVED]',
  'asset_bank: kein approved hero/16:9 für branche=maler'
)
const optionalSlots = validiereAssetSlots('t', {
  galerie_1: { scene_typ: 'galerie', aspect: '4:3', pflicht: false },
})
const leerLauf = assignAssetsAusKandidaten('site-a', 'maler', [], optionalSlots, [])
assert(leerLauf.ausgeblendet.includes('galerie_1'), 'pflicht:false ⇒ ausgeblendet statt Fehler')

// ————— §3.3 Aspect- und min_width-Filter —————
console.log('\n§3.3 Aspect ±5 % und min_width')

const filterBank = [
  asset({ id: 'zu-schmal', breite: 1200, hoehe: 675 }), // 16:9, aber < 1600
  asset({ id: 'falsches-aspect', breite: 1600, hoehe: 1200, aspect_ratio: '4:3' }), // 4:3
  asset({ id: 'leicht-daneben', breite: 1600, hoehe: 930 }), // ~1.72 → 3,2 % Abweichung, ok
  asset({ id: 'stark-daneben', breite: 1600, hoehe: 1000 }), // 1.6 → 10 % Abweichung
]
const filterLauf = assignAssetsAusKandidaten('site-a', 'maler', [], heroSlots, filterBank)
assert(filterLauf.zuweisung.hero_img.id === 'leicht-daneben', 'nur ±5 %-Aspect + min_width passiert den Filter')

const ohneMasse = [asset({ id: 'nur-ratio', breite: null, hoehe: null, aspect_ratio: '16:9', })]
const ohneMasseSlots = validiereAssetSlots('t', { hero_img: { scene_typ: 'hero', aspect: '16:9' } })
const ohneMasseLauf = assignAssetsAusKandidaten('site-a', 'maler', [], ohneMasseSlots, ohneMasse)
assert(ohneMasseLauf.zuweisung.hero_img.id === 'nur-ratio', 'ohne Maße zählt deklariertes aspect_ratio')

// ————— §3.3 Style-Tag-Ranking —————
console.log('\n§3.3 Style-Tag-Ranking')

const styleBank = [
  asset({ id: 'ohne-tags', style_tags: [] }),
  asset({ id: 'mit-tags', style_tags: ['hell', 'clean'] }),
]
for (const site of ['s1', 's2', 's3', 's4']) {
  const wahl = assignAssetsAusKandidaten(site, 'maler', ['hell', 'clean'], heroSlots, styleBank)
  assert(wahl.zuweisung.hero_img.id === 'mit-tags', `Style-Treffer schlägt RNG (Seed ${site})`)
}

// ————— §3.4 Prompt-Baukasten —————
console.log('\n§3.4 Style-Prompt-Baukasten')

const prompt = baueSeedPrompt('maler', 'hero')
assert(prompt.includes('no logos'), 'Negativ: keine Logos/Marken')
assert(prompt.includes('no text'), 'Negativ: kein Text im Bild')
assert(prompt.includes('faces'), 'Negativ: keine Gesichter nah')
assert(prompt.includes('Lighting:') && prompt.includes('Camera:'), 'Baukasten-Module (Licht/Kamera) enthalten')
const fremd = baueSeedPrompt('schluesseldienst', 'galerie')
assert(fremd.includes('no logos'), 'Fallback-Stil hat dieselben Negativ-Regeln')
assert(altTextVorlage('Maler', 'hero').includes('Maler'), 'Alt-Text-Vorlage ist deutsch + branchenbezogen')

// ————— Ergebnis —————
console.log(`\n${geprueft} Checks, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
console.log('test-assets: alles grün ✓\n')
