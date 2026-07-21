/**
 * Test Phase 4 — Kundenportal & Chat-Editor härten (MVP_FINISH_PROMPT §5).
 * Läuft komplett offline (keine API-/DB-Aufrufe).
 *
 * Teil A — Patch-Ops: nur die 6 erlaubten Ops, swap_image_from_bank
 *          per Asset-ID gegen die vorab aufgelöste Bank-Menge.
 * Teil B — Bild-Leitplanken: unbekannte IDs, Szene-Kompatibilität
 *          (Hero nur Hero), All-or-Nothing.
 * Teil C — Gesperrte Kern-Sektionen: Telefon, Rechtstexte, Hero-Toggle.
 * Teil D — Aspekt-Prüfung: kompatible Slots + zentrierter Auto-Crop.
 * Teil E — Rechtstexte: Schema-Validierung + Generator nutzt die
 *          Config-Vorlagen (Impressum § 5 DDG, Datenschutz DSGVO).
 * Teil F — Prompt-Vertrag: Bild-Liste + Begründungs-Regel im Ops-Prompt.
 *
 * Aufruf: npm run test:phase4
 */
import {
  PatchSchema,
  applyPatch,
  getOpsPrompt,
  formatiereBildListe,
  erlaubteSzenenFuerPfad,
  type AufgeloestesBild,
} from '../lib/editor-ops'
import { pruefeAspekt, zentrierterCrop, SLOT_ASPEKTE } from '../lib/assets/aspekt'
import { PflichtangabenSchema, generiereImpressum, generiereDatenschutz } from '../lib/rechtstexte'
import { IMPRESSUM_VORLAGE, DATENSCHUTZ_VORLAGE } from '../config/rechtstexte-vorlagen'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

const HERO_ID = '11111111-1111-4111-8111-111111111111'
const GALERIE_ID = '22222222-2222-4222-8222-222222222222'
const KUNDE_ID = '44444444-4444-4444-8444-444444444444'

const bilder = new Map<string, AufgeloestesBild>([
  [HERO_ID, { url: 'https://cdn.test.supabase.co/asset-bank/hero.webp', szeneTyp: 'hero', quelle: 'higgsfield' }],
  [GALERIE_ID, { url: 'https://cdn.test.supabase.co/asset-bank/galerie.webp', szeneTyp: 'galerie', quelle: 'higgsfield' }],
  [KUNDE_ID, { url: 'https://cdn.test.supabase.co/kundenbilder/team.webp', szeneTyp: 'team', quelle: 'kunde' }],
])

const config: Record<string, unknown> = {
  headline: 'Alte Überschrift',
  phone: '030 123456',
  heroImageUrl: 'https://alt.example/hero.jpg',
  ownerImageUrl: 'https://alt.example/owner.jpg',
  galleryImages: ['https://alt.example/g1.jpg', 'https://alt.example/g2.jpg'],
  rechtstexte: { impressum: 'alt', datenschutz: 'alt' },
  sections: [
    { id: 'sek-hero', type: 'hero', title: 'Hero', visible: true, order: 1 },
    { id: 'sek-leist', type: 'leistungen', title: 'Leistungen', visible: true, order: 2 },
  ],
}

// ---------------------------------------------------------------------------
// Teil A — Patch-Ops-Schema
// ---------------------------------------------------------------------------
console.log('Teil A: Patch-Ops-Schema')

assert(
  PatchSchema.safeParse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: HERO_ID }]).success,
  'schema-swap-ok', 'swap_image_from_bank mit UUID muss Zod passieren'
)
assert(
  !PatchSchema.safeParse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: 'keine-uuid' }]).success,
  'schema-swap-uuid', 'assetId muss eine UUID sein'
)
assert(
  !PatchSchema.safeParse([{ op: 'swap_image_from_pool_or_upload', pfad: 'heroImageUrl', url: 'https://x.de/a.jpg' }]).success,
  'schema-alter-op', 'Der alte URL-basierte Bild-Op darf nicht mehr existieren'
)
assert(
  !PatchSchema.safeParse([{ op: 'inject_html', html: '<b>x</b>' }]).success,
  'schema-roh-html', 'Roh-HTML-Ops müssen abgewiesen werden'
)

// ---------------------------------------------------------------------------
// Teil B — Bild-Leitplanken (applyPatch mit aufgelöster Bank-Menge)
// ---------------------------------------------------------------------------
console.log('Teil B: Bild-Leitplanken')

