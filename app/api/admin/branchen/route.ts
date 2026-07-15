import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { generierungGesperrt } from '@/lib/monitoring'
import { sendSlackNotification } from '@/lib/slack'
import { klassifiziereBranche } from '@/lib/seeding/klassifiziere-branche'
import { seedBranche } from '@/lib/seeding/seed-branche'
import { startBranche } from '@/lib/seeding/branchen-start'

/**
 * F4 Auto-Seeding (BF §4): Trigger für neue Branchen.
 *
 * POST { branche: 'Schlüsseldienst' } →
 *   1. Klassifizieren (Claude → Meta-Kategorie; unsicher = 422 statt Raten)
 *   2. seedBranche (Profil + Vorlage + Gates + Asset-Grundset, draft)
 *   3. Slack #library: „Neue Branche wartet auf Freigabe" + Preview-Link
 *
 * Läuft synchron (~5–10 Min) — Inngest-Job steht auf der WARTELISTE.
 */

// Hobby-Plan-Limit; Seeding braucht oft länger (~330–500s) → Timeout möglich,
// dann per CLI seeden (seed:branchen). Inngest-Job steht auf der WARTELISTE.
export const maxDuration = 300

/** Liste für die Demo-UI (F5): welche Branchen-Vorlagen gibt es, was ist approved */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data: branchen, error } = await auth.data.supabase
    .from('branchen_profile')
    .select('branche_key, name, meta_kategorie, quality_status')
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ branchen })
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    if (generierungGesperrt()) {
      return NextResponse.json(
        { error: 'Generierung gestoppt (GENERATION_KILL_SWITCH aktiv).' },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => null) as { branche?: string } | null
    const freitext = (body?.branche || '').trim()
    if (!freitext) return NextResponse.json({ error: 'Branche fehlt' }, { status: 400 })

    // 1. Klassifizieren — unsicher ist ein sauberer Fehler, kein Raten
    let def
    try {
      def = startBranche(freitext) ?? await klassifiziereBranche(freitext)
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 422 })
    }

    // Approved Vorlage vorhanden? Dann nichts überschreiben (Re-Seeding
    // würde die Freigabe invalidieren — dafür gibt es die Regenerier-Runde)
    const { data: bestand } = await auth.data.supabase
      .from('branchen_profile')
      .select('branche_key, quality_status')
      .eq('branche_key', def.branche_key)
      .maybeSingle()
    if (bestand?.quality_status === 'approved') {
      return NextResponse.json(
        { error: `Branche "${def.branche_key}" ist bereits freigegeben — Regenerieren nur über Feedback.`, branche_key: def.branche_key },
        { status: 409 }
      )
    }

    // 2. Seeden (Gates inklusive; bei Verstößen wird nicht gespeichert)
    const ergebnis = await seedBranche(def)
    if (ergebnis.status === 'fehler') {
      await sendSlackNotification(
        'library',
        `Auto-Seeding "${def.name}" (${def.branche_key}) fehlgeschlagen: ${ergebnis.fehler}${ergebnis.gates.length ? `\nGates:\n${ergebnis.gates.map((g) => `• ${g}`).join('\n')}` : ''}`
      )
      return NextResponse.json({ error: ergebnis.fehler, gates: ergebnis.gates }, { status: 500 })
    }

    // 3. Mensch-Gate anpingen (BF §4.6)
    const basisUrl = new URL(request.url).origin
    await sendSlackNotification(
      'library',
      `Neue Branche wartet auf Freigabe: *${def.name}* (${def.branche_key})\nPreview: ${basisUrl}/branchen-preview/${def.branche_key}\nFreigabe: ${basisUrl}/admin/branchen${ergebnis.asset_warnung ? `\n⚠ Assets: ${ergebnis.asset_warnung}` : ''}`
    )

    return NextResponse.json({
      branche_key: def.branche_key,
      name: def.name,
      meta_kategorie: def.meta_kategorie,
      quality_status: 'draft',
      asset_warnung: ergebnis.asset_warnung ?? null,
    })
  } catch (e) {
    console.error('[auto-seeding]', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
