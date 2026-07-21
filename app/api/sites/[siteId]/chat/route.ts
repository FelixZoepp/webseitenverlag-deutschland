import { getOwnedSite } from '@/lib/api-helpers'
import { chatWithClaude, type CustomerContext } from '@/lib/claude'
import { getPackage, type PackageTier } from '@/lib/packages'
import { PatchSchema, applyPatch, formatiereBildListe, type AufgeloestesBild } from '@/lib/editor-ops'
import { getEditorAssets, type EditorAsset } from '@/lib/assets/repository'
import { createAdminClient } from '@/lib/supabase/admin'
import { NERV_SCHUTZ_TAGE } from '@/config/upsells'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { SiteConfig, isMultiPageConfig } from '@/types'

/**
 * Chat-Editor (§10.2): Claude schlägt AUSSCHLIESSLICH strukturierte Ops vor,
 * die hier serverseitig Zod-validiert und gegen die Leitplanken geprüft
 * werden. Ein ungültiger Patch wird abgewiesen und verändert NICHTS.
 * Änderungen landen im Entwurf (draft_config) — live geht es erst über den
 * expliziten "Veröffentlichen"-Klick (publish-Route + config_versions).
 */

const ChatSchema = z.object({
  message: z.string().min(1, 'Nachricht darf nicht leer sein'),
  currentPage: z.string().optional(),
})