{
  const p = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: HERO_ID }])
  const r = applyPatch(config, p, bilder)
  assert(r.ok, 'bild-hero-ok', 'Hero-Asset auf Hero-Pfad muss durchgehen')
  assert(
    r.ok && (r.config as Record<string, unknown>).heroImageUrl === 'https://cdn.test.supabase.co/asset-bank/hero.webp',
    'bild-url-gesetzt', 'Die aufgelöste Bank-URL muss im Config landen'
  )
  assert(config.heroImageUrl === 'https://alt.example/hero.jpg', 'bild-immutabel', 'Original-Config darf sich nicht ändern')
}
{
  const p = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: '33333333-3333-4333-8333-333333333333' }])
  const r = applyPatch(config, p, bilder)
  assert(!r.ok, 'bild-unbekannt', 'Unbekannte Asset-ID muss abgewiesen werden')
  assert(
    !r.ok && r.fehler.some((f) => f.includes('nicht zur Verfügung')),
    'bild-unbekannt-meldung', 'Abweisung muss verständlich formuliert sein'
  )
}
{
  const p = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: GALERIE_ID }])
  assert(!applyPatch(config, p, bilder).ok, 'bild-szene-hero', 'Galerie-Asset darf NICHT auf den Hero-Pfad')
}
{
  const p = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'galleryImages.0', assetId: GALERIE_ID }])
  assert(applyPatch(config, p, bilder).ok, 'bild-galerie-ok', 'Galerie-Asset auf Galerie-Pfad muss durchgehen')
}
{
  const p = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'ownerImageUrl', assetId: KUNDE_ID }])
  assert(applyPatch(config, p, bilder).ok, 'bild-kunde-team', 'Kunden-Upload (team) muss auf ownerImageUrl erlaubt sein')
}
{
  // Ohne Bild-Map darf KEIN Swap möglich sein
  const p = PatchSchema.parse([{ op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: HERO_ID }])
  assert(!applyPatch(config, p).ok, 'bild-ohne-map', 'Ohne aufgelöste Bank-Menge muss jeder Swap scheitern')
}
{
  // All-or-Nothing: 1 gültiger Text-Op + 1 ungültiger Bild-Op ⇒ nichts wird angewendet
  const p = PatchSchema.parse([
    { op: 'update_text', pfad: 'headline', wert: 'Neu' },
    { op: 'swap_image_from_bank', pfad: 'heroImageUrl', assetId: GALERIE_ID },
  ])
  assert(!applyPatch(config, p, bilder).ok, 'bild-atomar', 'Misch-Patch mit ungültigem Bild-Op muss KOMPLETT abgewiesen werden')
}

assert(
  JSON.stringify(erlaubteSzenenFuerPfad('heroImageUrl')) === JSON.stringify(['hero']),
  'szene-hero-pfad', 'Hero-Pfade verlangen Szene hero'
)
assert(erlaubteSzenenFuerPfad('galleryImages.2') === null, 'szene-galerie-frei', 'Galerie-Pfade sind szene-offen')

// ---------------------------------------------------------------------------
// Teil C — Gesperrte Kern-Sektionen
// ---------------------------------------------------------------------------
console.log('Teil C: Gesperrte Kern-Sektionen')

{
  const p = PatchSchema.parse([{ op: 'update_text', pfad: 'phone', wert: '0900 1' }])
  assert(!applyPatch(config, p).ok, 'sperre-telefon', 'Telefon-Pfad muss gesperrt sein')
}
{
  const p = PatchSchema.parse([{ op: 'update_text', pfad: 'rechtstexte.impressum', wert: 'Mein Impressum' }])
  assert(!applyPatch(config, p).ok, 'sperre-rechtstexte', 'Rechtstexte dürfen nicht frei editierbar sein')
}
{
  const p = PatchSchema.parse([{ op: 'toggle', sectionId: 'sek-hero', sichtbar: false }])
  assert(!applyPatch(config, p).ok, 'sperre-hero-toggle', 'Hero darf nicht ausgeblendet werden')
}

// ---------------------------------------------------------------------------
// Teil D — Aspekt-Prüfung + Auto-Crop
// ---------------------------------------------------------------------------
console.log('Teil D: Aspekt-Prüfung')

{
  const a = pruefeAspekt(1920, 1080) // exakt 16:9
  assert(a.kompatibleSlots.includes('hero'), 'aspekt-hero-16-9', '1920×1080 muss hero-kompatibel sein')
  assert(a.aspectRatio === '16:9', 'aspekt-ratio-name', '1920×1080 muss als 16:9 erkannt werden')
  assert(!a.kompatibleSlots.includes('team'), 'aspekt-kein-team', '16:9 ist kein Porträt-Slot (1:1 ± 35 %)')
  const teamCrop = a.cropVorschlaege.find((c) => c.slot === 'team')
  assert(!!teamCrop, 'aspekt-crop-vorhanden', 'Für team muss ein Auto-Crop-Vorschlag existieren')
  assert(
    !!teamCrop && teamCrop.crop.width === 1080 && teamCrop.crop.height === 1080 && teamCrop.crop.left === 420,
    'aspekt-crop-zentriert', 'Crop 16:9→1:1 muss zentriert 1080×1080 bei left=420 sein'
  )
}
{
  const a = pruefeAspekt(1000, 1000) // quadratisch
  assert(a.kompatibleSlots.includes('team'), 'aspekt-team-1-1', '1:1 muss team-kompatibel sein')
  assert(!a.kompatibleSlots.includes('hero'), 'aspekt-1-1-kein-hero', '1:1 darf nicht hero-kompatibel sein (16:9 ± 20 %)')
}
{
  const c = zentrierterCrop(1000, 3000, 16 / 9) // zu hoch → oben/unten beschneiden
  assert(c.width === 1000 && c.height === Math.round(1000 / (16 / 9)) && c.left === 0, 'crop-zu-hoch', 'Hochformat→16:9 muss oben/unten beschneiden')
}
assert(SLOT_ASPEKTE.length >= 4, 'aspekt-config', 'Slot-Familien müssen als Config vorliegen (hero/galerie/detail/team)')

