/**
 * Chat-Editor für Custom-HTML-Sites (engine 'custom', z. B. nach Kunden-PDF
 * gebaute Seiten).
 *
 * Auch hier gilt §10.2: Das Modell schreibt NIE rohes HTML. Bearbeitbar sind
 * ausschließlich Elemente, die beim Bau markiert wurden:
 *   data-edit="schluessel"       → reiner Text (Zeilenumbruch = <br>)
 *   data-edit-bild="schluessel"  → Bild (<img src> bzw. url(...) im style)
 * Der Chat sieht diese Felder als `texte.<schluessel>` / `bilder.<schluessel>`
 * und nutzt die bekannten Ops update_text / swap_image_from_bank. Werte
 * werden escaped eingesetzt — Markup aus dem Modell kann nie ins HTML.
 */
import type { PatchOp, AufgeloestesBild } from '@/lib/editor-ops'
import { pruefePlanRecht } from '@/lib/editor-ops'

export interface CustomConfig {
  engine: 'custom'
  html: string
  pages?: Record<string, string>
  [key: string]: unknown
}

export function istCustomConfig(config: unknown): config is CustomConfig {
  return (
    !!config &&
    typeof config === 'object' &&
    (config as { engine?: unknown }).engine === 'custom' &&
    typeof (config as { html?: unknown }).html === 'string'
  )
}

const SCHLUESSEL = /^[a-z][a-z0-9_-]{0,60}$/

/** Tags ohne schließendes Gegenstück — werden beim Tiefenzählen ignoriert. */
const VOID_TAGS = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'col', 'embed', 'track'])

interface Fundstelle {
  /** Index direkt hinter dem öffnenden Tag */
  innenStart: number
  /** Index des schließenden Tags */
  innenEnde: number
  oeffnendesTag: string
  tagStart: number
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
}

/** Findet das Element mit attr="schluessel" inkl. passendem schließendem Tag. */
function findeElement(html: string, attr: string, schluessel: string): Fundstelle | null {
  const re = new RegExp(`<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*\\s${attr}="${schluessel}"[^>]*>`, 'g')
  const m = re.exec(html)
  if (!m) return null
  const tag = m[1].toLowerCase()
  const tagStart = m.index
  const innenStart = m.index + m[0].length
  if (VOID_TAGS.has(tag)) return { innenStart, innenEnde: innenStart, oeffnendesTag: m[0], tagStart }

  const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi')
  tagRe.lastIndex = innenStart
  let tiefe = 1
  let t: RegExpExecArray | null
  while ((t = tagRe.exec(html))) {
    tiefe += t[1] === '/' ? -1 : 1
    if (tiefe === 0) return { innenStart, innenEnde: t.index, oeffnendesTag: m[0], tagStart }
  }
  return null
}

function alleSchluessel(html: string, attr: string): string[] {
  const re = new RegExp(`\\s${attr}="([^"]+)"`, 'g')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) if (SCHLUESSEL.test(m[1]) && !out.includes(m[1])) out.push(m[1])
  return out
}

function innenZuText(innen: string): string {
  return decodeEntities(
    innen
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim()
  )
}

function bildUrlAus(oeffnendesTag: string): string | null {
  const src = oeffnendesTag.match(/\ssrc="([^"]*)"/)
  if (src) return src[1]
  const bg = oeffnendesTag.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/)
  return bg ? bg[1] : null
}

/** Alle Seiten der Config: '' = Startseite, sonst Unterseiten-Slug. */
function seiten(config: CustomConfig): [string, string][] {
  const liste: [string, string][] = [['', config.html]]
  for (const [slug, html] of Object.entries(config.pages || {})) {
    if (typeof html === 'string') liste.push([slug, html])
  }
  return liste
}

export interface CustomFelder {
  texte: Record<string, string>
  bilder: Record<string, string>
}

