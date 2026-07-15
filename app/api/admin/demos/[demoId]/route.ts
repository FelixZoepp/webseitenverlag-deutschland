import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { scrapeProspectWebsite } from '@/lib/scrape-prospect'
import { generateDemoConfig } from '@/lib/generate-demo'
import { ScrapedProspect } from '@/lib/scrape-prospect'
import { collectProspectData } from '@/lib/pipeline/prospect-data'
import {
  generateLibraryDemoConfig,
  type LibraryDemoConfig,
} from '@/lib/pipeline/generate-library-content'
import { loadLibraryPage } from '@/lib/library/load'

export const maxDuration = 120

const VALID_STATUS = ['GENERIERT', 'VERSENDET', 'CONVERTED', 'ABGELAUFEN']

export async function DELETE(
  _request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { error } = await auth.data.supabase
    .from('demos')
    .delete()
    .eq('id', params.demoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const body = await request.json().catch(() => null)
  const action = typeof body?.action === 'string' ? body.action : null

  const { data: demo, error: loadError } = await supabase
    .from('demos')
    .select('*')
    .eq('id', params.demoId)
    .single()

  if (loadError || !demo) {
    return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })
  }

  // Status-Update (z.B. auf VERSENDET nach dem Versenden des Links)
  if (action === 'status') {
    const status = typeof body?.status === 'string' ? body.status : ''
    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 })
    }
    const { data: updated, error } = await supabase
      .from('demos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.demoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ demo: updated })
  }

  // Neu generieren (Library-Engine, Pipeline v2): Datenkette komplett neu durchlaufen
  if (action === 'regenerate' && (demo.config as { engine?: string })?.engine === 'library') {
    const alteConfig = demo.config as LibraryDemoConfig

    const loaded = await loadLibraryPage(supabase, alteConfig.library_page_key)
    if (!loaded) {
      return NextResponse.json(
        { error: `Komposition ${alteConfig.library_page_key} nicht gefunden` },
        { status: 500 }
      )
    }

    const prospect = await collectProspectData({
      firma: demo.prospect_name,
      ort: alteConfig.meta.ort,
      branche: demo.branche,
      websiteUrl: demo.prospect_website,
      telefon: alteConfig.meta.telefon,
      email: alteConfig.meta.email,
      notizen: demo.notes,
    })

    const config = await generateLibraryDemoConfig(prospect, loaded)

    const { data: updated, error } = await supabase
      .from('demos')
      .update({
        config,
        scraped_data: prospect,
        status: 'GENERIERT',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.demoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const warning =
      config.herkunft.generator === 'defaults'
        ? 'Demo wurde mit Standard-Inhalten erstellt (Claude nicht verfügbar oder Qualitätsprüfung fehlgeschlagen).'
        : null
    return NextResponse.json({ demo: updated, warning })
  }

  // Neu generieren: frisch scrapen falls Website vorhanden, sonst gespeicherte Daten nutzen
  if (action === 'regenerate') {
    let scraped: ScrapedProspect | null = null
    let scrapeWarning: string | null = null

    if (demo.prospect_website) {
      scraped = await scrapeProspectWebsite(demo.prospect_website)
      if (!scraped && demo.scraped_data) {
        scraped = demo.scraped_data as ScrapedProspect
        scrapeWarning = 'Website nicht erreichbar — vorherige Scrape-Daten wurden verwendet.'
      } else if (!scraped) {
        scrapeWarning = 'Website konnte nicht gescrapt werden — Demo wurde mit branchentypischen Inhalten erstellt.'
      }
    } else if (demo.scraped_data) {
      scraped = demo.scraped_data as ScrapedProspect
    }

    let config: Record<string, unknown>
    try {
      config = await generateDemoConfig(
        demo.prospect_name,
        demo.template_id,
        scraped,
        demo.branche,
        demo.notes
      )
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Demo-Generierung fehlgeschlagen' },
        { status: 500 }
      )
    }

    const { data: updated, error } = await supabase
      .from('demos')
      .update({
        config,
        scraped_data: scraped,
        status: 'GENERIERT',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.demoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ demo: updated, warning: scrapeWarning })
  }

  return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
}