// ---------------------------------------------------------------------------
// Teil E — Rechtstexte (Schema + Config-Vorlagen)
// ---------------------------------------------------------------------------
console.log('Teil E: Rechtstexte')

const angaben = PflichtangabenSchema.parse({
  firmenname: 'Müller & Söhne',
  rechtsform: 'GmbH',
  inhaber: 'Hans Müller',
  strasse: 'Hauptstraße 1',
  plz: '10115',
  ort: 'Berlin',
  telefon: '030 1234567',
  email: 'info@mueller.de',
  ust_id: 'DE123456789',
})

assert(
  !PflichtangabenSchema.safeParse({ ...angaben, plz: '1234' }).success,
  'recht-plz', 'PLZ mit 4 Ziffern muss abgewiesen werden'
)
assert(
  !PflichtangabenSchema.safeParse({ ...angaben, email: 'keine-mail' }).success,
  'recht-email', 'Ungültige E-Mail muss abgewiesen werden'
)

{
  const imp = generiereImpressum(angaben)
  assert(imp.includes(IMPRESSUM_VORLAGE.ueberschrift), 'recht-imp-vorlage', 'Impressum muss die Config-Vorlage (§ 5 DDG) nutzen')
  assert(imp.includes('Müller & Söhne GmbH'), 'recht-imp-name', 'Firmenname + Rechtsform müssen eingesetzt werden')
  assert(imp.includes('DE123456789'), 'recht-imp-ustid', 'USt-ID muss erscheinen, wenn angegeben')
  assert(imp.includes(IMPRESSUM_VORLAGE.odrHinweis), 'recht-imp-odr', 'ODR-Hinweis aus der Vorlage muss enthalten sein')
}
{
  const ds = generiereDatenschutz(angaben)
  assert(ds.startsWith(DATENSCHUTZ_VORLAGE.titel), 'recht-ds-titel', 'Datenschutz muss mit dem Vorlagen-Titel beginnen')
  assert(ds.includes(DATENSCHUTZ_VORLAGE.hostingText), 'recht-ds-hosting', 'Hosting-Baustein muss aus der Config-Vorlage kommen')
  assert(ds.includes('Hans Müller'), 'recht-ds-verantwortlich', 'Verantwortlicher muss eingesetzt werden')
}

// ---------------------------------------------------------------------------
// Teil F — Prompt-Vertrag
// ---------------------------------------------------------------------------
console.log('Teil F: Prompt-Vertrag')

{
  const liste = formatiereBildListe([
    { id: HERO_ID, szene_typ: 'hero', quelle: 'higgsfield', alt_text_de: 'Baustelle' },
    { id: KUNDE_ID, szene_typ: 'team', quelle: 'kunde', alt_text_de: null },
  ])
  assert(liste.includes(HERO_ID), 'prompt-liste-id', 'Bild-Liste muss Asset-IDs enthalten')
  assert(liste.includes('eigenes Kundenbild'), 'prompt-liste-kunde', 'Kunden-Uploads müssen als solche markiert sein')

  const prompt = getOpsPrompt(liste)
  assert(prompt.includes('swap_image_from_bank'), 'prompt-op-name', 'Prompt muss den Bank-Op beschreiben')
  assert(!prompt.includes('swap_image_from_pool_or_upload'), 'prompt-alter-op', 'Alter Op-Name darf im Prompt nicht mehr vorkommen')
  assert(prompt.includes('VERFÜGBARE BILDER'), 'prompt-bilder-sektion', 'Prompt muss die verfügbaren Bilder auflisten')
  assert(prompt.includes('GESPERRTE BEREICHE'), 'prompt-sperr-regel', 'Prompt muss die Begründen-statt-Ausführen-Regel enthalten')
  assert(prompt.includes('ALTERNATIVE'), 'prompt-alternative', 'Prompt muss eine Alternative bei gesperrten Wünschen verlangen')
}
{
  const leer = formatiereBildListe([])
  assert(leer.includes('Upload'), 'prompt-leer', 'Leere Bild-Liste muss auf den Upload verweisen')
}

// ---------------------------------------------------------------------------
console.log(`\n${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) {
  console.error('PHASE-4-TEST FEHLGESCHLAGEN')
  process.exit(1)
}
console.log('ALLE PHASE-4-TESTS BESTANDEN')
