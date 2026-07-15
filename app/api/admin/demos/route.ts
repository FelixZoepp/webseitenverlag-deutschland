import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { requireAdmin } from '@/lib/auth-helpers'
import { isPremiumTemplate } from '@/lib/templates'
import { scrapeProspectWebsite } from '@/lib/scrape-prospect'
import { generateDemoConfig } from '@/lib/generate-demo'
import { collectProspectData } from '@/lib/pipeline/prospect-data'
import { generateLibraryDemoConfig } from '@/lib/pipeline/generate-library-content'
import { libraryPageKey, loadLibraryPage } from '@/lib/library/load'
import { SEED_BRANCHEN, STILE, type Stil } from '@/lib/library/types'

export const maxDuration = 120

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data: demos, error } = await auth.data.supabase
    .from('demos')
    .select('id, prospect_name, prospect_website, branche, template_id, share_token, status, notes, view_count, last_viewed_at, expires_at, created_at, paket, payment_link_url')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ demos })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const prospectName = typeof body?.prospectName === 'string' ? body.prospectName.trim() : ''
  const websiteUrl = typeof body?.websiteUrl === 'string' ? body.websiteUrl.trim() : ''
  const templateId = typeof body?.templateId === 'string' ? body.templateId : ''
  const branche = typeof body?.branche === 'string' ? body.branche.trim() : null
  const notes = typeof body?.notes === 'string' ? body.notes.trim() : null
  const engine = body?.engine === 'library' ? 'library' : 'premium'

  if (!prospectName) {
    return NextResponse.json({ error: 'Firmenname fehlt' }, { status: 400 })
  }

  // ------------------------------------------------------------
  // Engine "library": Pipeline v2 (Firecrawl → Places → Fallback)
  // ------------------------------------------------------------
  if (engine === 'library') {
    const stil = typeof body?.stil === 'string' ? body.stil : ''
    const ort = typeof body?.ort === 'string' ? body.ort.trim() : null
    if (!branche || !(SEED_BRANCHEN as readonly string[]).includes(branche)) {
      return NextResponse.json(
        { error: `Ungültige Branche — verfügbar: ${SEED_BRANCHEN.join(', ')}` },
        { status: 400 }
      )
    }
    if (!(STILE as readonly string[]).includes(stil)) {
      return NextResponse.json({ error: 'Ungültiger Stil (klar oder warm)' }, { status: 400 })
    }

    const pageKey = libraryPageKey(branche, stil as Stil)
    const loaded = await loadLibraryPage(auth.data.supabase, pageKey)
    if (!loaded) {
      return NextResponse.json({ error: `Komposition ${pageKey} nicht gefunden` }, { status: 400 })
    }

    const prospect = await collectProspectData({
      firma: prospectName,
      ort,
      branche,
      websiteUrl: websiteUrl || null,
      notizen: notes,
    })

    const config = await generateLibraryDemoConfig(prospect, loaded)

    const shareToken = randomBytes(24).toString('base64url')
    const { data: demo, error } = await auth.data.supabase
      .from('demos')
      .insert({
        prospect_name: prospectName,
        prospect_website: websiteUrl || null,
        branche,
        template_id: pageKey,
        engine: 'library',
        config,
        scraped_data: prospect,
        share_token: shareToken,
        notes,
        status: 'GENERIERT',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const warning =
      config.herkunft.generator === 'defaults'
        ? 'Demo wurde mit Standard-Inhalten erstellt (Claude nicht verfügbar oder Qualitätsprüfung fehlgeschlagen).'
        : null
    return NextResponse.json({ demo, warning })
  }

  // ------------------------------------------------------------
  // Engine "premium": bestehender v1-Weg
  // ------------------------------------------------------------
  if (!isPremiumTemplate(templateId)) {
    return NextResponse.json({ error: 'Ungültiges Template' }, { status: 400 })
  }

  // 1. Website scrapen (optional — Fehler brechen die Demo nicht ab)
  let scraped = null
  let scrapeWarning: string | null = null
  if (websiteUrl) {
    scraped = await scrapeProspectWebsite(websiteUrl)
    if (!scraped) {
      scrapeWarning = 'Website konnte nicht gescrapt werden — Demo wurde mit branchentypischen Inhalten erstellt.'
    }
  }

  // 2. Config mit Claude generieren
  let config: Record<string, unknown>
  try {
    config = await generateDemoConfig(prospectName, templateId, scraped, branche, notes)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Demo-Generierung fehlgeschlagen' },
      { status: 500 }
    )
  }

  // 3. Demo speichern
  const shareToken = randomBytes(24).toString('base64url')
  const { data: demo, error } = await auth.data.supabase
    .from('demos')
    .insert({
      prospect_name: prospectName,
      prospect_website: websiteUrl || null,
      branche,
      template_id: templateId,
      config,
      scraped_data: scraped,
      share_token: shareToken,
      notes,
      status: 'GENERIERT',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ demo, warning: scrapeWarning })
}
