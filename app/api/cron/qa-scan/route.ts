/**
 * QA-Gate Baustein A: nächtlicher Browser-QA-Scan über alle Live-Sites.
 * mode 'cron' scannt wie 'publish' (noindex verboten, canonical Pflicht).
 * Fail ⇒ Admin-Alarm (manual_task), Site bleibt live. Reparaturen werden
 * chirurgisch persistiert (publish-qa.ts).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { browserQa } from '@/lib/qa-gate/browser-qa'
import { profilAusConfig } from '@/lib/qa-gate/publish-qa'
import { revalidateSite } from '@/lib/hosting/site-cache'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MAX_SITES_PRO_LAUF = 20

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: sites } = await admin
    .from('sites')
    .select('id, config')
    .eq('status', 'published')
    .order('updated_at', { ascending: true })
    .limit(MAX_SITES_PRO_LAUF)

  const ergebnis: { siteId: string; status: string }[] = []

  for (const site of sites ?? []) {
    const config = site.config as FlagshipConfig | null
    if (!config || config.engine !== 'flagship') continue

    try {
      const qa = await browserQa({
        siteId: site.id,
        mode: 'cron',
        config,
        profil: profilAusConfig(config),
        admin,
      })

      if (qa.status === 'repaired') {
        const now = new Date().toISOString()
        await admin
          .from('sites')
          .update({ config: qa.config, draft_config: qa.config, updated_at: now })
          .eq('id', site.id)
        await admin.from('config_versions').insert({
          site_id: site.id,
          config: qa.config,
          created_by: 'system',
          description: 'Browser-QA: chirurgische Selbstreparatur (Nacht-Scan)',
        })
        revalidateSite(site.id)
      }

      if (qa.status === 'failed') {
        await admin.from('manual_tasks').insert({
          typ: 'QA_FEHLER',
          titel: 'Nacht-Scan: Browser-QA fehlgeschlagen',
          beschreibung: `${qa.fehler_grund ?? 'unbekannter Grund'}\n\nsite_id: ${site.id}\nDie Site bleibt live — bitte manuell prüfen.`,
          quelle: 'qa-scan',
        })
      }

      ergebnis.push({ siteId: site.id, status: qa.status })
    } catch (e) {
      const meldung = e instanceof Error ? e.message : String(e)
      console.error('[qa-scan] Site fehlgeschlagen:', site.id, meldung)
      ergebnis.push({ siteId: site.id, status: `fehler: ${meldung.slice(0, 120)}` })
    }
  }

  return NextResponse.json({ ok: true, gescannt: ergebnis.length, ergebnis })
}