/** Rate-Limit §10.2: 50 Nachrichten pro Tag und Kunde. */
const CHAT_LIMIT_PRO_TAG = 50

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, site, customer } = result.data as {
      supabase: ReturnType<typeof import('@/lib/supabase/server').createClient>
      site: Record<string, unknown>
      customer: Record<string, string>
      user: { id: string }
    }

    const body = await request.json()
    const parsed = ChatSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { message, currentPage } = parsed.data

    // Rate-Limit: 50 Kunden-Nachrichten/Tag über alle Sites des Kunden
    const { data: kundenSites } = await supabase
      .from('sites')
      .select('id')
      .eq('customer_id', customer.id)
    const siteIds = (kundenSites || []).map((s: { id: string }) => s.id)
    const tagesbeginn = new Date()
    tagesbeginn.setUTCHours(0, 0, 0, 0)
    const { count: heutigeNachrichten } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .in('site_id', siteIds.length > 0 ? siteIds : [params.siteId])
      .eq('role', 'user')
      .gte('created_at', tagesbeginn.toISOString())

    if ((heutigeNachrichten || 0) >= CHAT_LIMIT_PRO_TAG) {
      return NextResponse.json(
        { error: `Tageslimit erreicht (${CHAT_LIMIT_PRO_TAG} Nachrichten). Morgen geht es weiter — dringende Anliegen gern an den Support.` },
        { status: 429 }
      )
    }

    await supabase.from('chat_messages').insert({
      site_id: params.siteId,
      role: 'user',
      content: message,
    })

    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('site_id', params.siteId)
      .order('created_at', { ascending: true })
      .limit(20)

    const chatMessages = (history || []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const currentConfig = (site.draft_config || site.config) as SiteConfig
    const isMultiPage = isMultiPageConfig(currentConfig)

    // Kunden-Kontext laden für Chatbot-Regeln
    const customerContext = await buildCustomerContext(supabase, customer, site)

    // Tauschbare Bilder (§5.1): NUR approved Branchen-Bank + eigene
    // Kunden-Uploads dieser Site. asset_bank ist RLS-admin-only → Admin-Client.
    let editorAssets: EditorAsset[] = []
    try {
      editorAssets = await getEditorAssets(createAdminClient(), {
        branche: customerContext.branche.toLowerCase(),
        siteId: params.siteId,
      })
    } catch (err) {
      console.error('Editor-Assets konnten nicht geladen werden:', err)
    }

    const { response, patchOps, upsellSuggestion } = await chatWithClaude(
      chatMessages,
      currentConfig,
      isMultiPage ? currentPage || 'home' : undefined,
      customerContext,
      formatiereBildListe(editorAssets)
    )

    // Bei Upsell-Vorschlag: NIE gleichzeitig Änderungen anwenden
    let antwort = response
    let angewendeteOps: unknown = null

    if (!upsellSuggestion && patchOps !== null) {
      // 1. Zod: nur die 6 erlaubten Op-Typen, sonst Abweisung
      const opsParsed = PatchSchema.safeParse(patchOps)
      if (!opsParsed.success) {
        antwort = `${response}\n\n(Hinweis: Die vorgeschlagene Änderung hatte ein ungültiges Format und wurde NICHT übernommen. Bitte formulieren Sie den Wunsch noch einmal.)`
      } else {
        // 2. Leitplanken + Anwendung auf Kopie — ein Fehler weist alles ab.
        // Bild-Ops nur gegen die vorab geladene, erlaubte Asset-Menge.
        const bildMap = new Map<string, AufgeloestesBild>(
          editorAssets.map((a) => [a.id, { url: a.url, szeneTyp: a.szene_typ, quelle: a.quelle }])
        )
        // Baustein C §C.2: Plan-Gate serverseitig — nie nur UI.
        const ergebnis = applyPatch(currentConfig, opsParsed.data, bildMap, customerContext.paket)
        if (!ergebnis.ok) {
          antwort = `${response}\n\n(Die Änderung wurde NICHT übernommen: ${ergebnis.fehler.join(' ')})`
        } else {
          const { error: updateError } = await supabase
            .from('sites')
            .update({ draft_config: ergebnis.config, updated_at: new Date().toISOString() })
            .eq('id', params.siteId)

          if (!updateError) {
            angewendeteOps = opsParsed.data
            await supabase.from('config_versions').insert({
              site_id: params.siteId,
              config: ergebnis.config,
              created_by: 'chatbot',
              description: response.slice(0, 200),
            })
          } else {
            antwort = `${response}\n\n(Die Änderung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.)`
          }
        }
      }
    }

    await supabase.from('chat_messages').insert({
      site_id: params.siteId,
      role: 'assistant',
      content: antwort,
      config_changes: angewendeteOps,
    })

    // configChanges bleibt als Feldname erhalten (Frontend-Vertrag): truthy = Entwurf hat sich geändert
    return NextResponse.json({ response: antwort, configChanges: angewendeteOps, upsellSuggestion })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

// ============================================================
// Kunden-Kontext Builder
// ============================================================

async function buildCustomerContext(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createClient>,
  customer: Record<string, unknown>,
  site: Record<string, unknown>
): Promise<CustomerContext> {
  const paket = (site.package as PackageTier) || (customer.package as PackageTier) || 'starter'
  const pkg = getPackage(paket)

  // Aktive Upsells laden
  const { data: aktiveUpsells } = await supabase
    .from('activated_upsells')
    .select('upsell_id')
    .eq('customer_id', customer.id as string)
    .is('deaktiviert_am', null)

  // Kürzlich abgelehnte Upsells (Nerv-Schutz §10.4: 60 Tage)
  const nervSchutzAb = new Date()
  nervSchutzAb.setDate(nervSchutzAb.getDate() - NERV_SCHUTZ_TAGE)
  const { data: rejections } = await supabase
    .from('upsell_rejections')
    .select('upsell_id')
    .eq('customer_id', customer.id as string)
    .gte('rejected_at', nervSchutzAb.toISOString())

  // Seitenzahl berechnen
  const config = (site.draft_config || site.config) as SiteConfig
  let seitenzahl = 1
  if (isMultiPageConfig(config)) {
    seitenzahl = Object.keys(config.pages).filter((k) => !k.startsWith('legal-')).length
  }

  // Vertragsmonat berechnen
  const contractStart = customer.contract_start as string | undefined
  let vertragsmonat = 1
  if (contractStart) {
    const start = new Date(contractStart)
    const now = new Date()
    vertragsmonat = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000)) + 1)
  }

  return {
    kundenName: (customer.company_name as string) || 'Kunde',
    branche: (customer.branche as string) || 'Unbekannt',
    paket,
    aktuelleSeitenzahl: seitenzahl,
    maxSeiten: pkg.maxPages,
    aktiveUpsells: (aktiveUpsells || []).map((u) => u.upsell_id),
    vertragsmonat,
    vertragsMonate: (customer.contract_years as number || 4) * 12,
    abgelehntUpsellsLetzterMonat: (rejections || []).map((r) => r.upsell_id),
  }
}