export function extrahiereFelder(config: CustomConfig): CustomFelder {
  const texte: Record<string, string> = {}
  const bilder: Record<string, string> = {}
  for (const [, html] of seiten(config)) {
    for (const k of alleSchluessel(html, 'data-edit')) {
      if (k in texte) continue
      const f = findeElement(html, 'data-edit', k)
      if (f) texte[k] = innenZuText(html.slice(f.innenStart, f.innenEnde))
    }
    for (const k of alleSchluessel(html, 'data-edit-bild')) {
      if (k in bilder) continue
      const f = findeElement(html, 'data-edit-bild', k)
      const url = f && bildUrlAus(f.oeffnendesTag)
      if (url) bilder[k] = url
    }
  }
  return { texte, bilder }
}

/** Ersetzt den Inhalt ALLER Vorkommen von data-edit="k" (Text bleibt seitenweit konsistent). */
function setzeTextInHtml(html: string, k: string, wert: string): { html: string; treffer: number } {
  let treffer = 0
  let rest = html
  let out = ''
  for (;;) {
    const f = findeElement(rest, 'data-edit', k)
    if (!f) break
    treffer++
    const neuInnen = escapeHtml(wert).replace(/\r?\n/g, '<br>')
    out += rest.slice(0, f.innenStart) + neuInnen
    rest = rest.slice(f.innenEnde)
  }
  return { html: out + rest, treffer }
}

function setzeBildInHtml(html: string, k: string, url: string): { html: string; treffer: number } {
  let treffer = 0
  let rest = html
  let out = ''
  for (;;) {
    const f = findeElement(rest, 'data-edit-bild', k)
    if (!f) break
    treffer++
    const sicher = escapeHtml(url)
    let tag = f.oeffnendesTag
    if (/\ssrc="[^"]*"/.test(tag)) tag = tag.replace(/(\ssrc=")[^"]*(")/, `$1${sicher}$2`)
    else tag = tag.replace(/url\(\s*['"]?[^'")]+['"]?\s*\)/, `url('${sicher}')`)
    out += rest.slice(0, f.tagStart) + tag
    rest = rest.slice(f.tagStart + f.oeffnendesTag.length)
  }
  return { html: out + rest, treffer }
}

const MAX_TEXT = 1200
const TELEFON = /(^|[_-])(telefon|phone|tel|handy|mobil)([_-]|$)/

type Ergebnis = { ok: true; config: CustomConfig } | { ok: false; fehler: string[] }

/**
 * Wendet einen bereits Zod-validierten Patch auf eine Kopie der Custom-Config
 * an. Ein Fehler weist den gesamten Patch ab (wie applyPatch).
 */
