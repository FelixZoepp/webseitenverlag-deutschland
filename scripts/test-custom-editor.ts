/**
 * Selbsttest Chat-Editor für Custom-HTML-Sites (lib/custom-html-editor.ts).
 *   npx tsx scripts/test-custom-editor.ts
 */
import { extrahiereFelder, applyCustomPatch, istCustomConfig, type CustomConfig } from '../lib/custom-html-editor'
import type { AufgeloestesBild } from '../lib/editor-ops'

let fehler = 0
let geprueft = 0
function assert(bedingung: boolean, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ ${meldung}`)
  }
}

const html = `<!DOCTYPE html><html><body>
<div class="hero-bild" data-edit-bild="hero" style="background:url('https://x/alt.webp') center/cover"></div>
<h1><span data-edit="hero_titel">Pflege mit Herz.</span> <em data-edit="hero_titel2">Zuhause versorgt.</em></h1>
<p data-edit="hero_lead">Grundpflege &amp; Betreuung<br>direkt zuhause.</p>
<div data-edit="verschachtelt"><div>innen</div> außen</div>
<img data-edit-bild="leistung_grund" src="https://x/grund.webp" alt="">
<a href="tel:+49160">  <span data-edit="telefon">0160 3860497</span></a>
<footer><span data-edit="hero_titel">Pflege mit Herz.</span></footer>
</body></html>`
const config: CustomConfig = { engine: 'custom', html, pages: { impressum: '<p data-edit="imp_text">Alt</p>' } }

assert(istCustomConfig(config), 'istCustomConfig erkennt Custom-Config')
assert(!istCustomConfig({ engine: 'flagship' }), 'istCustomConfig lehnt Flagship ab')

const felder = extrahiereFelder(config)
assert(felder.texte.hero_titel === 'Pflege mit Herz.', 'Text extrahiert')
assert(felder.texte.hero_lead === 'Grundpflege & Betreuung\ndirekt zuhause.', `Entities + <br> → \\n (${JSON.stringify(felder.texte.hero_lead)})`)
assert(felder.texte.verschachtelt === 'innen außen', `verschachteltes div korrekt geschlossen (${JSON.stringify(felder.texte.verschachtelt)})`)
assert(felder.texte.imp_text === 'Alt', 'Felder aus Unterseiten')
assert(felder.bilder.hero === 'https://x/alt.webp', 'Hintergrundbild extrahiert')
assert(felder.bilder.leistung_grund === 'https://x/grund.webp', 'img src extrahiert')

// Text ändern — alle Vorkommen, escaped
let r = applyCustomPatch(config, [{ op: 'update_text', pfad: 'texte.hero_titel', wert: 'Neu <script>alert(1)</script>\nZeile 2' }])
assert(r.ok, 'update_text ok')
if (r.ok) {
  assert(!r.config.html.includes('<script>alert'), 'kein rohes Markup aus dem Modell')
  assert((r.config.html.match(/Neu &lt;script&gt;alert\(1\)&lt;\/script&gt;<br>Zeile 2/g) || []).length === 2, 'beide Vorkommen ersetzt, \\n → <br>')
  assert(r.config.html.includes('<em data-edit="hero_titel2">Zuhause versorgt.</em>'), 'Nachbarfeld unverändert')
  assert(config.html.includes('<span data-edit="hero_titel">Pflege mit Herz.</span>'), 'Original-Config nicht mutiert')
}

// Unterseite
r = applyCustomPatch(config, [{ op: 'update_text', pfad: 'texte.imp_text', wert: 'Neu' }])
assert(r.ok && r.config.pages!.impressum === '<p data-edit="imp_text">Neu</p>', 'Unterseiten-Feld geändert')

// Bild tauschen (img + background)
const bank = new Map<string, AufgeloestesBild>([
  ['11111111-1111-4111-8111-111111111111', { url: 'https://x/neu.webp', szeneTyp: 'hero', quelle: 'kunde' }],
])
r = applyCustomPatch(config, [
  { op: 'swap_image_from_bank', pfad: 'bilder.hero', assetId: '11111111-1111-4111-8111-111111111111' },
  { op: 'swap_image_from_bank', pfad: 'bilder.leistung_grund', assetId: '11111111-1111-4111-8111-111111111111' },
], bank)
assert(r.ok, 'swap ok')
if (r.ok) {
  assert(r.config.html.includes("url('https://x/neu.webp') center/cover"), 'Hintergrundbild getauscht')
  assert(r.config.html.includes('data-edit-bild="leistung_grund" src="https://x/neu.webp"'), 'img src getauscht')
}

// Abweisungen — gesamter Patch verworfen
r = applyCustomPatch(config, [
  { op: 'update_text', pfad: 'texte.hero_lead', wert: 'ok' },
  { op: 'update_text', pfad: 'texte.telefon', wert: '0000' },
])
assert(!r.ok, 'Telefon gesperrt → ganzer Patch abgewiesen')
r = applyCustomPatch(config, [{ op: 'update_text', pfad: 'texte.gibtsnicht', wert: 'x' }])
assert(!r.ok, 'unbekanntes Feld abgewiesen')
r = applyCustomPatch(config, [{ op: 'update_text', pfad: 'businessName', wert: 'x' }])
assert(!r.ok, 'Template-Pfad abgewiesen')
r = applyCustomPatch(config, [{ op: 'update_text', pfad: 'texte.hero_lead', wert: '   ' }])
assert(!r.ok, 'leerer Text abgewiesen')
r = applyCustomPatch(config, [{ op: 'set_theme_preset', preset: 'klar-blau' }])
assert(!r.ok, 'Theme-Preset bei Custom abgewiesen')
r = applyCustomPatch(config, [{ op: 'swap_image_from_bank', pfad: 'bilder.hero', assetId: '22222222-2222-4222-8222-222222222222' }], bank)
assert(!r.ok, 'fremde Asset-ID abgewiesen')

console.log(`${geprueft - fehler}/${geprueft} ${fehler === 0 ? '✅' : '❌'}`)
process.exit(fehler === 0 ? 0 : 1)
