import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { generierungGesperrt } from '@/lib/monitoring'
import { sendSlackNotification } from '@/lib/slack'
import { seedBranche } from '@/lib/seeding/seed-branche'
import { startBranche } from '@/lib/seeding/branchen-start'

/**
 * F3/F4 Mensch-Gate (BF §4.6): Freigabe / Feedback für Branchen-Vorlagen.
 *
 * PATCH { action: 'approve' }               → quality_status 'approved'
 * PATCH { action: 'feedback', text: '…' }   → Notiz in guideline_notes, zurück auf 'draft'
 * PATCH { action: 'feedback', text, regenerieren: true }
 *                                           → Notiz speichern + sofortige Regenerier-Runde
 *                                             (Feedback wird in den Seeding-Prompt injiziert)
 * PATCH { action: 'draft' }                 → Freigabe zurückziehen
 */

// Hobby-Plan-Limit; Regenerier-Runde kann länger brauchen → Timeout möglich,
// dann per CLI seeden (seed:branchen). Inngest-Job steht auf der WARTELISTE.
export const maxDuration = 300

export async function PATCH(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response
    const { supabase, user } = result.data

    const body = await request.json().catch(() => null) as { action?: string; text?: string; regenerieren?: boolean } | null
    if (!body?.action) return NextResponse.json({ error: 'action fehlt' }, { status: 400 })

    const { data: row, error: ladeFehler } = await supabase
      .from('branchen_profile')
      .select('id, name, meta_kategorie, guideline_notes, beschreibung:profil->beschreibung')
      .eq('branche_key', params.key)
      .maybeSingle()
    if (ladeFehler) return NextResponse.json({ error: ladeFehler.message }, { status: 500 })
    if (!row) return NextResponse.json({ error: 'Branche nicht gefunden' }, { status: 404 })

    let update: Record<string, unknown>
    if (body.action === 'approve') {
      update = {
        quality_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      }
    } else if (body.action === 'draft') {
      update = { quality_status: 'draft', approved_at: null, approved_by: null }
    } else if (body.action === 'feedback') {
      const text = (body.text || '').trim()
      if (!text) return NextResponse.json({ error: 'Feedback-Text fehlt' }, { status: 400 })
      if (text.length > 2000) return NextResponse.json({ error: 'Feedback zu lang (max. 2000 Zeichen)' }, { status: 400 })
      update = {
        guideline_notes: [...(row.guideline_notes ?? []), text],
        quality_status: 'draft',
        approved_at: null,
        approved_by: null,
      }
    } else {
      return NextResponse.json({ error: `Unbekannte action "${body.action}"` }, { status: 400 })
    }

    const { data: aktualisiert, error } = await supabase
      .from('branchen_profile')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .select('branche_key, quality_status, approved_at, guideline_notes')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // F4 Regenerier-Runde (BF §4.6): Notiz ist gespeichert — jetzt mit dem
    // Feedback im Prompt neu seeden. Fehler lassen die Notiz bestehen.
    if (body.action === 'feedback' && body.regenerieren === true) {
      if (generierungGesperrt()) {
        return NextResponse.json({ ...aktualisiert, regeneriert: false, regenerier_fehler: 'Generierung gestoppt (GENERATION_KILL_SWITCH aktiv).' })
      }
      const def = startBranche(params.key) ?? {
        branche_key: params.key,
        name: row.name,
        meta_kategorie: row.meta_kategorie,
        beschreibung: typeof row.beschreibung === 'string' ? row.beschreibung : '',
      }
      if (!def.beschreibung) {
        return NextResponse.json({ ...aktualisiert, regeneriert: false, regenerier_fehler: 'Keine Seeding-Beschreibung hinterlegt — Regenerieren per CLI (seed:branchen).' })
      }
      const ergebnis = await seedBranche(def)
      if (ergebnis.status === 'fehler') {
        await sendSlackNotification('library', `Regenerier-Runde "${params.key}" fehlgeschlagen: ${ergebnis.fehler}`)
        return NextResponse.json({ ...aktualisiert, regeneriert: false, regenerier_fehler: ergebnis.fehler })
      }
      const basisUrl = new URL(request.url).origin
      await sendSlackNotification(
        'library',
        `Branche regeneriert und wartet auf Freigabe: *${def.name}* (${params.key})\nPreview: ${basisUrl}/branchen-preview/${params.key}\nFreigabe: ${basisUrl}/admin/branchen`
      )
      const { data: frisch } = await supabase
        .from('branchen_profile')
        .select('branche_key, quality_status, approved_at, guideline_notes')
        .eq('id', row.id)
        .single()
      return NextResponse.json({ ...(frisch ?? aktualisiert), regeneriert: true, asset_warnung: ergebnis.asset_warnung ?? null })
    }

    return NextResponse.json(aktualisiert)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
