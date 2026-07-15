/**
 * SEO-Plan-Automation (Upsell #1, Phase G §11).
 *
 * Monatlicher Cron je Abonnent (product_key 'seo-unterseiten-abo'):
 *   1 lokale Keyword-Landingpage aus der Bibliothek generieren — die
 *   Slot-Pipeline aus Phase D wird wiederverwendet (generateLibraryDemoConfig).
 *   Kunde gibt per 1 Klick frei (seo_landingpages.status), erst dann wird die
 *   Seite unter /<slug> ausgeliefert (lib/auslieferung.ts).
 *
 * Sichtbarkeits-Report: ohne Rank-API-Key (DATAFORSEO_LOGIN/_PASSWORD,
 * WARTELISTE.md) liefert der Check einen technischen Stub aus dem gerenderten
 * HTML (Meta, H1, interne Links, Größe).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadLibraryPage, libraryPageKey } from '@/lib/library/load'
import { renderLibraryPage } from '@/lib/library/render'
import { generateLibraryDemoConfig, type LibraryDemoConfig } from '@/lib/pipeline/generate-library-content'
import type { ProspectData } from '@/lib/pipeline/prospect-data'
import type { Stil } from '@/lib/library/types'

export const SEO_PRODUCT_KEY = 'seo-unterseiten-abo'

/** Keyword-Varianten — Reihenfolge = Monat 1, 2, 3, … je Site */
const KEYWORD_MODIFIER = [
  '',
  'Kosten',
  'in der Nähe',
  'Angebot',
  'Preise',
  'Termin',
  'Beratung',
  'Notdienst',
  'Erfahrungen',
  'schnell',
  'günstig',
  'Meisterbetrieb',
]

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export interface SeoSeitenConfig extends LibraryDemoConfig {
  keyword: string
  titel: string
}

export interface SeoLandingpageErgebnis {
  keyword: string
  slug: string
  seiten_config: SeoSeitenConfig
  seo_check: Record<string, unknown>
  html: string
}

interface SiteFuerSeo {
  id: string
  name?: string | null
  config: Record<string, unknown> | null
  pflichtangaben?: Record<string, unknown> | null
}

/** Technischer SEO-Check (Meta, Links, Größe) aus dem gerenderten HTML. */
export function technischerSeoCheck(html: string, keyword: string): Record<string, unknown> {
  const titelMatch = html.match(/<title>([^<]*)<\/title>/i)
  const beschreibung = /<meta[^>]+name="description"/i.test(html)
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const interneLinks = (html.match(/href="(\/|#)[^"]*"/g) || []).length
  const groesseKb = Math.round((Buffer.byteLength(html, 'utf8') / 1024) * 10) / 10
  return {
    titel: titelMatch?.[1] ?? null,
    titel_ok: Boolean(titelMatch?.[1]),
    beschreibung_ok: beschreibung,
    h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : null,
    h1_enthaelt_keyword: Boolean(h1Match && h1Match[1].toLowerCase().includes(keyword.split(' ')[0].toLowerCase())),
    interne_links: interneLinks,
    groesse_kb: groesseKb,
    ladezeit_ok: groesseKb < 150, // 0-KB-JS-Library-Seiten sind praktisch immer < 150 KB
    rank_report: process.env.DATAFORSEO_LOGIN
      ? null // echter Rank-Abruf folgt mit API-Zugang
      : { stub: true, hinweis: 'Rank-API nicht konfiguriert (WARTELISTE) — technischer Check ohne Ranking-Daten' },
    geprueft_am: new Date().toISOString(),
  }
}

/**
 * Generiert die Keyword-Landingpage eines Monats für eine Site.
 * Gibt null zurück, wenn keine Library-Komposition auffindbar ist.
 */
export async function generiereSeoLandingpage(
  supabase: SupabaseClient,
  site: SiteFuerSeo,
  vorhandeneSlugs: string[]
): Promise<SeoLandingpageErgebnis | null> {
  const config = (site.config || {}) as Record<string, unknown>
  const istLibrary = (config as { engine?: string }).engine === 'library'
  const libConfig = istLibrary ? (config as unknown as LibraryDemoConfig) : null

  const branche = libConfig?.branche || 'Handwerk'
  const stil: Stil = libConfig?.stil === 'warm' ? 'warm' : 'klar'
  const firma =
    libConfig?.meta.firma ||
    (config.businessName as string) ||
    site.name ||
    'Unser Betrieb'
  const ort =
    libConfig?.meta.ort ||
    ((site.pflichtangaben as { ort?: string } | null)?.ort ?? null)

  // Keyword: Basis "<Branche> <Ort>", Varianten nach Anzahl vorhandener Seiten
  const basis = ort ? `${branche} ${ort}` : `${branche} ${firma}`
  let keyword = ''
  let slug = ''
  for (let i = 0; i < KEYWORD_MODIFIER.length; i++) {
    const kandidat = KEYWORD_MODIFIER[i] ? `${basis} ${KEYWORD_MODIFIER[i]}` : basis
    const kandidatSlug = slugify(kandidat)
    if (!vorhandeneSlugs.includes(kandidatSlug)) {
      keyword = kandidat
      slug = kandidatSlug
      break
    }
  }
  if (!keyword) return null // alle Varianten verbraucht

  // Library-Komposition laden (eigene Seite der Site oder Branchen-Default)
  const pageKey = libConfig?.library_page_key || libraryPageKey(branche, stil)
  let loaded = await loadLibraryPage(supabase, pageKey)
  if (!loaded) loaded = await loadLibraryPage(supabase, libraryPageKey('Handwerk', 'klar'))
  if (!loaded) return null

  // Slot-Pipeline aus Phase D wiederverwenden
  const prospect: ProspectData = {
    firma,
    ort,
    branche,
    website: libConfig?.meta.website ?? null,
    telefon: libConfig?.meta.telefon ?? null,
    email: libConfig?.meta.email ?? null,
    adresse: libConfig?.meta.adresse ?? null,
    gruendungsjahr: null,
    oeffnungszeiten: null,
    rating: null,
    reviewCount: null,
    bewertungen: [],
    websiteText: null,
    impressumText: null,
    logoUrl: null,
    bilder: [],
    notizen: `SEO-Landingpage für das Keyword "${keyword}". Alle Texte müssen auf dieses Keyword und die Region einzahlen — Überschrift enthält das Keyword.`,
    quellen: ['manuell'],
  }

  const demoConfig = await generateLibraryDemoConfig(prospect, loaded)

  // Keyword sichtbar machen: H1 = Keyword (deterministisch, unabhängig vom Generator)
  if (demoConfig.inhalte.hero) {
    demoConfig.inhalte.hero.headline = keyword
  }

  const seitenConfig: SeoSeitenConfig = {
    ...demoConfig,
    keyword,
    titel: `${keyword} | ${firma}`,
  }

  const html = renderLibraryPage(seitenConfig, loaded.assets)
  const seoCheck = technischerSeoCheck(html, keyword)

  return { keyword, slug, seiten_config: seitenConfig, seo_check: seoCheck, html }
}
