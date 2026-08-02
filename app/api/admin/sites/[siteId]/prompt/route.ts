/**
 * Admin-Prompt: Kunden-Site per Anweisung anpassen.
 * Nutzt den gleichen Claude+Patch-Mechanismus wie der Kunden-Chat,
 * aber mit Admin-Auth und ohne Rate-Limit/Upsell-Vorschläge.
 */

import { requireAdmin } from '@/lib/auth-helpers'
import { chatWithClaude, type CustomerContext } from '@/lib/claude'
import { pruefeLlmSchranke } from '@/lib/llm-schranke'
import { getPackage, type PackageTier } from '@/lib/packages'
import { PatchSchema, applyPatch, formatiereBildListe, type AufgeloestesBild } from '@/lib/editor-ops'
import { getEditorAssets, type EditorAsset } from '@/lib/assets/repository'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { SiteConfig, isMultiPageConfig } from '@/types'

const PromptSchema = z.object({
  prompt: z.string().min(1, 'Anweisung darf nicht leer sein'),
  page: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const parsed = PromptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const schranke = await pruefeLlmSchranke('admin-prompt')
  if (!schranke.ok) {
    return NextResponse.json({ error: schranke.grund }, { status: schranke.status })
  }

  const supabase = createAdminClient()

  const { data: site, error: siteErr } = await supabase
    .from('sites')
    .select('*, customer_id')
    .eq('id', params.siteId)
    .single()

  if (siteErr || !site) {
    return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('company_name, package, branche, contract_start')
    .eq('id', site.customer_id)
    .single()

  const currentConfig = (site.draft_config || site.config) as SiteConfig
  const isMultiPage = isMultiPageConfig(currentConfig)
  const paket = (site.package as PackageTier) || (customer?.package as PackageTier) || 'business'
  const pkg = getPackage(paket)

  const customerContext: CustomerContext = {
    kundenName: (customer?.company_name as string) || 'Kunde',
    branche: (customer?.branche as string) || 'Unbekannt',
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
    editorAssets = await getEditorAssets(supabase, {
      branche: customerContext.branche.toLowerCase(),
      siteId: params.siteId,
    })
  } catch { /* ok */ }

  const chatMessages = [{ role: 'user' as const, content: parsed.data.prompt }]

  const { response, patchOps } = await chatWithClaude(
    chatMessages,
    currentConfig,
    isMultiPage ? parsed.data.page || 'home' : undefined,
    customerContext,
    formatiereBildListe(editorAssets)
  )

  let ergebnis_text = response
  let angewendet = false

  if (patchOps !== null) {
    const opsParsed = PatchSchema.safeParse(patchOps)
    if (opsParsed.success) {
      const bildMap = new Map<string, AufgeloestesBild>(
        editorAssets.map((a) => [a.id, { url: a.url, szeneTyp: a.szene_typ, quelle: a.quelle }])
      )
      const patchResult = applyPatch(currentConfig, opsParsed.data, bildMap, paket)
      if (patchResult.ok) {
        await supabase
          .from('sites')
          .update({ draft_config: patchResult.config, updated_at: new Date().toISOString() })
          .eq('id', params.siteId)

        await supabase.from('config_versions').insert({
          site_id: params.siteId,
          config: patchResult.config,
          created_by: 'admin-prompt',
          description: `Admin: ${parsed.data.prompt.slice(0, 200)}`,
        })

        angewendet = true
      } else {
        ergebnis_text = `${response}\n\n(Patch-Fehler: ${patchResult.fehler.join(' ')})`
      }
    } else {
      ergebnis_text = `${response}\n\n(Ungültiges Patch-Format — nicht angewendet)`
    }
  }

  return NextResponse.json({ response: ergebnis_text, applied: angewendet })
}
