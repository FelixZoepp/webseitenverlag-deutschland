/**
 * QA-Gate Baustein A: Chirurgische Selbstreparatur.
 *
 * Kernprinzip (QA_GATE_PRODUKTSTUFEN_PROMPT): NIEMALS global neu generieren.
 * Der Lauf rendert → scannt → klassifiziert Fehler → repariert NUR die
 * betroffenen Slots → rendert neu → scannt KOMPLETT neu. Max. 2 Runden,
 * danach status='failed' mit lesbarem Report.
 *
 * Fehlerklassen:
 *  - Bild kaputt (B-IMG-LOAD, R-VARIANTEN)  → assignAssets für GENAU den
 *    Slot mit Ausschlussliste, Asset als defekt markieren
 *  - Slot-Reste/fremde Stadt/SEO (B-STUB, B-BLOCKLISTE, R-SEO-TITLE)
 *    → nur betroffene Copy-Felder neu füllen, Rest UNVERÄNDERT
 *  - Alt fehlt (R-ALT) → alt aus Asset-Datensatz, sonst deterministischer
 *    Fallback aus Label + Firma
 *  - Video kaputt (C-VIDEO-*, B-VIDEO-*) → statisches Hero-Bild als
 *    Fallback, Video-Task in die Admin-Queue
 *  - Alles andere (CLS, Console, Recht, Form …) → Template-/Pipeline-Bug
 *    → failed + manual_task, keine Bastelei
 */

import type { FlagshipConfig, MediaSlot } from '@/lib/flagship/types'
import type { ApprovedAsset } from '@/lib/assets/repository'
import { assignAssetsAusKandidaten } from '@/lib/assets/assign'
import { FLAGSHIP_ASSET_SLOTS } from '@/lib/flagship/asset-slots'
import { findeFremdeStaedte } from '@/lib/generierung/staedte-blockliste'
import {
  wendeCopySlotsAn,
  type BusinessProfil,
  type CopySlots,
} from '@/lib/generierung/copy-slots'
import { fehlerAlsText, type QaReport, type RegelErgebnis } from './regeln'

// ------------------------------------------------------------ Fehlerklassen

const BILD_REGELN = new Set(['B-IMG-LOAD', 'R-VARIANTEN'])
const COPY_REGELN = new Set(['B-STUB', 'B-BLOCKLISTE', 'R-SEO-TITLE'])
const ALT_REGELN = new Set(['R-ALT'])
const VIDEO_REGELN = new Set(['C-VIDEO-SIZE', 'C-VIDEO-FALLBACK', 'B-VIDEO-ATTR', 'B-VIDEO-LAZY'])

const MAX_RUNDEN = 2

export interface ReparaturDeps {
  /** Seed-Basis für deterministische Neuzuweisung (i. d. R. siteId) */
  seedKey: string
  branche: string
  styleTags: string[]
  profil: BusinessProfil
  /** Approved-Kandidaten der Branche (asset_bank) */
  kandidaten: ApprovedAsset[]
  /** Öffentliche URL eines Assets (publicAssetUrl) */
  urlFuerAsset: (asset: ApprovedAsset) => string
  /** Nur betroffene Copy-Slots neu generieren — mit Fehler-Feedback */
  generiereSlots?: (feedback: string) => Promise<CopySlots>
  /** Asset als defekt flaggen (quality_status) — best effort */
  markiereAssetDefekt?: (assetUrl: string, grund: string) => Promise<void>
  /** manual_task in die Admin-Queue legen — best effort */
  meldeManualTask?: (titel: string, beschreibung: string) => Promise<void>
  rendere: (config: FlagshipConfig) => Promise<string> | string
  /** KOMPLETTER Scan (Render- + Browser-Checks) des gerenderten HTML */
  scanne: (html: string, config: FlagshipConfig) => Promise<RegelErgebnis[]>
}

export interface QaLaufErgebnis extends QaReport {
  /** ggf. reparierte Config — Aufrufer persistiert sie bei repaired */
  config: FlagshipConfig
  html: string
}

// ------------------------------------------------------------ Hilfen

function klon<T>(wert: T): T {
  return JSON.parse(JSON.stringify(wert)) as T
}

