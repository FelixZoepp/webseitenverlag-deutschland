/**
 * QA-Gate Baustein A: manueller Browser-QA-Lauf aus dem Admin
 * ("Leads → QA prüfen"). Läuft synchron und liefert den Report zurück —
 * inkl. Screenshots. Demo-Sites laufen im demo-Modus (mit Copy-Reparatur
 * via Claude), Live-Sites im publish-Modus.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { browserQa } from '@/lib/qa-gate/browser-qa'
import { profilAusConfig } from '@/lib/qa-gate/publish-qa'
import { generiereCopySlots } from '@/lib/generierung/copy-slots'
import { revalidateSite } from '@/lib/hosting/site-cache'
import type { FlagshipConfig } from '@/lib/flagship/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(
  _request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const admin = createAdminClient()
  const { data: site } = await admin
    .from('sites')
    .select('id, status, config, draft_config')
    .eq('id', params.siteId)
    .maybeSingle()
  if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

  const config = (site.status === 'published' ? site.config : site.draft_config ?? site.config) as
    | FlagshipConfig
    | null
  if (!config || config.engine !== 'flagship') {
    return NextResponse.json(
      { error: 'Site hat keine Flagship-Config — Browser-QA nicht möglich.' },
      { status: 409 }
    )
  }

  const mode: 'demo' | 'publish' = site.status === 'published' ? 'publish' : 'demo'
  const profil = profilAusConfig(config)
  const { data: branche } = await admin
    .from('branchen_profile')
    .select('name')
    .eq('branche_key', profil.brancheKey)
    .maybeSingle()
  const brancheName = branche?.name ?? profil.brancheKey

  try {
    const qa = await browserQa({
      siteId: params.siteId,
      mode,
      config,
      profil,
      renderOptionen: mode === 'demo' ? { demo: true, noindex: true } : undefined,
      generiereSlots: async (feedback) => {
        const r = await generiereCopySlots(profil, brancheName, feedback)
        return r.slots
      },
      admin,
    })

    // Reparierte Config persistieren (Demo: draft+config; Live: Live-Stand + Cache)
    if (qa.status === 'repaired') {
      const now = new Date().toISOString()
      await admin
        .from('sites')
        .update({ config: qa.config, draft_config: qa.config, updated_at: now })
        .eq('id', params.siteId)
      await admin
        .from('demos')
        .update({ config: qa.config })
        .eq('site_id', params.siteId)
      if (mode === 'publish') {
        await admin.from('config_versions').insert({
          site_id: params.siteId,
          config: qa.config,
          created_by: 'system',
          description: 'Browser-QA: chirurgische Selbstreparatur (manueller Lauf)',
        })
        revalidateSite(params.siteId)
      }
    }

    return NextResponse.json({
      ok: true,
      status: qa.status,
      runden: qa.runden,
      reparaturen: qa.reparaturen,
      fehler_grund: qa.fehler_grund ?? null,
      ergebnisse: qa.ergebnisse,
      screenshots: qa.screenshotUrls,
      report_id: qa.reportId,
    })
  } catch (e) {
    const meldung = e instanceof Error ? e.message : String(e)
    console.error('[admin-qa] Lauf fehlgeschlagen:', meldung)
    return NextResponse.json({ error: meldung }, { status: 500 })
  }
}
