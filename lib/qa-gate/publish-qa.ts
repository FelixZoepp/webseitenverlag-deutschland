/**
 * QA-Gate Baustein A: asynchroner QA-Lauf nach jedem Publish.
 *
 * Spezifikation: Fail ⇒ Publish wird NICHT zurückgerollt, es gibt einen
 * Admin-Alarm (manual_task), der Kunde wird nie blockiert. Der Lauf wird
 * fire-and-forget gestartet — die Publish-Response wartet nicht darauf.
 *
 * repaired ⇒ die chirurgisch reparierte Config wird als neuer Live-Stand
 * persistiert (config + draft_config) und der Site-Cache invalidiert.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidateSite } from '@/lib/hosting/site-cache'
import type { FlagshipConfig } from '@/lib/flagship/types'
import type { BusinessProfil } from '@/lib/generierung/copy-slots'
import { browserQa } from './browser-qa'

/** BusinessProfil aus einer Flagship-Config ableiten (Publish-Routen haben kein Lead-Profil) */
export function profilAusConfig(config: FlagshipConfig): BusinessProfil {
  return {
    firma: config.meta.firma,
    brancheKey: config.branche_key,
    stadt: config.meta.ort,
    telefon: config.meta.telefon ?? '',
    leistungen: config.inhalte.leistungen.karten.map((k) => k.titel),
  }
}

async function fuehrePublishQaAus(siteId: string, mode: 'publish' | 'cron'): Promise<void> {
  const admin = createAdminClient()
  const { data: site } = await admin
    .from('sites')
    .select('id, config')
    .eq('id', siteId)
    .maybeSingle()
  if (!site?.config) return

  const config = site.config as FlagshipConfig
  if (config.engine !== 'flagship') return // Legacy-Configs sind nicht QA-fähig

  const qa = await browserQa({
    siteId,
    mode,
    config,
    profil: profilAusConfig(config),
    // Kein generiereSlots: Copy-Fehler auf Live-Sites ⇒ failed + Admin-Alarm
    admin,
  })

  if (qa.status === 'repaired') {
    const now = new Date().toISOString()
    await admin
      .from('sites')
      .update({ config: qa.config, draft_config: qa.config, updated_at: now })
      .eq('id', siteId)
    await admin.from('config_versions').insert({
      site_id: siteId,
      config: qa.config,
      created_by: 'system',
      description: 'Browser-QA: chirurgische Selbstreparatur nach Publish',
    })
    revalidateSite(siteId)
  }

  if (qa.status === 'failed') {
    await admin.from('manual_tasks').insert({
      typ: 'QA_FEHLER',
      titel: `Browser-QA nach Publish fehlgeschlagen (${mode})`,
      beschreibung: `${qa.fehler_grund ?? 'unbekannter Grund'}\n\nsite_id: ${siteId}\nDie Site bleibt live (kein Rollback) — bitte manuell prüfen.`,
      quelle: 'publish-qa',
    })
  }
}

/**
 * Fire-and-forget: startet den QA-Lauf, ohne die Response zu blockieren.
 * Jeder Fehler (z. B. Playwright nicht verfügbar) landet als Admin-Alarm,
 * nie beim Kunden.
 */
export function starteAsyncPublishQa(siteId: string, mode: 'publish' | 'cron' = 'publish'): void {
  void fuehrePublishQaAus(siteId, mode).catch(async (e) => {
    const meldung = e instanceof Error ? e.message : String(e)
    console.error('[publish-qa] Lauf nicht möglich:', meldung)
    try {
      const admin = createAdminClient()
      await admin.from('manual_tasks').insert({
        typ: 'QA_FEHLER',
        titel: 'Browser-QA nach Publish nicht ausführbar',
        beschreibung: `${meldung}\n\nsite_id: ${siteId}`,
        quelle: 'publish-qa',
      })
    } catch {
      // Alarm selbst fehlgeschlagen — nur Log
    }
  })
}
