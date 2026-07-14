import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { requireAdmin } from '@/lib/auth-helpers'
import { isPremiumTemplate } from '@/lib/templates'
import { scrapeProspectWebsite } from '@/lib/scrape-prospect'
import { generateDemoConfig } from '@/lib/generate-demo'

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

  if (!prospectName) {
    return NextResponse.json({ error: 'Firmenname fehlt' }, { status: 400 })
  }
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
