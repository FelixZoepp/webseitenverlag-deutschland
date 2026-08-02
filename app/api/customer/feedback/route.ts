/**
 * Kunden-Feedback (Phase 4, Masterplan):
 * Kunde gibt strukturiertes Feedback auf den Entwurf → KI überarbeitet automatisch.
 * Max 3 Runden inklusive, danach wird der Feedback-Button durch
 * "Freigeben oder kostenpflichtige Zusatzrunde" ersetzt.
 */

import { getOwnedSite } from '@/lib/api-helpers'
import { chatWithClaude, type CustomerContext } from '@/lib/claude'
import { pruefeLlmSchranke } from '@/lib/llm-schranke'
import { getPackage, type PackageTier } from '@/lib/packages'
import { PatchSchema, applyPatch, formatiereBildListe, type AufgeloestesBild } from '@/lib/editor-ops'
import { getEditorAssets, type EditorAsset } from '@/lib/assets/repository'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { SiteConfig, isMultiPageConfig } from '@/types'

const FeedbackSchema = z.object({
  siteId: z.string().uuid(),
  feedback: z.string().min(5, 'Feedback muss mindestens 5 Zeichen lang sein'),
})

/** 7 Werktage ab jetzt berechnen */
function werktageAbJetzt(tage: number): Date {
  const d = new Date()
  let added = 0
  while (added < tage) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return d
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = FeedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const result = await getOwnedSite(parsed.data.siteId)
    if (!result.ok) return result.response

    const { site, customer } = result.data as {
      supabase: ReturnType<typeof import('@/lib/supabase/server').createClient>
      site: Record<string, unknown>
      customer: Record<string, string>
      user: { id: string }
    }

    const currentRunde = (site.feedback_runde as number) || 0
    const maxRunden = (site.feedback_max_runden as number) || 3

    if (currentRunde >= maxRunden) {
      return NextResponse.json({
        error: `Alle ${maxRunden} inklusiven Feedback-Runden sind aufgebraucht. Bitte geben Sie die Webseite frei oder buchen Sie eine zusätzliche Runde.`,
        rundenAufgebraucht: true,
      }, { status: 400 })
    }

    const schranke = await pruefeLlmSchranke('customer-feedback')
    if (!schranke.ok) {
      return NextResponse.json({ error: schranke.grund }, { status: schranke.status })
    }

    const neueRunde = currentRunde + 1
    const adminSupabase = createAdminClient()

    // Feedback speichern
    await adminSupabase.from('site_feedback').insert({
      site_id: parsed.data.siteId,
      runde: neueRunde,
      feedback_text: parsed.data.feedback,
      status: 'IN_BEARBEITUNG',
    })

    // KI-Überarbeitung anstoßen
    const currentConfig = (site.draft_config || site.config) as SiteConfig
    const isMultiPage = isMultiPageConfig(currentConfig)
    const paket = (site.package as PackageTier) || 'business'
    const pkg = getPackage(paket)

    const customerContext: CustomerContext = {
      kundenName: (customer.company_name as string) || 'Kunde',
      branche: (customer.branche as string) || 'Unbekannt',
      paket,
      aktuelleSeitenzahl: isMultiPage ? Object.keys((currentConfig as { pages: Record<string, unknown> }).pages || {}).filter(k => !k.startsWith('legal-')).length : 1,
      maxSeiten: pkg.maxPages,
      aktiveUpsells: [],
      vertragsmonat: 1,
      vertragsMonate: 24,
      abgelehntUpsellsLetzterMonat: [],
    }

    let editorAssets: EditorAsset[] = []
    try {
      editorAssets = await getEditorAssets(adminSupabase, {
        branche: customerContext.branche.toLowerCase(),
        siteId: parsed.data.siteId,
      })
    } catch { /* ok */ }

    const feedbackPrompt = `Der Kunde hat folgendes Feedback zur Webseite gegeben (Runde ${neueRunde} von ${maxRunden}). Bitte setze die Änderungswünsche um:\n\n${parsed.data.feedback}`

    const { response, patchOps } = await chatWithClaude(
      [{ role: 'user', content: feedbackPrompt }],
      currentConfig,
      isMultiPage ? 'home' : undefined,
      customerContext,
      formatiereBildListe(editorAssets)
    )

    let angewendet = false
    let revisionText = response

    if (patchOps !== null) {
      const opsParsed = PatchSchema.safeParse(patchOps)
      if (opsParsed.success) {
        const bildMap = new Map<string, AufgeloestesBild>(
          editorAssets.map((a) => [a.id, { url: a.url, szeneTyp: a.szene_typ, quelle: a.quelle }])
        )
        const patchResult = applyPatch(currentConfig, opsParsed.data, bildMap, paket)
        if (patchResult.ok) {
          await adminSupabase
            .from('sites')
            .update({ draft_config: patchResult.config, updated_at: new Date().toISOString() })
            .eq('id', parsed.data.siteId)

          await adminSupabase.from('config_versions').insert({
            site_id: parsed.data.siteId,
            config: patchResult.config,
            created_by: 'feedback-revision',
            description: `Feedback Runde ${neueRunde}: ${parsed.data.feedback.slice(0, 150)}`,
          })

          angewendet = true
        } else {
          revisionText = `${response}\n\n(Einige Änderungen konnten nicht automatisch umgesetzt werden: ${patchResult.fehler.join(' ')})`
        }
      }
    }

    // Runde + Frist aktualisieren
    const autoFreigabe = werktageAbJetzt(7)
    await adminSupabase
      .from('sites')
      .update({
        feedback_runde: neueRunde,
        feedback_frist_gesetzt_am: new Date().toISOString(),
        feedback_auto_freigabe_am: autoFreigabe.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.siteId)

    // Feedback-Eintrag updaten
    await adminSupabase
      .from('site_feedback')
      .update({
        status: angewendet ? 'UMGESETZT' : 'EINGEGANGEN',
        revision_beschreibung: revisionText.slice(0, 500),
        umgesetzt_am: angewendet ? new Date().toISOString() : null,
      })
      .eq('site_id', parsed.data.siteId)
      .eq('runde', neueRunde)

    return NextResponse.json({
      runde: neueRunde,
      maxRunden,
      angewendet,
      response: revisionText,
      autoFreigabeAm: autoFreigabe.toISOString(),
    })
  } catch (err) {
    console.error('Feedback error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
