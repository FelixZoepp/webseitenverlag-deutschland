import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { renderTemplate } from '@/lib/template-renderer'
import { renderMultiPageSite } from '@/lib/multipage-renderer'
import { isPremiumTemplate, renderPremiumTemplate } from '@/lib/templates'
import { pruefeHtml } from '@/lib/qa'
import { offenePflichtSchritte, WizardStatus } from '@/lib/wizard'
import { SiteConfig, isMultiPageConfig } from '@/types'

/**
 * "Website fertigstellen" (§10.1 Schritt 6):
 * Pflicht-Schritte prüfen → Auto-QA auf gerendertem HTML → bei Erfolg
 * noindex aus, fertiggestellt_am setzen, Entwurf als Version sichern.
 * Sitemap-Einreichung + Domain-Connect folgen in Phase G (brauchen Domain).
 */
export async function POST(_request: Request, { params }: { params: { siteId: string } }) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response
    const { supabase, site } = result.data

    // 1. Pflicht-Schritte des Wizards
    const offen = offenePflichtSchritte((site.wizard_status as WizardStatus) || {})
    if (offen.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          hinweise: offen.map((s) => `Bitte zuerst den Schritt "${s.titel}" abschließen.`),
        },
        { status: 400 }
      )
    }

    // 2. Auto-QA auf gerendertem HTML (Entwurfsstand)
    const config = (site.draft_config || site.config) as SiteConfig
    const templateId = (site.template_id as string) || ''

    let html: string
    if (isPremiumTemplate(templateId)) {
      html = renderPremiumTemplate(templateId, config as unknown as Record<string, unknown>, params.siteId)
    } else if (isMultiPageConfig(config)) {
      const files = renderMultiPageSite(config, params.siteId)
      html = Object.values(files).join('\n')
    } else {
      html = renderTemplate(config, params.siteId)
    }

    const qa = pruefeHtml(html)
    if (!qa.ok) {
      return NextResponse.json({ ok: false, hinweise: qa.hinweise }, { status: 400 })
    }

    // 3. Live-final markieren: noindex aus, Zeitpunkt setzen, Entwurf übernehmen
    const jetzt = new Date().toISOString()
    const { error } = await supabase
      .from('sites')
      .update({
        config,
        noindex: false,
        fertiggestellt_am: jetzt,
        updated_at: jetzt,
      })
      .eq('id', params.siteId)

    if (error) {
      return NextResponse.json({ error: 'Fertigstellen fehlgeschlagen' }, { status: 500 })
    }

    await supabase.from('config_versions').insert({
      site_id: params.siteId,
      config,
      created_by: 'system',
      description: 'Website fertiggestellt (Wizard, Auto-QA bestanden)',
    })

    return NextResponse.json({ ok: true, fertiggestellt_am: jetzt })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
