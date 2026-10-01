/**
 * Test Custom-Engine-Auslieferung für Live-Sites (Option A, B&C Direct Sales).
 *
 * Die Custom-Engine (fertiges HTML in config.html + config.pages[slug]) wurde
 * bislang nur in den Demo-Routen ausgeliefert. renderKundenseite muss sie
 * auch live rendern:
 *  - ''            → config.html (Startseite)
 *  - 'karriere'    → config.pages['karriere']
 *  - unbekannt     → null (404; SEO-Landingpage-Fallback liefert nichts)
 *  - impressum     → Rechtstexte gewinnen weiterhin (bestehendes Verhalten)
 *
 * Aufruf: npm run test:custom-engine
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { renderKundenseite, type SiteZeile } from '../lib/auslieferung'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

/** Stub: jede Query endet in maybeSingle()/single() mit data: null */
function leererSupabaseStub(): SupabaseClient {
  const kette: Record<string, unknown> = {}
  const handler = () => kette
  Object.assign(kette, {
    from: handler,
    select: handler,
    eq: handler,
    maybeSingle: async () => ({ data: null }),
    single: async () => ({ data: null }),
  })
  return kette as unknown as SupabaseClient
}

const HOME_HTML = '<!DOCTYPE html><html><body><h1>B&amp;C Direct Sales</h1></body></html>'
const KARRIERE_HTML = '<!DOCTYPE html><html><body><h1>Karriere</h1></body></html>'

const site: SiteZeile = {
  id: 'site-test-1',
  template_id: null,
  status: 'published',
  name: 'B&C Direct Sales GmbH',
  config: {
    engine: 'custom',
    html: HOME_HTML,
    pages: { karriere: KARRIERE_HTML },
  },
}

async function main() {
  const supabase = leererSupabaseStub()

  console.log('Custom-Engine live')

  const start = await renderKundenseite(supabase, site, '')
  assert(start === HOME_HTML, 'startseite', `erwartet config.html, bekommen: ${String(start).slice(0, 80)}`)

  const karriere = await renderKundenseite(supabase, site, 'karriere')
  assert(karriere === KARRIERE_HTML, 'unterseite', `erwartet config.pages.karriere, bekommen: ${String(karriere).slice(0, 80)}`)

  const unbekannt = await renderKundenseite(supabase, site, 'gibts-nicht')
  assert(unbekannt === null, 'unbekannter-slug', `erwartet null, bekommen: ${String(unbekannt).slice(0, 80)}`)

  // Rechtstexte gewinnen weiterhin gegen die Engine
  const siteMitRechtstexten: SiteZeile = {
    ...site,
    config: {
      ...site.config,
      rechtstexte: { impressum: 'Impressum-Inhalt', datenschutz: 'Datenschutz-Inhalt' },
    },
  }
  const impressum = await renderKundenseite(supabase, siteMitRechtstexten, 'impressum')
  assert(
    typeof impressum === 'string' && impressum.includes('Impressum-Inhalt'),
    'rechtstexte-vorrang',
    `erwartet Rechtstext-Seite, bekommen: ${String(impressum).slice(0, 80)}`
  )

  console.log(fehler === 0 ? `  ✓ ${geprueft} Prüfungen bestanden` : `  ${fehler}/${geprueft} Prüfungen fehlgeschlagen`)
  process.exit(fehler === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