/** Fehler nach Regel-ID deduplizieren (mobile+desktop melden doppelt) */
function fehlerProRegel(ergebnisse: RegelErgebnis[]): Map<string, RegelErgebnis[]> {
  const map = new Map<string, RegelErgebnis[]>()
  for (const e of ergebnisse) {
    if (e.ok) continue
    const liste = map.get(e.regelId) ?? []
    liste.push(e)
    map.set(e.regelId, liste)
  }
  return map
}

/** Kaputte Bild-URLs aus den Fehl-Ergebnissen extrahieren (Suffix-Match wegen Kürzung) */
function kaputteUrlSuffixe(fehler: RegelErgebnis[]): string[] {
  const suffixe: string[] = []
  for (const e of fehler) {
    const m = e.selector?.match(/img\[src="(.+)"\]$/)
    if (m) suffixe.push(m[1].replace(/^…/, ''))
    // R-VARIANTEN: gemessen enthält das src/href-Fragment mit /original_
    const o = e.gemessen?.match(/"([^"]*\/original_[^"]*)"/)
    if (o) suffixe.push(o[1])
  }
  return suffixe
}

function urlBetroffen(datei: string | undefined, suffixe: string[]): boolean {
  if (!datei) return false
  if (datei.includes('/original_')) return true
  return suffixe.some((s) => datei.endsWith(s) || s.endsWith(datei))
}

/** Alle aktuell verwendeten Bild-URLs der Config (für die Ausschlussliste) */
function verwendeteUrls(config: FlagshipConfig): Set<string> {
  const urls = new Set<string>()
  const sammle = (slot?: MediaSlot) => {
    if (slot?.datei) urls.add(slot.datei)
  }
  sammle(config.inhalte.hero.media)
  sammle(config.inhalte.signature?.vorher)
  sammle(config.inhalte.signature?.nachher)
  for (const paar of config.inhalte.ergebnisse?.paare ?? []) {
    sammle(paar.vorher)
    sammle(paar.nachher)
  }
  for (const bild of config.inhalte.ergebnisse?.bilder ?? []) sammle(bild.media)
  return urls
}

interface SlotGruppe {
  sektion: keyof typeof FLAGSHIP_ASSET_SLOTS & string
  /** slotKey → MediaSlot-Referenz in der Config */
  slots: Record<string, MediaSlot>
}

/** Config-Referenzen der bildführenden Slot-Gruppen */
function slotGruppen(config: FlagshipConfig): SlotGruppe[] {
  const gruppen: SlotGruppe[] = [
    { sektion: 'hero', slots: { hero_img: config.inhalte.hero.media } },
  ]
  const sig = config.inhalte.signature
  if (sig?.vorher && sig?.nachher) {
    gruppen.push({ sektion: 'signature', slots: { sig_vorher: sig.vorher, sig_nachher: sig.nachher } })
  }
  const erg = config.inhalte.ergebnisse
  const paar = erg?.paare?.[0]
  if (paar) {
    gruppen.push({ sektion: 'ergebnisse_ba', slots: { ba_vorher_1: paar.vorher, ba_nachher_1: paar.nachher } })
  }
  if (erg?.bilder?.length) {
    const slots: Record<string, MediaSlot> = {}
    erg.bilder.slice(0, 3).forEach((b, i) => {
      slots[`galerie_${i + 1}`] = b.media
    })
    gruppen.push({ sektion: 'ergebnisse_galerie', slots })
  }
  return gruppen
}

// ------------------------------------------------------------ Reparaturen

