/**
 * Library-Loader: DB zuerst (section_library / library_pages / stock_assets),
 * Seed-Daten als Fallback — damit die Pipeline auch läuft, bevor Migration 016
 * ausgeführt/geseedet wurde. Sobald die DB gefüllt ist, gewinnt die DB
 * (dort kann Content später redaktionell gepflegt werden).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { SEED_ASSETS, SEED_PAGES, SEED_SECTIONS } from './seed-data'
import type { LibraryPage, LibrarySection, StockAsset, Stil } from './types'

export interface LoadedLibraryPage {
  page: LibraryPage
  /** Sektionen in Kompositions-Reihenfolge */
  sections: LibrarySection[]
  /** Alle Assets (für bild_key-Auflösung) */
  assets: StockAsset[]
  /** true, wenn aus der DB geladen (sonst Seed-Fallback) */
  ausDb: boolean
}

export function libraryPageKey(branche: string, stil: Stil): string {
  const slugs: Record<string, string> = {
    Handwerk: 'handwerk',
    Gastronomie: 'gastro',
    Friseur: 'friseur',
    Gesundheit: 'gesundheit',
  }
  const slug = slugs[branche] ?? branche.toLowerCase()
  return `startseite.${slug}.${stil}`
}

function fromSeeds(pageKey: string): LoadedLibraryPage | null {
  const page = SEED_PAGES.find((p) => p.key === pageKey && p.aktiv !== false)
  if (!page) return null
  const sections: LibrarySection[] = []
  for (const ref of page.sections) {
    const section = SEED_SECTIONS.find((s) => s.key === ref.section_key)
    if (!section) return null
    sections.push(section)
  }
  return { page, sections, assets: SEED_ASSETS, ausDb: false }
}

/**
 * Lädt eine Komposition inkl. Sektionen und Assets.
 * @param supabase Service-Role- oder Admin-Client (RLS: admin-only)
 */
export async function loadLibraryPage(
  supabase: SupabaseClient,
  pageKey: string
): Promise<LoadedLibraryPage | null> {
  try {
    const { data: pageRow, error } = await supabase
      .from('library_pages')
      .select('key, name, branche, stil, seitentyp, beschreibung, sections, aktiv')
      .eq('key', pageKey)
      .eq('aktiv', true)
      .maybeSingle()

    if (error || !pageRow) return fromSeeds(pageKey)

    const page = pageRow as unknown as LibraryPage
    const sectionKeys = page.sections.map((r) => r.section_key)

    const [{ data: sectionRows }, { data: assetRows }] = await Promise.all([
      supabase
        .from('section_library')
        .select('key, section_type, branche, stil, name, content_schema, default_content, sort_hint')
        .in('key', sectionKeys)
        .eq('aktiv', true),
      supabase
        .from('stock_assets')
        .select('key, url, alt_text, branche, kategorie, quelle')
        .eq('aktiv', true),
    ])

    const byKey = new Map((sectionRows ?? []).map((s) => [s.key as string, s as unknown as LibrarySection]))
    const sections: LibrarySection[] = []
    for (const key of sectionKeys) {
      const section = byKey.get(key)
      if (!section) return fromSeeds(pageKey) // DB unvollständig → konsistenter Seed-Fallback
      sections.push(section)
    }

    return {
      page,
      sections,
      assets: (assetRows ?? []) as unknown as StockAsset[],
      ausDb: true,
    }
  } catch {
    return fromSeeds(pageKey)
  }
}
