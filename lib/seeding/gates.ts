/**
 * Branchen-Fabrik F3: Qualitäts-Gates vor dem Mensch-Gate (BF §1.4/§4.5).
 * Rendert Startseite + Funnel und prüft dieselben Grundregeln wie der
 * Flagship-Stresstest — plus Floskel-Blacklist auf den Inhalten.
 *
 * Rückgabe: Fehlerliste (leer = alle Gates grün). Kein Throw — der
 * Orchestrator entscheidet, ob ein Draft trotzdem gespeichert wird.
 */

import { pruefeContentAufFloskeln } from '@/lib/floskel-blacklist'
import { renderFlagshipPage } from '@/lib/flagship/render'
import { renderAnfrageSeite } from '@/lib/flagship/anfrage'
import type { FlagshipConfig } from '@/lib/flagship/types'

const PFLICHT_MARKER = [
  'nav', 'hero', 'fakten', 'empathie', 'signature', 'leistungen',
  'ergebnisse', 'zahlen', 'stimmen', 'lokal', 'faq', 'conversion', 'footer',
]

function pruefeGrundregeln(html: string, seite: string, fehler: string[]) {
  if (/\{\{[^}]*\}\}/.test(html)) fehler.push(`${seite}: Template-Rest {{…}} im Output`)
  if (html.includes('undefined')) fehler.push(`${seite}: "undefined" im Output`)
  if (html.includes('fonts.googleapis')) fehler.push(`${seite}: Google-Fonts-Referenz (nicht self-contained)`)
  if (html.includes('cdn.')) fehler.push(`${seite}: CDN-Referenz (nicht self-contained)`)
  if (!html.includes('prefers-reduced-motion')) fehler.push(`${seite}: prefers-reduced-motion fehlt`)
  if (!html.includes('<html lang="de">')) fehler.push(`${seite}: lang="de" fehlt`)
  if (html.includes('<script>alert')) fehler.push(`${seite}: unescapte <script>-Injektion`)
}

export function pruefeGates(config: FlagshipConfig): string[] {
  const fehler: string[] = []

  // Startseite
  let html: string
  try {
    html = renderFlagshipPage(config, { demo: true, basisPfad: '/preview' })
  } catch (e) {
    return [`Startseite: Render-Fehler — ${(e as Error).message}`]
  }
  for (const m of PFLICHT_MARKER) {
    if (!html.includes(`<!-- sektion:${m} -->`)) fehler.push(`Startseite: Sektionsmarker "${m}" fehlt`)
  }
  if (config.inhalte.ablauf && !html.includes('<!-- sektion:ablauf -->')) {
    fehler.push('Startseite: Ablauf-Sektion fehlt trotz Config')
  }
  pruefeGrundregeln(html, 'Startseite', fehler)

  // Funnel
  let funnelHtml: string
  try {
    funnelHtml = renderAnfrageSeite(config, { demo: true, basisPfad: '/preview', submitZiel: null })
  } catch (e) {
    fehler.push(`Funnel: Render-Fehler — ${(e as Error).message}`)
    return fehler
  }
  pruefeGrundregeln(funnelHtml, 'Funnel', fehler)

  if (config.funnel.modus === 'reservierung') {
    for (const feld of ['datum', 'personen', 'telefon']) {
      if (!funnelHtml.includes(`name="${feld}"`)) fehler.push(`Funnel: Reservierungsfeld "${feld}" fehlt`)
    }
  } else {
    for (const frage of config.funnel.quali_fragen || []) {
      if (!funnelHtml.includes(`name="${frage.key}"`)) fehler.push(`Funnel: Quali-Frage "${frage.key}" fehlt`)
    }
    if (!funnelHtml.includes('name="email"')) fehler.push('Funnel: E-Mail-Feld fehlt')
  }

  // Floskel-Blacklist auf allen Inhalten
  const floskeln = pruefeContentAufFloskeln(config.inhalte as unknown as Record<string, unknown>)
  for (const f of floskeln.slice(0, 20)) {
    fehler.push(`Floskel: ${f.pfad} — "${f.floskel}"`)
  }

  return fehler
}