async function repariereBilder(
  config: FlagshipConfig,
  fehler: RegelErgebnis[],
  deps: ReparaturDeps,
  runde: number
): Promise<string[]> {
  const suffixe = kaputteUrlSuffixe(fehler)
  const meldungen: string[] = []
  const belegt = verwendeteUrls(config)

  for (const gruppe of slotGruppen(config)) {
    const betroffen = Object.entries(gruppe.slots).filter(([, slot]) =>
      urlBetroffen(slot.datei, suffixe)
    )
    if (betroffen.length === 0) continue

    // Defekte Assets flaggen (best effort)
    for (const [, slot] of betroffen) {
      if (slot.datei && deps.markiereAssetDefekt) {
        await deps.markiereAssetDefekt(slot.datei, 'Browser-QA: Bild lädt nicht').catch(() => {})
      }
    }

    // Ausschlussliste: kaputte + alle aktuell verwendeten URLs
    const ausschluss = new Set<string>(belegt)
    for (const [, slot] of betroffen) if (slot.datei) ausschluss.add(slot.datei)
    const kandidaten = deps.kandidaten.filter((a) => !ausschluss.has(deps.urlFuerAsset(a)))

    const deklaration = FLAGSHIP_ASSET_SLOTS[gruppe.sektion]
    if (!deklaration) continue

    let zuweisung: Record<string, ApprovedAsset>
    try {
      // Paar-Slots werden IMMER als ganze Gruppe neu zugewiesen (nie halbe Paare)
      const ergebnis = assignAssetsAusKandidaten(
        `${deps.seedKey}:qa-runde-${runde}:${gruppe.sektion}`,
        deps.branche,
        deps.styleTags,
        deklaration,
        kandidaten
      )
      zuweisung = ergebnis.zuweisung
    } catch {
      meldungen.push(`Bild-Reparatur ${gruppe.sektion}: kein Ersatz-Kandidat in der asset_bank`)
      continue
    }

    for (const [slotKey, slot] of Object.entries(gruppe.slots)) {
      const asset = zuweisung[slotKey]
      if (!asset) continue
      const neuBetroffen = betroffen.some(([k]) => k === slotKey)
      // Nur betroffene Slots austauschen; Paare komplett, um pair_id zu wahren
      const paarGruppe = gruppe.sektion === 'signature' || gruppe.sektion === 'ergebnisse_ba'
      if (!neuBetroffen && !(paarGruppe && betroffen.length > 0)) continue
      slot.datei = deps.urlFuerAsset(asset)
      if (asset.alt_text_de) slot.alt = asset.alt_text_de
      if (asset.breite) slot.breite = asset.breite
      if (asset.hoehe) slot.hoehe = asset.hoehe
      meldungen.push(`Bild ersetzt: ${gruppe.sektion}/${slotKey} → ${asset.storage_path}`)
    }
  }
  return meldungen
}

/** Copy-Felder, die wendeCopySlotsAn schreibt — mit Lese-/Übertrage-Zugriff */
const COPY_FELDER: Array<{
  feld: string
  lies: (c: FlagshipConfig) => string[]
  uebertrage: (ziel: FlagshipConfig, quelle: FlagshipConfig) => void
}> = [
  {
    feld: 'seo',
    lies: (c) => [c.meta.seo_titel ?? '', c.meta.seo_beschreibung ?? ''],
    uebertrage: (z, q) => {
      z.meta.seo_titel = q.meta.seo_titel
      z.meta.seo_beschreibung = q.meta.seo_beschreibung
    },
  },
  {
    feld: 'hero',
    lies: (c) => [
      c.inhalte.hero.eyebrow,
      ...c.inhalte.hero.headline_zeilen,
      c.inhalte.hero.lead,
      ...c.inhalte.hero.chips,
    ],
    uebertrage: (z, q) => {
      z.inhalte.hero.eyebrow = q.inhalte.hero.eyebrow
      z.inhalte.hero.headline_zeilen = q.inhalte.hero.headline_zeilen
      z.inhalte.hero.lead = q.inhalte.hero.lead
      z.inhalte.hero.chips = q.inhalte.hero.chips
    },
  },
  {
    feld: 'fakten',
    lies: (c) => c.inhalte.fakten.punkte.map((p) => p.text),
    uebertrage: (z, q) => {
      z.inhalte.fakten.punkte = q.inhalte.fakten.punkte
    },
  },
  {
    feld: 'empathie',
    lies: (c) => [c.inhalte.empathie.headline, c.inhalte.empathie.text],
    uebertrage: (z, q) => {
      z.inhalte.empathie.headline = q.inhalte.empathie.headline
      z.inhalte.empathie.text = q.inhalte.empathie.text
    },
  },
  {
    feld: 'leistungen',
    lies: (c) => c.inhalte.leistungen.karten.flatMap((k) => [k.titel, k.text]),
    uebertrage: (z, q) => {
      z.inhalte.leistungen.karten = q.inhalte.leistungen.karten
    },
  },
  {
    feld: 'faq',
    lies: (c) => c.inhalte.faq.fragen.flatMap((f) => [f.frage, f.antwort]),
    uebertrage: (z, q) => {
      z.inhalte.faq.fragen = q.inhalte.faq.fragen
    },
  },
  {
    feld: 'conversion',
    lies: (c) => [c.inhalte.conversion.headline, c.inhalte.conversion.lead],
    uebertrage: (z, q) => {
      z.inhalte.conversion.headline = q.inhalte.conversion.headline
      z.inhalte.conversion.lead = q.inhalte.conversion.lead
    },
  },
  {
    feld: 'footer',
    lies: (c) => [c.inhalte.footer.beschreibung],
    uebertrage: (z, q) => {
      z.inhalte.footer.beschreibung = q.inhalte.footer.beschreibung
    },
  },
]

