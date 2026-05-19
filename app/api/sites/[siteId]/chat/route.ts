import { getOwnedSite } from '@/lib/api-helpers'
import { chatWithClaude, type CustomerContext } from '@/lib/claude'
import { getPackage, type PackageTier } from '@/lib/packages'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { SiteConfig, isMultiPageConfig } from '@/types'

const ChatSchema = z.object({
  message: z.string().min(1, 'Nachricht darf nicht leer sein'),
  currentPage: z.string().optional(),
})

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

    const { response, configChanges, upsellSuggestion } = await chatWithClaude(
      chatMessages,
      currentConfig,
      isMultiPage ? currentPage || 'home' : undefined,
      customerContext
    )

    // If upsell was suggested, do NOT apply config changes — wait for customer decision
    const effectiveConfigChanges = upsellSuggestion ? null : configChanges

    await supabase.from('chat_messages').insert({
      site_id: params.siteId,
      role: 'assistant',
      content: response,
      config_changes: effectiveConfigChanges,
    })

    if (effectiveConfigChanges) {
      let mergedConfig: SiteConfig

      if (isMultiPage && isMultiPageConfig(currentConfig)) {
        mergedConfig = applyMultiPageChanges(currentConfig as unknown as Record<string, unknown>, effectiveConfigChanges, currentPage || 'home')
      } else {
        mergedConfig = { ...currentConfig, ...effectiveConfigChanges }
      }

      await supabase
        .from('sites')
        .update({ draft_config: mergedConfig, updated_at: new Date().toISOString() })
        .eq('id', params.siteId)

      await supabase.from('config_versions').insert({
        site_id: params.siteId,
        config: mergedConfig,
        created_by: 'chatbot',
        description: response.slice(0, 200),
      })
    }

    return NextResponse.json({ response, configChanges: effectiveConfigChanges, upsellSuggestion })
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

  // Kürzlich abgelehnte Upsells (letzte 30 Tage)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: rejections } = await supabase
    .from('upsell_rejections')
    .select('upsell_id')
    .eq('customer_id', customer.id as string)
    .gte('rejected_at', thirtyDaysAgo.toISOString())

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

// ============================================================
// Config-Merge Helpers (unverändert)
// ============================================================

function applyMultiPageChanges(
  config: Record<string, unknown>,
  changes: Record<string, unknown>,
  currentPage: string
): SiteConfig {
  const result = JSON.parse(JSON.stringify(config))

  if (changes.site) {
    result.site = deepMerge(result.site || {}, changes.site as Record<string, unknown>)
  }

  if (changes.pages) {
    const pageChanges = changes.pages as Record<string, unknown>
    if (!result.pages) result.pages = {}
    for (const [key, val] of Object.entries(pageChanges)) {
      if (result.pages[key]) {
        result.pages[key] = deepMerge(result.pages[key], val as Record<string, unknown>)
      }
    }
  }

  const nonMetaKeys = Object.keys(changes).filter((k) => k !== 'site' && k !== 'pages')
  if (nonMetaKeys.length > 0 && result.pages?.[currentPage]) {
    const pageConfig = result.pages[currentPage].config || {}
    for (const key of nonMetaKeys) {
      pageConfig[key] = changes[key]
    }
    result.pages[currentPage].config = pageConfig
  }

  return result as SiteConfig
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
    } else {
      result[key] = source[key]
    }
  }
  return result
}
