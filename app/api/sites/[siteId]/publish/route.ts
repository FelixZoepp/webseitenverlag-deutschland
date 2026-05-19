import { getOwnedSite } from '@/lib/api-helpers'
import { renderTemplate } from '@/lib/template-renderer'
import { renderMultiPageSite } from '@/lib/multipage-renderer'
import { isPremiumTemplate, renderPremiumTemplate } from '@/lib/templates'
import { deployToCloudflarePages, deployMultiPageToCloudflare, createPagesProject } from '@/lib/cloudflare'
import { NextResponse } from 'next/server'
import { SiteConfig, isMultiPageConfig } from '@/types'

export async function POST(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, customer, site } = result.data

    if (!customer.cloudflare_account_id || !customer.cloudflare_api_token) {
      return NextResponse.json(
        { error: 'Cloudflare-Zugangsdaten fehlen. Bitte im Profil hinterlegen.' },
        { status: 400 }
      )
    }

    const credentials = {
      accountId: customer.cloudflare_account_id,
      apiToken: customer.cloudflare_api_token,
    }

    const projectName = (site.cloudflare_project_name as string) || `site-${(site.id as string).slice(0, 8)}`
    const config = (site.draft_config || site.config) as SiteConfig

    const projectResult = await createPagesProject(credentials, projectName)
    if (!projectResult.success) {
      return NextResponse.json(
        { error: `Cloudflare-Projekt konnte nicht erstellt werden: ${projectResult.error}` },
        { status: 500 }
      )
    }

    const templateId = (site.template_id as string) || ''

    let deployResult
    if (isPremiumTemplate(templateId)) {
      const html = renderPremiumTemplate(templateId, config as unknown as Record<string, unknown>, params.siteId)
      deployResult = await deployToCloudflarePages(credentials, projectName, html)
    } else if (isMultiPageConfig(config)) {
      const files = renderMultiPageSite(config, params.siteId)
      deployResult = await deployMultiPageToCloudflare(credentials, projectName, files)
    } else {
      const html = renderTemplate(config, params.siteId)
      deployResult = await deployToCloudflarePages(credentials, projectName, html)
    }

    if (!deployResult.success) {
      await supabase
        .from('sites')
        .update({ status: 'error', updated_at: new Date().toISOString() })
        .eq('id', params.siteId)

      return NextResponse.json(
        { error: `Deploy fehlgeschlagen: ${deployResult.error}` },
        { status: 500 }
      )
    }

    await supabase
      .from('sites')
      .update({
        config,
        status: 'published',
        cloudflare_project_name: projectName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.siteId)

    await supabase.from('config_versions').insert({
      site_id: params.siteId,
      config,
      created_by: 'system',
      description: 'Veröffentlicht',
    })

    return NextResponse.json({ success: true, url: deployResult.url })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