const STUB_MUSTER = /\{\{|\blorem\b|\bTODO\b|\bStub\b/i

/** Welche Copy-Felder tragen den Fehler? (chirurgisch: nur diese neu füllen) */
function findeBetroffeneCopyFelder(
  config: FlagshipConfig,
  regelIds: Set<string>,
  stadt: string
): string[] {
  const betroffen = new Set<string>()
  for (const eintrag of COPY_FELDER) {
    const texte = eintrag.lies(config)
    const hatStub = regelIds.has('B-STUB') && texte.some((t) => STUB_MUSTER.test(t))
    const hatFremd =
      regelIds.has('B-BLOCKLISTE') && texte.some((t) => findeFremdeStaedte(t, stadt).length > 0)
    if (hatStub || hatFremd) betroffen.add(eintrag.feld)
  }
  if (regelIds.has('R-SEO-TITLE')) betroffen.add('seo')
  return Array.from(betroffen)
}

async function repariereCopy(
  config: FlagshipConfig,
  fehler: RegelErgebnis[],
  deps: ReparaturDeps
): Promise<{ config: FlagshipConfig; meldungen: string[] }> {
  const regelIds = new Set(fehler.map((f) => f.regelId))
  const betroffen = findeBetroffeneCopyFelder(config, regelIds, deps.profil.stadt)
  if (betroffen.length === 0 || !deps.generiereSlots) {
    return {
      config,
      meldungen: deps.generiereSlots
        ? []
        : ['Copy-Reparatur nicht möglich: kein Slot-Generator injiziert'],
    }
  }

  const feedback =
    `Der letzte Text-Entwurf hat die QA nicht bestanden:\n${fehlerAlsText(fehler)}\n` +
    `Betroffene Bereiche: ${betroffen.join(', ')}. ` +
    `Erzeuge korrekte Texte NUR mit der Kundenstadt „${deps.profil.stadt}", ohne Platzhalter.`
  const slots = await deps.generiereSlots(feedback)

  // Volle Anwendung auf einen Klon — dann NUR betroffene Felder zurückkopieren
  const komplett = wendeCopySlotsAn(config, slots, deps.profil)
  const ziel = klon(config)
  const meldungen: string[] = []
  for (const eintrag of COPY_FELDER) {
    if (!betroffen.includes(eintrag.feld)) continue
    eintrag.uebertrage(ziel, komplett)
    meldungen.push(`Copy neu gefüllt: ${eintrag.feld} (Rest unverändert)`)
  }
  return { config: ziel, meldungen }
}

function repariereAlt(config: FlagshipConfig, deps: ReparaturDeps): string[] {
  const meldungen: string[] = []
  const alleSlots: Array<[string, MediaSlot]> = slotGruppen(config).flatMap((g) =>
    Object.entries(g.slots).map(([k, s]) => [`${g.sektion}/${k}`, s] as [string, MediaSlot])
  )
  for (const [pfad, slot] of alleSlots) {
    if (!slot.datei) continue
    if (slot.alt && slot.alt.trim().length >= 4) continue
    const asset = deps.kandidaten.find(
      (a) => deps.urlFuerAsset(a) === slot.datei || slot.datei!.endsWith(a.storage_path)
    )
    slot.alt =
      asset?.alt_text_de?.trim() ||
      `${slot.label} – ${deps.profil.firma} in ${deps.profil.stadt}`
    meldungen.push(`Alt-Text ergänzt: ${pfad}${asset ? ' (aus Asset-Datensatz)' : ' (Fallback)'}`)
  }
  return meldungen
}

async function repariereVideo(config: FlagshipConfig, deps: ReparaturDeps): Promise<string[]> {
  if (!config.inhalte.hero.video) return []
  delete config.inhalte.hero.video
  if (deps.meldeManualTask) {
    await deps
      .meldeManualTask(
        'Hero-Video defekt — auf statisches Bild zurückgefallen',
        `Das Hero-Video von ${deps.profil.firma} (${deps.profil.stadt}) hat die QA nicht bestanden ` +
          '(Größe/Attribute/Fallback). Die Site läuft mit statischem Hero-Bild weiter. ' +
          'Bitte Video neu transcodieren (≤ 3 MB, Poster) und erneut setzen.'
      )
      .catch(() => {})
  }
  return ['Video entfernt: statisches Hero-Bild als Fallback, Video-Task in Admin-Queue']
}

// ------------------------------------------------------------ Hauptlauf

/**
 * Kompletter QA-Lauf mit chirurgischer Selbstreparatur.
 * render → scan → (repair → render → KOMPLETTER re-scan) × max 2.
 */
export async function fuehreQaLaufAus(
  eingabe: FlagshipConfig,
  deps: ReparaturDeps
): Promise<QaLaufErgebnis> {
  let config = klon(eingabe)
  let html = await deps.rendere(config)
  let ergebnisse = await deps.scanne(html, config)
  const reparaturen: string[] = []
  let runde = 0

  while (runde < MAX_RUNDEN) {
    const fehler = fehlerProRegel(ergebnisse)
    if (fehler.size === 0) break

    const reparierbar = Array.from(fehler.keys()).some(
      (id) => BILD_REGELN.has(id) || COPY_REGELN.has(id) || ALT_REGELN.has(id) || VIDEO_REGELN.has(id)
    )
    if (!reparierbar) break

    runde++
    const vorher = reparaturen.length

    const bildFehler = Array.from(fehler.entries())
      .filter(([id]) => BILD_REGELN.has(id))
      .flatMap(([, e]) => e)
    if (bildFehler.length > 0) {
      reparaturen.push(...(await repariereBilder(config, bildFehler, deps, runde)))
    }

    const copyFehler = Array.from(fehler.entries())
      .filter(([id]) => COPY_REGELN.has(id))
      .flatMap(([, e]) => e)
    if (copyFehler.length > 0) {
      const r = await repariereCopy(config, copyFehler, deps)
      config = r.config
      reparaturen.push(...r.meldungen)
    }

    if (Array.from(fehler.keys()).some((id) => ALT_REGELN.has(id))) {
      reparaturen.push(...repariereAlt(config, deps))
    }

    if (Array.from(fehler.keys()).some((id) => VIDEO_REGELN.has(id))) {
      reparaturen.push(...(await repariereVideo(config, deps)))
    }

    if (reparaturen.length === vorher) break // nichts angefasst → Endlosschleife vermeiden

    html = await deps.rendere(config)
    ergebnisse = await deps.scanne(html, config) // KOMPLETTER Re-Scan
  }

  const verbleibend = Array.from(fehlerProRegel(ergebnisse).values()).map((e) => e[0])
  const status: QaReport['status'] =
    verbleibend.length === 0 ? (runde === 0 ? 'passed' : 'repaired') : 'failed'

  if (status === 'failed' && deps.meldeManualTask) {
    const strukturell = verbleibend.filter(
      (e) =>
        !BILD_REGELN.has(e.regelId) &&
        !COPY_REGELN.has(e.regelId) &&
        !ALT_REGELN.has(e.regelId) &&
        !VIDEO_REGELN.has(e.regelId)
    )
    if (strukturell.length > 0) {
      await deps
        .meldeManualTask(
          `Browser-QA fehlgeschlagen: ${deps.profil.firma} (${deps.profil.stadt})`,
          `Nicht auto-reparierbare Verstöße:\n${fehlerAlsText(strukturell)}`
        )
        .catch(() => {})
    }
  }

  return {
    status,
    runden: runde,
    ergebnisse,
    reparaturen,
    fehler_grund: status === 'failed' ? fehlerAlsText(verbleibend) : undefined,
    geprueft_am: new Date().toISOString(),
    config,
    html,
  }
}