export function applyCustomPatch(
  config: CustomConfig,
  ops: PatchOp[],
  bilder?: Map<string, AufgeloestesBild>,
  tier?: string
): Ergebnis {
  const fehler: string[] = []
  const neu: CustomConfig = { ...config, pages: config.pages ? { ...config.pages } : undefined }
  if (!neu.pages) delete neu.pages

  const aufAllenSeiten = (fn: (html: string) => { html: string; treffer: number }): number => {
    let summe = 0
    const r = fn(neu.html)
    neu.html = r.html
    summe += r.treffer
    for (const slug of Object.keys(neu.pages || {})) {
      const r2 = fn(neu.pages![slug])
      neu.pages![slug] = r2.html
      summe += r2.treffer
    }
    return summe
  }

  for (const op of ops) {
    if (tier) {
      const gesperrt = pruefePlanRecht(tier, op.op)
      if (gesperrt) {
        fehler.push(gesperrt)
        continue
      }
    }
    if (op.op === 'update_text') {
      const m = op.pfad.match(/^texte\.([a-z][a-z0-9_-]*)$/)
      if (!m) {
        fehler.push(`Dieses Feld kann ich auf Ihrer Seite nicht ändern (${op.pfad}).`)
        continue
      }
      if (TELEFON.test(m[1])) {
        fehler.push('Die Telefonnummer ändert unser Support-Team für Sie, damit auch alle Anruf-Links stimmen. Schreiben Sie uns kurz die neue Nummer.')
        continue
      }
      if (op.wert.trim().length === 0) {
        fehler.push('Ein Text darf nicht leer sein.')
        continue
      }
      if (op.wert.length > MAX_TEXT) {
        fehler.push(`Der Text ist zu lang (höchstens ${MAX_TEXT} Zeichen).`)
        continue
      }
      const treffer = aufAllenSeiten((html) => setzeTextInHtml(html, m[1], op.wert))
      if (treffer === 0) fehler.push(`Das Feld „${m[1]}" gibt es auf Ihrer Seite nicht.`)
      continue
    }
    if (op.op === 'swap_image_from_bank') {
      const m = op.pfad.match(/^bilder\.([a-z][a-z0-9_-]*)$/)
      if (!m) {
        fehler.push(`Dieses Bild kann ich auf Ihrer Seite nicht tauschen (${op.pfad}).`)
        continue
      }
      const bild = bilder?.get(op.assetId)
      if (!bild) {
        fehler.push('Dieses Bild ist nicht in Ihrer Bilder-Auswahl.')
        continue
      }
      const treffer = aufAllenSeiten((html) => setzeBildInHtml(html, m[1], bild.url))
      if (treffer === 0) fehler.push(`Das Bild „${m[1]}" gibt es auf Ihrer Seite nicht.`)
      continue
    }
    fehler.push('Diese Art von Änderung (Design-Vorlage, Sektionen umbauen) ist bei Ihrer individuell gestalteten Seite nicht per Chat möglich — schreiben Sie uns, wir setzen es für Sie um.')
  }

  return fehler.length > 0 ? { ok: false, fehler } : { ok: true, config: neu }
}

/** Prompt-Abschnitt: welche Felder es gibt und wie sie geändert werden. */
export function getCustomEditorPrompt(config: CustomConfig, bildListe?: string): string {
  const { texte, bilder } = extrahiereFelder(config)
  const textZeilen = Object.entries(texte)
    .map(([k, v]) => `- texte.${k}: ${JSON.stringify(v.length > 300 ? v.slice(0, 300) + ' …' : v)}`)
    .join('\n')
  const bildZeilen = Object.entries(bilder)
    .map(([k, v]) => `- bilder.${k}: ${v.split('/').pop()}`)
    .join('\n')

  return `# EDITOR-FELDER (individuell gestaltete Seite)

Diese Seite wurde individuell nach Kundenvorlage gestaltet. Du kannst NUR die
folgenden Felder ändern — Layout, Farben, Schriften und Abschnitte bleiben fest.
Der Feldname steht vor dem Doppelpunkt, dahinter der aktuelle Text.

TEXT-FELDER (Op update_text, pfad exakt wie hier, wert = reiner Text ohne HTML;
Zeilenumbruch mit \\n; halte Länge und Ton ähnlich zum bisherigen Text):
${textZeilen || '- (keine)'}

BILD-FELDER (Op swap_image_from_bank, pfad exakt wie hier):
${bildZeilen || '- (keine)'}

TAUSCHBARE BILDER (assetId für swap_image_from_bank):
${bildListe || 'keine'}

REGELN:
- Nur update_text und swap_image_from_bank sind möglich. Wünsche nach anderem
  Layout, neuen Abschnitten, Farben oder Schriften: freundlich erklären, dass das
  unser Team umsetzt, und an den Support verweisen. KEIN patch_ops-Block.
- Telefonnummern ändert der Support (damit auch die Anruf-Links stimmen).
- Ändere nur, was der Kunde verlangt. Mehrere Felder in einem Patch sind ok.

AUSGABEFORMAT: Antworte kurz auf Deutsch und hänge die Änderung so an:
<patch_ops>
[{"op":"update_text","pfad":"texte.hero_lead","wert":"Neuer Text"}]
</patch_ops>`
}
